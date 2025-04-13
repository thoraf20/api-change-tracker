import { hasChanged } from "../../utils/diffEngine";

let lastSnapshot: any = null;

export async function storeSnapshot(snapshot: any) {
  if (!lastSnapshot) {
    console.log("[Backend] No previous snapshot. Storing first.");
    lastSnapshot = snapshot;
    return;
  }

  if (hasChanged(lastSnapshot, snapshot)) {
    console.log("[Backend] Change detected in API snapshot.");
    // TODO: Notify user, store new version, etc.
  } else {
    console.log("[Backend] No change detected.");
  }

  lastSnapshot = snapshot;
}
