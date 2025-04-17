import { isEqual } from "lodash";

export interface DiffResult {
  field: string;
  type: "added" | "removed" | "changed";
  oldValue?: any;
  newValue?: any;
}

export function generateDiff(prev: any, current: any): DiffResult[] {
  const diffs: DiffResult[] = [];

  const allKeys = new Set([
    ...Object.keys(prev || {}),
    ...Object.keys(current || {}),
  ]);

  for (const key of allKeys) {
    if (!(key in prev)) {
      diffs.push({ field: key, type: "added", newValue: current[key] });
    } else if (!(key in current)) {
      diffs.push({ field: key, type: "removed", oldValue: prev[key] });
    } else if (!isEqual(prev[key], current[key])) {
      diffs.push({
        field: key,
        type: "changed",
        oldValue: prev[key],
        newValue: current[key],
      });
    }
  }

  return diffs;
}
