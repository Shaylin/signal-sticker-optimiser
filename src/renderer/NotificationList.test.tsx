// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Notification } from "./notification";
import { NotificationList } from "./NotificationList";

const notifications: Notification[] = [
  { id: 1, kind: "error", message: "ffmpeg exited with an error" },
  { id: 2, kind: "info", message: "Exported 3 stickers to /tmp/pack" }
];

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("NotificationList", () => {
  it("renders nothing while there are no notifications", () => {
    const { container } = render(<NotificationList notifications={[]} onDismiss={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("marks errors as alerts and messages as status", () => {
    render(<NotificationList notifications={notifications} onDismiss={vi.fn()} />);
    expect(screen.getByRole("alert").textContent).toContain("ffmpeg exited with an error");
    expect(screen.getByRole("status").textContent).toContain("Exported 3 stickers to /tmp/pack");
  });

  it("dismisses the notification it was asked to dismiss", async () => {
    const onDismiss = vi.fn();
    render(<NotificationList notifications={notifications} onDismiss={onDismiss} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Dismiss notification" })[0]);
    expect(onDismiss).toHaveBeenCalledWith(1);
  });
});
