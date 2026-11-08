import { useCallback, useState } from "react";
import type { PackDto } from "../shared/studioApi";
import { describeFailure } from "./describeFailure";
import type { NotificationKind } from "./notification";

export type PackMutation = (stickerId: string | null, action: () => Promise<PackDto>, label?: string) => Promise<void>;

export interface PackMutationState {
  busyStickerId: string | null;
  busyLabel: string | null;
  applyMutation: PackMutation;
}

export function usePackMutation(
  setPack: (pack: PackDto) => void,
  notify: (kind: NotificationKind, message: string) => void
): PackMutationState {
  const [busyStickerId, setBusyStickerId] = useState<string | null>(null);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);

  const applyMutation = useCallback<PackMutation>(
    async (stickerId, action, label = "Working…") => {
      setBusyStickerId(stickerId);
      setBusyLabel(label);
      try {
        setPack(await action());
      } catch (error) {
        notify("error", describeFailure(error));
      } finally {
        setBusyStickerId(null);
        setBusyLabel(null);
      }
    },
    [setPack, notify]
  );

  return { busyStickerId, busyLabel, applyMutation };
}
