// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PackActionsBar } from "./PackActionsBar";

const handlers = { onImportFiles: vi.fn(), onImportFolder: vi.fn(), onExportPack: vi.fn() };

function buttonEnabled(name: string): boolean {
  return !(screen.getByRole("button", { name }) as HTMLButtonElement).disabled;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("PackActionsBar", () => {
  it("shows no busy indicator while idle", () => {
    render(<PackActionsBar stickerCount={3} busyLabel={null} {...handlers} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(buttonEnabled("Import files…")).toBe(true);
  });

  it("spins with the action label and blocks the buttons while busy", () => {
    render(<PackActionsBar stickerCount={3} busyLabel="Importing…" {...handlers} />);
    expect(screen.getByRole("status").textContent).toContain("Importing…");
    expect(buttonEnabled("Import files…")).toBe(false);
    expect(buttonEnabled("Export pack…")).toBe(false);
  });

  it("counts stickers towards the pack limit", () => {
    render(<PackActionsBar stickerCount={1} busyLabel={null} {...handlers} />);
    expect(screen.getByText("1 / 200")).not.toBeNull();
  });

  it("calls the handler of the button that was pressed", async () => {
    render(<PackActionsBar stickerCount={3} busyLabel={null} {...handlers} />);
    await userEvent.click(screen.getByRole("button", { name: "Import folder…" }));
    expect(handlers.onImportFolder).toHaveBeenCalledOnce();
  });
});
