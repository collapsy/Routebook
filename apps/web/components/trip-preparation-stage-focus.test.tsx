import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TripPreparationStageFocus } from "./trip-preparation-stage-focus";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TripPreparationStageFocus", () => {
  it("moves focus to the new stage heading and brings it into view", () => {
    const heading = document.createElement("h2");
    heading.id = "stage-heading";
    heading.tabIndex = -1;
    document.body.append(heading);
    const focus = vi.spyOn(heading, "focus");
    const scrollIntoView = vi.fn();
    heading.scrollIntoView = scrollIntoView;

    render(<TripPreparationStageFocus active stage="review" targetId="stage-heading" />);

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      inline: "nearest",
      behavior: "auto",
    });

    heading.remove();
  });

  it("does not move focus when the wizard is not in an introductory step", () => {
    const heading = document.createElement("h2");
    heading.id = "stage-heading";
    document.body.append(heading);
    const focus = vi.spyOn(heading, "focus");
    const scrollIntoView = vi.fn();
    heading.scrollIntoView = scrollIntoView;

    render(<TripPreparationStageFocus active={false} stage="places" targetId="stage-heading" />);

    expect(focus).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();

    heading.remove();
  });
});
