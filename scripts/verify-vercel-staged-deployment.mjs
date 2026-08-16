import { pathToFileURL } from "node:url";

const DEFAULT_API_BASE_URL = "https://api.vercel.com";
const DEFAULT_TIMEOUT_MS = 10_000;
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;
const PROJECT_ID_PATTERN = /^prj_[A-Za-z0-9]+$/;
const TEAM_ID_PATTERN = /^team_[A-Za-z0-9]+$/;

export class VercelStagedDeploymentError extends Error {
  constructor(code, details = {}) {
    super(code);
    this.name = "VercelStagedDeploymentError";
    this.code = code;
    this.details = details;
  }
}

function requiredString(value, code) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) throw new VercelStagedDeploymentError(code);
  return normalized;
}

function normalizeSha(value) {
  const sha = requiredString(value, "invalid_expected_sha").toLowerCase();
  if (!GIT_SHA_PATTERN.test(sha)) {
    throw new VercelStagedDeploymentError("invalid_expected_sha");
  }
  return sha;
}

function normalizeProjectId(value) {
  const projectId = requiredString(value, "invalid_project_id");
  if (!PROJECT_ID_PATTERN.test(projectId)) {
    throw new VercelStagedDeploymentError("invalid_project_id");
  }
  return projectId;
}

function normalizeTeamId(value) {
  const teamId = requiredString(value, "invalid_team_id");
  if (!TEAM_ID_PATTERN.test(teamId)) {
    throw new VercelStagedDeploymentError("invalid_team_id");
  }
  return teamId;
}

function normalizeApiBaseUrl(value) {
  let url;
  try {
    url = new URL(value ?? DEFAULT_API_BASE_URL);
  } catch {
    throw new VercelStagedDeploymentError("invalid_api_base_url");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new VercelStagedDeploymentError("invalid_api_base_url");
  }

  url.pathname = url.pathname.replace(/\/$/, "");
  return url;
}

function normalizeDeploymentLocator(value) {
  const locator = requiredString(value, "invalid_deployment_locator");

  if (/^dpl_[A-Za-z0-9]+$/.test(locator)) return locator;

  let url;
  try {
    url = new URL(locator.includes("://") ? locator : `https://${locator}`);
  } catch {
    throw new VercelStagedDeploymentError("invalid_deployment_locator");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !url.hostname.endsWith(".vercel.app")
  ) {
    throw new VercelStagedDeploymentError("invalid_deployment_locator");
  }

  return url.hostname;
}

function normalizeForbiddenDomains(values) {
  if (values === undefined) return [];
  const domains = Array.isArray(values) ? values : [values];

  return domains.map((value) => {
    const domain = requiredString(value, "invalid_forbidden_domain").toLowerCase();
    if (!/^[a-z0-9.-]+$/.test(domain) || domain.startsWith(".") || domain.endsWith(".")) {
      throw new VercelStagedDeploymentError("invalid_forbidden_domain");
    }
    return domain;
  });
}

function positiveInteger(value, code) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new VercelStagedDeploymentError(code);
  }
  return value;
}

function pickGitSha(deployment) {
  const metadataSha = deployment?.meta?.githubCommitSha;
  const gitSourceSha = deployment?.gitSource?.sha;
  const normalizedMetadataSha =
    typeof metadataSha === "string" && GIT_SHA_PATTERN.test(metadataSha)
      ? metadataSha.toLowerCase()
      : null;
  const normalizedGitSourceSha =
    typeof gitSourceSha === "string" && GIT_SHA_PATTERN.test(gitSourceSha)
      ? gitSourceSha.toLowerCase()
      : null;

  if (
    normalizedMetadataSha &&
    normalizedGitSourceSha &&
    normalizedMetadataSha !== normalizedGitSourceSha
  ) {
    throw new VercelStagedDeploymentError("conflicting_git_sha_metadata");
  }

  return normalizedMetadataSha ?? normalizedGitSourceSha;
}

function deploymentAliases(deployment) {
  if (!Array.isArray(deployment?.alias)) return [];
  return deployment.alias
    .map((alias) => (typeof alias === "string" ? alias.trim().toLowerCase() : ""))
    .filter(Boolean);
}

