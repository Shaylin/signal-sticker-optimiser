import { useCallback, useState } from "react";
import type { PackDto } from "../shared/studioApi";
import { describeFailure } from "./describeFailure";
import type { NotificationKind } from "./notification";

export type PackMutation = (stickerId: string | null, action: () => Promise<PackDto>) => Promise<void>;

export function usePackMutation(
  setPack: (pack: PackDto) => void,
  notify: (kind: NotificationKind, message: string) => void
): { busyStickerId: string | null; applyMutation: PackMutation } {
  const [busyStickerId, setBusyStickerId] = useState<string | null>(null);

  const applyMutation = useCallback<PackMutation>(
    async (stickerId, action) => {
      setBusyStickerId(stickerId);
      try {
        setPack(await action());
      } catch (error) {
        notify("error", describeFailure(error));
      } finally {
        setBusyStickerId(null);
      }
    },
    [setPack, notify]
  );

  return { busyStickerId, applyMutation };
}
