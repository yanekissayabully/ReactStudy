import type { ItemChanges } from "./types";

export type StatusAction =
  | { type: "check-out"; borrower: string }
  | { type: "return" }
  | { type: "send-to-maintenance" }
  | { type: "finish-maintenance" };

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function statusChanges(action: StatusAction): ItemChanges {
  switch (action.type) {
    case "check-out":
      return { status: "checked-out", assignedTo: action.borrower };
    case "return":
      return { status: "available", assignedTo: null };
    case "send-to-maintenance":
      return { status: "maintenance", assignedTo: null };
    case "finish-maintenance":
      return { status: "available", lastServiceAt: today() };
  }
}
