export function addUniqueWarning(
  warningSet: Set<string>,
  warnings: string[],
  warning: string,
): void {
  if (warning.trim().length === 0 || warningSet.has(warning)) {
    return;
  }

  warningSet.add(warning);
  warnings.push(warning);
}
