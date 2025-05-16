import { isEqual, isPlainObject } from "lodash";

export interface DiffResult {
  field: string; // e.g. "user.name.first"
  type: "added" | "removed" | "changed";
  oldValue?: any;
  newValue?: any;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  totalChanges: number;
  summary: string;
}

export function generateDiff(
  prev: any,
  current: any,
  parentPath = ""
): DiffResult[] {
  const diffs: DiffResult[] = [];
  const prevKeys = Object.keys(prev || {});
  const currKeys = Object.keys(current || {});
  const allKeys = new Set([...prevKeys, ...currKeys]);

  let addedCount = 0;
  let removedCount = 0;
  let changedCount = 0;

  for (const key of allKeys) {
    const fullPath = parentPath ? `${parentPath}.${key}` : key;

    const prevVal = prev?.[key];
    const currVal = current?.[key];

    const prevExists = key in (prev || {});
    const currExists = key in (current || {});

    if (!prevExists) {
      diffs.push({
        field: fullPath,
        type: "added",
        newValue: currVal,
      });
      addedCount++;

    } else if (!currExists) {
      diffs.push({
        field: fullPath,
        type: "removed",
        oldValue: prevVal,
      });
      removedCount++;

    } else if (isPlainObject(prevVal) && isPlainObject(currVal)) {
      // Recurse into nested objects
      diffs.push(...generateDiff(prevVal, currVal, fullPath));
    } else if (Array.isArray(prevVal) && Array.isArray(currVal)) {
      // Handle array diff
      const arrayDiffs = generateArrayDiff(prevVal, currVal, fullPath);
      diffs.push(...arrayDiffs);
      changedCount += arrayDiffs.length;
      
    } else if (!isEqual(prevVal, currVal)) {
      diffs.push({
        field: fullPath,
        type: "changed",
        oldValue: prevVal,
        newValue: currVal,
      });
      changedCount++;
    }
  }

  const summary: DiffSummary = {
    added: addedCount,
    removed: removedCount,
    changed: changedCount,
    totalChanges: addedCount + removedCount + changedCount,
    summary: `Changes detected: ${addedCount} added, ${removedCount} removed, ${changedCount} changed.`,
  };

  return diffs;
}

// Helper function to compare arrays
function generateArrayDiff(
  prevArray: any[],
  currArray: any[],
  parentPath: string
): DiffResult[] {
  const diffs: DiffResult[] = [];
  const maxLength = Math.max(prevArray.length, currArray.length);

  for (let i = 0; i < maxLength; i++) {
    const fullPath = `${parentPath}[${i}]`;
    const prevVal = prevArray[i];
    const currVal = currArray[i];

    if (prevVal === undefined) {
      diffs.push({
        field: fullPath,
        type: "added",
        newValue: currVal,
      });
    } else if (currVal === undefined) {
      diffs.push({
        field: fullPath,
        type: "removed",
        oldValue: prevVal,
      });
    } else if (!isEqual(prevVal, currVal)) {
      diffs.push({
        field: fullPath,
        type: "changed",
        oldValue: prevVal,
        newValue: currVal,
      });
    }
  }

  return diffs;
}
