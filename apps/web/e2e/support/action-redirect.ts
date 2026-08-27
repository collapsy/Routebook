import { expect, type Page } from "@playwright/test";

export async function submitAndExpectActionRedirect(
  page: Page,
  submit: () => Promise<void>,
  expectedUrl: RegExp,
  expectedStatus: string,
) {
  const actionPathname = new URL(page.url()).pathname;
  const actionResponse = page.waitForResponse((response) => {
    const request = response.request();
    return request.method() === "POST" && new URL(request.url()).pathname === actionPathname;
  });

  const [response] = await Promise.all([actionResponse, submit()]);
  const redirectUrl = response.headers()["x-action-redirect"]?.split(";")[0];
  expect(redirectUrl).toMatch(expectedUrl);
  await page.goto(redirectUrl!);
  await expect(page.getByRole("status")).toContainText(expectedStatus);
  await expect(page).toHaveURL(expectedUrl);
}
