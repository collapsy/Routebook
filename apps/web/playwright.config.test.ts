import { afterEach, describe, expect, it, vi } from "vitest";

async function loadPlaywrightConfig(ci: string) {
  vi.resetModules();
  vi.stubEnv("CI", ci);
  return (await import("./playwright.config")).default;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("playwright.config", () => {
  it("serializes journeys that share the CI application and database", async () => {
    const config = await loadPlaywrightConfig("1");

    expect(config.workers).toBe(1);
    expect(config.retries).toBe(2);
    expect(config).not.toHaveProperty("timeout");
    expect(config.projects?.map((project) => project.name)).toEqual([
      "desktop-chromium",
      "mobile-chromium",
    ]);
  });

  it("keeps Playwright worker management unchanged outside CI", async () => {
    const config = await loadPlaywrightConfig("");

    expect(config.workers).toBeUndefined();
    expect(config.retries).toBe(0);
  });
});
