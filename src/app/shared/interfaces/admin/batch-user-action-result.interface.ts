export interface BatchUserActionResult {
  readonly failed: readonly number[];
  readonly skipped: readonly number[];
  readonly succeeded: readonly number[];
}
