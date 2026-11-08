// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StickerStats } from "../main/pack/stickerStats";
import { BudgetBadge } from "./BudgetBadge";

function statsWithBytes(byteSize: number): StickerStats {
  return { byteSize, width: 512, height: 512, durationSeconds: 0, animated: false, hasAlpha: true };
}

describe("BudgetBadge", () => {
  it("shows a green badge for a compliant sticker", () => {
    render(<BudgetBadge stats={statsWithBytes(150_000)} />);
    const badge = screen.getByText("146 KB");
    expect(badge.className).toBe("badge badge-ok");
  });

  it("shows a red badge for an over-budget sticker", () => {
    render(<BudgetBadge stats={statsWithBytes(320_000)} />);
    const badge = screen.getByText("313 KB");
    expect(badge.className).toBe("badge badge-over");
  });
});
