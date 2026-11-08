// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { maxVisibleNotifications, useNotifications } from "./useNotifications";

describe("useNotifications", () => {
  it("collects messages with their kind", () => {
    const { result } = renderHook(() => useNotifications());
    act(() => result.current.notify("error", "ffmpeg exited with an error"));
    act(() => result.current.notify("info", "Exported 2 stickers"));
    expect(result.current.notifications.map((notification) => notification.kind)).toEqual(["error", "info"]);
    expect(result.current.notifications[1].message).toBe("Exported 2 stickers");
  });

  it("removes a single notification when dismissed", () => {
    const { result } = renderHook(() => useNotifications());
    act(() => result.current.notify("info", "first"));
    act(() => result.current.notify("info", "second"));
    const [first] = result.current.notifications;
    act(() => result.current.dismiss(first.id));
    expect(result.current.notifications.map((notification) => notification.message)).toEqual(["second"]);
  });

  it("keeps only the most recent notifications", () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      for (let index = 0; index <= maxVisibleNotifications; index += 1) {
        result.current.notify("info", `message ${index}`);
      }
    });
    expect(result.current.notifications).toHaveLength(maxVisibleNotifications);
    expect(result.current.notifications[0].message).toBe("message 1");
  });
});
