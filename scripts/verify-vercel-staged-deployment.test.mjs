import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  VercelStagedDeploymentError,
  verifyVercelStagedDeployment,
} from "./verify-vercel-staged-deployment.mjs";

const candidate = "abcdef0123456789abcdef0123456789abcdef01";
const otherSha = "0123456789abcdef0123456789abcdef01234567";
const projectId = "prj_o7utdxB9SymdCL56AOH57B64NRec";
const teamId = "team_Vj5YB1D4TkH2S3nLeQnjrRog";
const token = "test-token-never-logged";
const deploymentId = "dpl_ABC123xyz";
const deploymentHost = "routebook-staged-rnd10.vercel.app";

function deployment(overrides = {}) {
  return {
    id: deploymentId,
    projectId,
    readyState: "READY",
    target: "production",
    url: deploymentHost,
    alias: [],
    meta: { githubCommitSha: candidate },
    gitSource: { sha: candidate, ref: "main" },
    ...overrides,
  };
}

function fetchJson(body, status = 200) {
  const requests = [];
  const fetchImpl = async (url, init) => {
    requests.push({ url: String(url), init });
    return Response.json(body, { status });
  };
  return { requests, fetchImpl };
}

function baseOptions(fetchImpl) {
  return {
    deployment: `https://${deploymentHost}`,
    expectedSha: candidate,
    projectId,
    teamId,
    token,
    forbiddenDomains: ["routebook-one.vercel.app", "routebook-rnd10.vercel.app"],
    fetchImpl,
    timeoutMs: 1,
  };
}

test("aceita staged Production Deployment READY do projeto e SHA exatos", async () => {
  const { requests, fetchImpl } = fetchJson(deployment());
  const result = await verifyVercelStagedDeployment(baseOptions(fetchImpl));

  assert.deepEqual(result, {
    status: "verified",
    deploymentId,
    deploymentUrl: `https://${deploymentHost}`,
    expectedSha: candidate,
    projectId,
    readyState: "READY",
    target: "production",
  });
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /\/v13\/deployments\/routebook-staged-rnd10\.vercel\.app/);
  assert.match(requests[0].url, /teamId=team_Vj5YB1D4TkH2S3nLeQnjrRog/);
  assert.match(requests[0].url, /withGitRepoInfo=true/);
  assert.equal(requests[0].init.headers.authorization, `Bearer ${token}`);
});

test("rejeita SHA divergente", async () => {
  const { fetchImpl } = fetchJson(
    deployment({ meta: { githubCommitSha: otherSha }, gitSource: { sha: otherSha, ref: "main" } }),
  );

  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(fetchImpl)),
    (error) =>
      error instanceof VercelStagedDeploymentError && error.code === "deployment_sha_mismatch",
  );
});

test("rejeita metadata Git conflitante", async () => {
  const { fetchImpl } = fetchJson(
    deployment({ meta: { githubCommitSha: candidate }, gitSource: { sha: otherSha, ref: "main" } }),
  );

  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(fetchImpl)),
    (error) =>
      error instanceof VercelStagedDeploymentError && error.code === "conflicting_git_sha_metadata",
  );
});

test("rejeita deployment de outro projeto", async () => {
  const { fetchImpl } = fetchJson(deployment({ projectId: "prj_other123" }));

  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(fetchImpl)),
    (error) => error instanceof VercelStagedDeploymentError && error.code === "project_mismatch",
  );
});

test("rejeita Preview e deployment ainda não READY", async () => {
  const previewFetch = fetchJson(deployment({ target: null })).fetchImpl;
  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(previewFetch)),
    (error) =>
      error instanceof VercelStagedDeploymentError &&
      error.code === "deployment_not_production_target",
  );

  const buildingFetch = fetchJson(deployment({ readyState: "BUILDING" })).fetchImpl;
  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(buildingFetch)),
    (error) =>
      error instanceof VercelStagedDeploymentError && error.code === "deployment_not_ready",
  );
});

test("rejeita staged deployment que já recebeu domínio público", async () => {
  const { fetchImpl } = fetchJson(
    deployment({ alias: ["routebook-one.vercel.app", "routebook-staged-rnd10.vercel.app"] }),
  );

  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(fetchImpl)),
    (error) =>
      error instanceof VercelStagedDeploymentError &&
      error.code === "production_domain_already_assigned",
  );
});

test("falha fechado em erro HTTP e JSON inválido sem expor body", async () => {
  const httpFetch = async () => new Response("forbidden", { status: 403 });
  await assert.rejects(verifyVercelStagedDeployment(baseOptions(httpFetch)), (error) => {
    assert.ok(error instanceof VercelStagedDeploymentError);
    assert.equal(error.code, "deployment_lookup_http_status");
    assert.equal(error.details.httpStatus, 403);
    assert.equal(JSON.stringify(error.details).includes("forbidden"), false);
    return true;
  });

  const invalidJsonFetch = async () => new Response("not-json", { status: 200 });
  await assert.rejects(
    verifyVercelStagedDeployment(baseOptions(invalidJsonFetch)),
    (error) =>
      error instanceof VercelStagedDeploymentError &&
      error.code === "deployment_lookup_invalid_json",
  );
});

test("valida inputs antes de consultar a rede e exige token", async () => {
  let requests = 0;
  const fetchImpl = async () => {
    requests += 1;
    return Response.json(deployment());
  };

  await assert.rejects(
    verifyVercelStagedDeployment({ ...baseOptions(fetchImpl), expectedSha: "invalid" }),
    (error) =>
      error instanceof VercelStagedDeploymentError && error.code === "invalid_expected_sha",
  );
  await assert.rejects(
    verifyVercelStagedDeployment({ ...baseOptions(fetchImpl), token: "" }),
    (error) => error instanceof VercelStagedDeploymentError && error.code === "token_missing",
  );
  await assert.rejects(
    verifyVercelStagedDeployment({ ...baseOptions(fetchImpl), deployment: "https://example.com" }),
    (error) =>
      error instanceof VercelStagedDeploymentError && error.code === "invalid_deployment_locator",
  );

  assert.equal(requests, 0);
});

test("Production Release exige autorização manual e staged deployment governado", () => {
  const workflow = readFileSync(".github/workflows/production-release.yml", "utf8");

  assert.match(workflow, /^\s*workflow_dispatch:\s*$/m);
  assert.doesNotMatch(workflow, /^\s*workflow_run:\s*$/m);
  assert.doesNotMatch(workflow, /^\s*push:\s*$/m);
  assert.doesNotMatch(workflow, /^\s*pull_request:\s*$/m);

  assert.match(workflow, /confirm_production_promotion:/);
  assert.match(workflow, /CONFIRM_PROMOTION:/);
  assert.match(workflow, /if \[\[ "\$CONFIRM_PROMOTION" != "true" \]\]; then/);
  assert.match(workflow, /event: "push"/);
  assert.match(workflow, /conclusion === "success"/);

  assert.match(workflow, /^\s*VERCEL_CLI_VERSION: 58\.4\.0\s*$/m);
  assert.doesNotMatch(workflow, /vercel@latest/);
  assert.match(workflow, /--prod/);
  assert.match(workflow, /--skip-domain/);
  assert.match(workflow, /Verify staged Vercel deployment identity/);
  assert.match(workflow, /Smoke staged Production deployment/);
  assert.match(workflow, /promote "\$STAGED_URL"/);
  assert.match(workflow, /Verify immutable candidate is served in Production/);
  assert.match(workflow, /Run Production operational smoke/);
});
