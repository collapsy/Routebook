import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(dirname, "..");
const manifestPath = path.join(repositoryRoot, "apps/web/data/pipa-place-images.json");
const publicRoot = path.join(repositoryRoot, "apps/web/public");
const commonsApiUrl = "https://commons.wikimedia.org/w/api.php";
const maximumAssetBytes = 3 * 1024 * 1024;
const maximumRetryDelayMs = 30_000;
const maximumRetries = 3;
const politeDelayBetweenAssetsMs = 500;
const userAgent = "RouteBookPlaceImageBot/0.1 (https://github.com/collapsy/Routebook)";
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedLicensePattern = /^CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)$/i;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stripHtml(value) {
  return text(value)
    .replace(/<[^>]*>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeIdentity(value) {
  return text(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function assertHttpsHost(value, expectedHost, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} inválida.`);
  }
  if (url.protocol !== "https:" || url.hostname !== expectedHost) {
    throw new Error(`${label} deve usar HTTPS em ${expectedHost}.`);
  }
  return url;
}

function canonicalCommonsTitleFromUrl(value) {
  const url = assertHttpsHost(value, "commons.wikimedia.org", "URL de Provenance");
  const prefix = "/wiki/";
  if (!url.pathname.startsWith(prefix)) throw new Error("URL de Provenance não aponta a /wiki/.");
  return decodeURIComponent(url.pathname.slice(prefix.length)).replaceAll("_", " ");
}

function assetFilePath(assetPath) {
  if (!/^\/place-images\/pipa\/[a-z0-9-]+\.(?:jpg|png|webp)$/.test(assetPath)) {
    throw new Error(`assetPath fora do contrato do RB-INC-143: ${assetPath}`);
  }
  const resolved = path.resolve(publicRoot, `.${assetPath}`);
  if (!resolved.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error(`assetPath escapou do public root: ${assetPath}`);
  }
  return resolved;
}

function defaultSleep(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function retryDelayMilliseconds(response, attempt) {
  const retryAfter = text(response.headers.get("retry-after"));
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(maximumRetryDelayMs, Math.max(250, Math.ceil(seconds * 1_000)));
    }
    const retryDate = Date.parse(retryAfter);
    if (Number.isFinite(retryDate)) {
      return Math.min(maximumRetryDelayMs, Math.max(250, retryDate - Date.now()));
    }
  }
  return Math.min(maximumRetryDelayMs, 1_000 * 2 ** attempt);
}

async function fetchWithRespectfulRetry(url, init, { fetcher, sleep, retries = maximumRetries }) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetcher(url, init);
    if (![429, 503].includes(response.status) || attempt === retries) return response;
    await sleep(retryDelayMilliseconds(response, attempt));
  }
  throw new Error("Retry loop inválido.");
}

export function validatePlaceImageManifest(manifest, { requireIntegrity = false } = {}) {
  if (!manifest || manifest.version !== 1 || manifest.provider !== "wikimedia-commons") {
    throw new Error("Manifesto de imagens de Pipa inválido.");
  }
  if (
    !Number.isInteger(manifest.requestedWidth) ||
    manifest.requestedWidth < 320 ||
    manifest.requestedWidth > 1600
  ) {
    throw new Error("requestedWidth deve estar entre 320 e 1600 pixels.");
  }
  if (
    !Array.isArray(manifest.entries) ||
    manifest.entries.length < 1 ||
    manifest.entries.length > 20
  ) {
    throw new Error("Manifesto deve possuir entre 1 e 20 entradas curadas.");
  }

  const slugs = new Set();
  const assets = new Set();
  const titles = new Set();
  for (const entry of manifest.entries) {
    if (!/^[a-z0-9-]+$/.test(text(entry.placeSlug))) {
      throw new Error("placeSlug inválido no manifesto.");
    }
    if (!text(entry.fileTitle).startsWith("File:")) {
      throw new Error(`fileTitle inválido para ${entry.placeSlug}.`);
    }
    if (canonicalCommonsTitleFromUrl(entry.sourcePageUrl) !== entry.fileTitle) {
      throw new Error(`sourcePageUrl não corresponde ao fileTitle de ${entry.placeSlug}.`);
    }
    if (!text(entry.expectedAuthor)) throw new Error(`Autor ausente para ${entry.placeSlug}.`);
    if (!allowedLicensePattern.test(text(entry.license))) {
      throw new Error(`Licença não permitida para ${entry.placeSlug}: ${entry.license}`);
    }
    const licenseUrl = assertHttpsHost(
      entry.licenseUrl,
      "creativecommons.org",
      `URL de licença de ${entry.placeSlug}`,
    );
    if (!licenseUrl.pathname.startsWith("/licenses/")) {
      throw new Error(`URL de licença fora do namespace Creative Commons para ${entry.placeSlug}.`);
    }
    assetFilePath(entry.assetPath);
    if (text(entry.altText).length < 20)
      throw new Error(`altText insuficiente para ${entry.placeSlug}.`);
    if (entry.matchStatus !== "secure") {
      throw new Error(`Somente correspondência secure pode ser materializada: ${entry.placeSlug}.`);
    }
    if (text(entry.matchEvidence).length < 20) {
      throw new Error(`Evidência de correspondência insuficiente para ${entry.placeSlug}.`);
    }
    if (slugs.has(entry.placeSlug) || assets.has(entry.assetPath) || titles.has(entry.fileTitle)) {
      throw new Error(`Entrada duplicada no manifesto: ${entry.placeSlug}.`);
    }
    slugs.add(entry.placeSlug);
    assets.add(entry.assetPath);
    titles.add(entry.fileTitle);

    if (requireIntegrity) {
      if (!/^[a-z0-9]{20,64}$/i.test(text(entry.sourceSha1))) {
        throw new Error(`sourceSha1 ausente/inválido para ${entry.placeSlug}.`);
      }
      if (!/^[a-f0-9]{64}$/.test(text(entry.assetSha256))) {
        throw new Error(`assetSha256 ausente/inválido para ${entry.placeSlug}.`);
      }
      if (
        !Number.isInteger(entry.assetBytes) ||
        entry.assetBytes <= 0 ||
        entry.assetBytes > maximumAssetBytes
      ) {
        throw new Error(`assetBytes ausente/inválido para ${entry.placeSlug}.`);
      }
    }
  }
  return manifest;
}

export function parseCommonsImageInfo(payload, entry, requestedWidth = 1280) {
  const page = payload?.query?.pages?.[0];
  const info = page?.imageinfo?.[0];
  if (!page || page.missing || !info) {
    throw new Error(`Arquivo Commons não encontrado: ${entry.fileTitle}.`);
  }
  if (page.title !== entry.fileTitle) {
    throw new Error(`Commons resolveu título inesperado para ${entry.placeSlug}: ${page.title}.`);
  }

  const descriptionUrl = text(info.descriptionurl);
  if (canonicalCommonsTitleFromUrl(descriptionUrl) !== entry.fileTitle) {
    throw new Error(`Provenance retornada diverge do manifesto para ${entry.placeSlug}.`);
  }
  const mime = text(info.mime);
  if (!allowedMimeTypes.has(mime)) {
    throw new Error(`MIME não permitido para ${entry.placeSlug}: ${mime}.`);
  }

  const metadata = info.extmetadata ?? {};
  const artist = stripHtml(metadata.Artist?.value);
  const license = stripHtml(metadata.LicenseShortName?.value);
  const licenseUrl = stripHtml(metadata.LicenseUrl?.value);
  if (!artist || !normalizeIdentity(artist).includes(normalizeIdentity(entry.expectedAuthor))) {
    throw new Error(`Autor retornado não corresponde ao manifesto para ${entry.placeSlug}.`);
  }
  if (!license || !normalizeIdentity(license).includes(normalizeIdentity(entry.license))) {
    throw new Error(`Licença retornada diverge do manifesto para ${entry.placeSlug}: ${license}.`);
  }
  if (licenseUrl) {
    const actualLicense = assertHttpsHost(
      licenseUrl,
      "creativecommons.org",
      `URL de licença retornada para ${entry.placeSlug}`,
    );
    const expectedLicense = new URL(entry.licenseUrl);
    if (actualLicense.pathname.replace(/\/$/, "") !== expectedLicense.pathname.replace(/\/$/, "")) {
      throw new Error(`URL de licença retornada diverge do manifesto para ${entry.placeSlug}.`);
    }
  }

  const width = Number(info.width);
  const originalUrl = text(info.url);
  const thumbnailUrl = text(info.thumburl);
  assertHttpsHost(originalUrl, "upload.wikimedia.org", `URL original de ${entry.placeSlug}`);
  if (thumbnailUrl) {
    assertHttpsHost(thumbnailUrl, "upload.wikimedia.org", `URL de thumbnail de ${entry.placeSlug}`);
  }
  const downloadUrl =
    Number.isFinite(width) && width <= requestedWidth ? originalUrl : thumbnailUrl;
  if (!downloadUrl) {
    throw new Error(`Commons não forneceu thumbnail limitada para ${entry.placeSlug}.`);
  }

  const sourceSha1 = text(info.sha1);
  if (!sourceSha1) throw new Error(`Commons não forneceu SHA-1 para ${entry.placeSlug}.`);

  return {
    downloadUrl,
    mime,
    sourceSha1,
    artist,
    license,
    descriptionUrl,
  };
}

export function assertImageBytes(buffer, mime, label = "asset") {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12 || buffer.length > maximumAssetBytes) {
    throw new Error(`${label} possui tamanho inválido.`);
  }
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";
  const matches =
    (mime === "image/jpeg" && isJpeg) ||
    (mime === "image/png" && isPng) ||
    (mime === "image/webp" && isWebp);
  if (!matches) throw new Error(`${label} não corresponde ao MIME ${mime}.`);
}

export async function verifyPlaceImageAssets(manifest, { readAsset = readFile } = {}) {
  validatePlaceImageManifest(manifest, { requireIntegrity: true });
  for (const entry of manifest.entries) {
    const filePath = assetFilePath(entry.assetPath);
    const buffer = await readAsset(filePath);
    const extension = path.extname(entry.assetPath);
    const mime =
      extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
    assertImageBytes(buffer, mime, entry.placeSlug);
    const digest = createHash("sha256").update(buffer).digest("hex");
    if (digest !== entry.assetSha256) throw new Error(`SHA-256 diverge para ${entry.placeSlug}.`);
    if (buffer.length !== entry.assetBytes)
      throw new Error(`Tamanho diverge para ${entry.placeSlug}.`);
  }
}

async function fetchJson(url, { fetcher, sleep }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetchWithRespectfulRetry(
      url,
      {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": userAgent,
          "Api-User-Agent": userAgent,
        },
      },
      { fetcher, sleep },
    );
    if (!response.ok) throw new Error(`Wikimedia Commons respondeu ${response.status}.`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function downloadImage(url, expectedMime, { fetcher, sleep }) {
  assertHttpsHost(url, "upload.wikimedia.org", "URL de download");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetchWithRespectfulRetry(
      url,
      {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": userAgent },
      },
      { fetcher, sleep },
    );
    if (!response.ok) throw new Error(`Download Commons respondeu ${response.status}.`);
    const contentType = text(response.headers.get("content-type")).split(";")[0];
    if (contentType && contentType !== expectedMime) {
      throw new Error(`MIME do download diverge: ${contentType} != ${expectedMime}.`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    assertImageBytes(buffer, expectedMime, "download Commons");
    return buffer;
  } finally {
    clearTimeout(timeout);
  }
}

export async function materializePlaceImages(
  manifest,
  { fetcher = fetch, sleep = defaultSleep, writeAsset = writeFile, ensureDirectory = mkdir } = {},
) {
  validatePlaceImageManifest(manifest);
  const entries = [];
  for (const entry of manifest.entries) {
    const query = new URLSearchParams({
      action: "query",
      format: "json",
      formatversion: "2",
      maxlag: "1",
      titles: entry.fileTitle,
      prop: "imageinfo",
      iiprop: "url|size|mime|sha1|extmetadata",
      iiurlwidth: String(manifest.requestedWidth),
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ImageDescription|Credit",
      origin: "*",
    });
    const payload = await fetchJson(`${commonsApiUrl}?${query}`, { fetcher, sleep });
    const info = parseCommonsImageInfo(payload, entry, manifest.requestedWidth);
    const buffer = await downloadImage(info.downloadUrl, info.mime, { fetcher, sleep });
    const filePath = assetFilePath(entry.assetPath);
    await ensureDirectory(path.dirname(filePath), { recursive: true });
    await writeAsset(filePath, buffer);
    entries.push({
      ...entry,
      sourceSha1: info.sourceSha1,
      assetSha256: createHash("sha256").update(buffer).digest("hex"),
      assetBytes: buffer.length,
    });
    await sleep(politeDelayBetweenAssetsMs);
  }
  return { ...manifest, entries };
}

async function loadManifest() {
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

async function main() {
  const mode = process.argv[2] ?? "--verify";
  if (!["--verify", "--materialize"].includes(mode)) {
    throw new Error("Use --verify ou --materialize.");
  }
  const manifest = await loadManifest();
  if (mode === "--materialize") {
    const materialized = await materializePlaceImages(manifest);
    await writeFile(manifestPath, `${JSON.stringify(materialized, null, 2)}\n`, "utf8");
    await verifyPlaceImageAssets(materialized);
    console.log(`Materializadas ${materialized.entries.length} imagens curadas de Pipa.`);
    return;
  }
  await verifyPlaceImageAssets(manifest);
  console.log(`Verificadas ${manifest.entries.length} imagens curadas de Pipa sem acesso à rede.`);
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
