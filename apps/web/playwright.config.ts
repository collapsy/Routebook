import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");
const anonymousSpecs = /(?:auth|authenticated-trips)\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  maxFailures: process.env.CI ? 1 : 0,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "desktop-chromium",
      dependencies: ["setup"],
      testIgnore: anonymousSpecs,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
    {
      name: "mobile-chromium",
      dependencies: ["setup"],
      testIgnore: anonymousSpecs,
      use: {
        ...devices["Pixel 7"],
        storageState: authFile,
      },
    },
    {
      name: "desktop-anonymous",
      testMatch: anonymousSpecs,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-anonymous",
      testMatch: anonymousSpecs,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "pnpm start",
    env: {
      ...process.env,
      ROUTEBOOK_DESTINATION_RESOLVER: "fixture",
      ROUTEBOOK_E2E_DESTINATION_RESOLVER: "1",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:3000",
  },
});
