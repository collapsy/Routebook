import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductErrorState } from "./product-error-state";

describe("ProductErrorState", () => {
  it("permite tentar carregar novamente", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ProductErrorState onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
