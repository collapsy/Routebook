import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ProductionDeploymentVerificationError,
  waitForProductionDeployment,
} from "./verify-production-deployment.mjs";

const candidate = "abcdef0123456789abcdef0123456789abcdef01";
const previous = "0123456789abcdef0123456789abcdef01234567";
const releaseUrl = "https://routebook.example/api/health/release";

function releaseResponse(commitSha, status = "identified") {
  return Response.json(
    {
      service: "routebook-web",
      signal: "release",
      status,
      commitSha,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

function sequenceFetch(sequence) {
  let index = 0;
  return async () => {
    const value = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    if (value instanceof Error) throw value;
    if (typeof value === "function") return value();
    if (value instanceof Response) return value.clone();
    return value;
  };
}

const noSleep = async () => undefined;

test("conclui imediatamente quando Production serve o candidate", async () => {
  const observations = [];
  const result = await waitForProductionDeployment({
    releaseUrl,
    expectedSha: candidate.toUpperCase(),
    fetchImpl: sequenceFetch([releaseResponse(candidate)]),
    sleepImpl: noSleep,
    attempts: 3,
    intervalMs: 1,
    timeoutMs: 1,
    onObservation: (observation) => observations.push(observation),
  });

  assert.equal(result.status, "verified");
  assert.equal(result.expectedSha, candidate);
  assert.equal(result.attemptsUsed, 1);
  assert.deepEqual(
    observations.map(({ kind }) => kind),
    ["identified"],
  );
});

test("retenta SHA anterior até observar exatamente o candidate", async () => {
  let sleeps = 0;
  const result = await waitForProductionDeployment({
    releaseUrl,
    expectedSha: candidate,
    fetchImpl: sequenceFetch([releaseResponse(previous), releaseResponse(candidate)]),
    sleepImpl: async () => {
      sleeps += 1;
    },
    attempts: 3,
    intervalMs: 1,
    timeoutMs: 1,
  });

  assert.equal(result.attemptsUsed, 2);
  assert.equal(sleeps, 1);
});

test("retenta 404 e erro de rede antes do candidate", async () => {
  const observations = [];
  const result = await waitForProductionDeployment({
    releaseUrl,
    expectedSha: candidate,
    fetchImpl: sequenceFetch([
      new Response(null, { status: 404, headers: { "cache-control": "no-store" } }),
      new Error("temporary network failure"),
      releaseResponse(candidate),
    ]),
    sleepImpl: noSleep,
    attempts: 4,
    intervalMs: 1,
    timeoutMs: 1,
    onObservation: (observation) => observations.push(observation),
  });

  assert.equal(result.attemptsUsed, 3);
  assert.deepEqual(
    observations.map(({ kind }) => kind),
    ["http_status", "request_error", "identified"],
  );
});

test("retenta contrato inválido e release ainda desconhecido", async () => {
  const invalidContract = Response.json(
    { service: "other", signal: "release", status: "identified", commitSha: candidate },
    { headers: { "cache-control": "no-store" } },
  );
  const unknown = releaseResponse(null, "unknown");

  const result = await waitForProductionDeployment({
    releaseUrl,
    expectedSha: candidate,
    fetchImpl: sequenceFetch([invalidContract, unknown, releaseResponse(candidate)]),
    sleepImpl: noSleep,
    attempts: 3,
    intervalMs: 1,
    timeoutMs: 1,
  });

  assert.equal(result.attemptsUsed, 3);
});

test("falha deterministicamente quando o candidate nunca é servido", async () => {
  let sleeps = 0;
  await assert.rejects(
    waitForProductionDeployment({
      releaseUrl,
      expectedSha: candidate,
      fetchImpl: sequenceFetch([releaseResponse(previous)]),
      sleepImpl: async () => {
        sleeps += 1;
      },
      attempts: 3,
      intervalMs: 1,
      timeoutMs: 1,
    }),
    (error) => {
      assert.ok(error instanceof ProductionDeploymentVerificationError);
      assert.equal(error.code, "candidate_not_served");
      assert.equal(error.details.attempts, 3);
      assert.equal(error.details.lastObservation.kind, "identified");
      assert.equal(error.details.lastObservation.commitSha, previous);
      return true;
    },
  );
  assert.equal(sleeps, 2);
});

test("rejeita SHA e URL inválidos antes de consultar a rede", async () => {
  let requests = 0;
  const fetchImpl = async () => {
    requests += 1;
    return releaseResponse(candidate);
  };

  await assert.rejects(
    waitForProductionDeployment({
      releaseUrl,
      expectedSha: "invalid",
      fetchImpl,
      sleepImpl: noSleep,
      attempts: 1,
      intervalMs: 1,
      timeoutMs: 1,
    }),
    (error) =>
      error instanceof ProductionDeploymentVerificationError &&
      error.code === "invalid_expected_sha",
  );

  await assert.rejects(
    waitForProductionDeployment({
      releaseUrl: "file:///tmp/release",
      expectedSha: candidate,
      fetchImpl,
      sleepImpl: noSleep,
      attempts: 1,
      intervalMs: 1,
      timeoutMs: 1,
    }),
    (error) =>
      error instanceof ProductionDeploymentVerificationError &&
      error.code === "invalid_release_url",
  );

  assert.equal(requests, 0);
});

test("exige política no-store antes de aceitar o SHA", async () => {
  const cached = Response.json(
    { service: "routebook-web", signal: "release", status: "identified", commitSha: candidate },
    { headers: { "cache-control": "public, max-age=60" } },
  );

  const result = await waitForProductionDeployment({
    releaseUrl,
    expectedSha: candidate,
    fetchImpl: sequenceFetch([cached, releaseResponse(candidate)]),
    sleepImpl: noSleep,
    attempts: 2,
    intervalMs: 1,
    timeoutMs: 1,
  });

  assert.equal(result.attemptsUsed, 2);
});
