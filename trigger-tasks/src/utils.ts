/**
 * Unwrap a triggerAndWait result, throwing on failure.
 */
export function unwrap<T>(result: { ok: boolean; output?: T; error?: unknown }): T {
  if (!result.ok) {
    throw new Error(`Task failed: ${JSON.stringify(result.error)}`);
  }
  return result.output as T;
}

/**
 * Unwrap all results from a batch.triggerAndWait call.
 */
export function unwrapBatch<T>(batchResult: { runs: Array<{ ok: boolean; output?: T; error?: unknown }> }): T[] {
  return batchResult.runs.map((r) => unwrap(r));
}