function validateDeploymentContract({ deployment, expectedSha, projectId, forbiddenDomains }) {
  if (typeof deployment !== "object" || deployment === null || Array.isArray(deployment)) {
    throw new VercelStagedDeploymentError("invalid_deployment_contract");
  }

  const deploymentId = deployment.id ?? deployment.uid;
  if (typeof deploymentId !== "string" || !/^dpl_[A-Za-z0-9]+$/.test(deploymentId)) {
    throw new VercelStagedDeploymentError("invalid_deployment_id");
  }

  const actualProjectId = deployment.projectId ?? deployment.project?.id;
  if (actualProjectId !== projectId) {
    throw new VercelStagedDeploymentError("project_mismatch", { deploymentId });
  }

  const readyState = deployment.readyState ?? deployment.state;
  if (readyState !== "READY") {
    throw new VercelStagedDeploymentError("deployment_not_ready", {
      deploymentId,
      readyState: typeof readyState === "string" ? readyState : "unknown",
    });
  }

  if (deployment.target !== "production") {
    throw new VercelStagedDeploymentError("deployment_not_production_target", { deploymentId });
  }

  const actualSha = pickGitSha(deployment);
  if (!actualSha) {
    throw new VercelStagedDeploymentError("deployment_sha_missing", { deploymentId });
  }
  if (actualSha !== expectedSha) {
    throw new VercelStagedDeploymentError("deployment_sha_mismatch", {
      deploymentId,
      actualSha,
    });
  }

  const aliases = deploymentAliases(deployment);
  const forbiddenAlias = aliases.find((alias) => forbiddenDomains.includes(alias));
  if (forbiddenAlias) {
    throw new VercelStagedDeploymentError("production_domain_already_assigned", {
      deploymentId,
      alias: forbiddenAlias,
    });
  }

  const deploymentUrl =
    typeof deployment.url === "string" && deployment.url.endsWith(".vercel.app")
      ? `https://${deployment.url}`
      : null;
  if (!deploymentUrl) {
    throw new VercelStagedDeploymentError("deployment_url_missing", { deploymentId });
  }

  return Object.freeze({
    status: "verified",
    deploymentId,
    deploymentUrl,
    expectedSha,
    projectId,
    readyState: "READY",
    target: "production",
  });
}

export async function verifyVercelStagedDeployment({
  deployment,
  expectedSha,
  projectId,
  teamId,
  token,
  forbiddenDomains = [],
  fetchImpl = globalThis.fetch,
  apiBaseUrl = DEFAULT_API_BASE_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new VercelStagedDeploymentError("fetch_unavailable");
  }

  const normalizedDeployment = normalizeDeploymentLocator(deployment);
  const normalizedExpectedSha = normalizeSha(expectedSha);
  const normalizedProjectId = normalizeProjectId(projectId);
  const normalizedTeamId = normalizeTeamId(teamId);
  const normalizedToken = requiredString(token, "token_missing");
  const normalizedForbiddenDomains = normalizeForbiddenDomains(forbiddenDomains);
  const normalizedApiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);
  const normalizedTimeoutMs = positiveInteger(timeoutMs, "invalid_timeout");

  const requestUrl = new URL(
    `/v13/deployments/${encodeURIComponent(normalizedDeployment)}`,
    `${normalizedApiBaseUrl.href}/`,
  );
  requestUrl.searchParams.set("teamId", normalizedTeamId);
  requestUrl.searchParams.set("withGitRepoInfo", "true");

  let response;
  try {
    response = await fetchImpl(requestUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${normalizedToken}`,
      },
      redirect: "error",
      signal: AbortSignal.timeout(normalizedTimeoutMs),
    });
  } catch {
    throw new VercelStagedDeploymentError("deployment_lookup_failed");
  }

  if (response.status !== 200) {
    throw new VercelStagedDeploymentError("deployment_lookup_http_status", {
      httpStatus: response.status,
    });
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new VercelStagedDeploymentError("deployment_lookup_invalid_json");
  }

  return validateDeploymentContract({
    deployment: body,
    expectedSha: normalizedExpectedSha,
    projectId: normalizedProjectId,
    forbiddenDomains: normalizedForbiddenDomains,
  });
}

function parseCliArguments(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new VercelStagedDeploymentError("invalid_arguments");
    }
    values.set(key.slice(2), value);
  }

  const timeoutRaw = values.get("timeout-ms");
  const timeoutMs = timeoutRaw === undefined ? DEFAULT_TIMEOUT_MS : Number(timeoutRaw);
  const forbiddenDomains = (values.get("forbidden-domains") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    deployment: values.get("deployment"),
    expectedSha: values.get("expected-sha"),
    projectId: values.get("project-id"),
    teamId: values.get("team-id"),
    token: process.env.VERCEL_API_TOKEN,
    forbiddenDomains,
    timeoutMs,
  };
}

async function main() {
  try {
    const result = await verifyVercelStagedDeployment(parseCliArguments(process.argv.slice(2)));
    process.stdout.write(
      `[vercel-staged-deployment] verified deployment=${result.deploymentId} sha=${result.expectedSha} target=${result.target}\n`,
    );
  } catch (error) {
    const code =
      error instanceof VercelStagedDeploymentError ? error.code : "unexpected_failure";
    const httpStatus =
      error instanceof VercelStagedDeploymentError ? error.details.httpStatus : undefined;
    const suffix = httpStatus === undefined ? "" : ` http=${httpStatus}`;
    process.stderr.write(`[vercel-staged-deployment] failed code=${code}${suffix}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
