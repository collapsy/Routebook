import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { expect, test as setup } from "@playwright/test";
import { eq } from "drizzle-orm";

import { authUsers, closeDatabase, getDatabase } from "@routebook/database";

const authDirectory = path.join(process.cwd(), "playwright/.auth");
const authFile = path.join(authDirectory, "user.json");
const workspaceFile = path.join(authDirectory, "workspace.json");

setup("autentica o workspace legado", async ({ page }) => {
  await mkdir(authDirectory, { recursive: true });

  const email = `routebook-e2e-workspace-${Date.now()}@example.com`;
  await page.goto("/criar-conta?next=%2Fviagens");
  await page.getByLabel("Nome").fill("RouteBook E2E Workspace");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill("routebook-e2e-password");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/viagens$/);
  await page.context().storageState({ path: authFile });

  const [user] = await getDatabase()
    .select({ id: authUsers.id, name: authUsers.name })
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);
  expect(user).toBeDefined();
  await writeFile(workspaceFile, JSON.stringify(user));
  await closeDatabase();
});
