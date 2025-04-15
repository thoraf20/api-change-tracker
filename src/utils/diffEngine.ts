export function hasChanged(previous: any, current: any): boolean {
  return JSON.stringify(previous) !== JSON.stringify(current);
}
