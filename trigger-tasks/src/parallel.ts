import { task } from "@trigger.dev/sdk";

// --- Leaf tasks for the deep parallel tree ---

export const treeSquare = task({
  id: "tree_square",
  run: async (payload: { n: number }) => {
    const result = payload.n * payload.n;
    console.log(`[L3 tree_square] ${payload.n}² = ${result}`);
    return result;
  },
});

export const treeCube = task({
  id: "tree_cube",
  run: async (payload: { n: number }) => {
    const result = payload.n * payload.n * payload.n;
    console.log(`[L4 tree_cube] ${payload.n}³ = ${result}`);
    return result;
  },
});

export const treeCombine = task({
  id: "tree_combine",
  run: async (payload: { sq: number; cb: number }) => {
    const total = payload.sq + payload.cb;
    console.log(`[L5 tree_combine] ${payload.sq} + ${payload.cb} = ${total}`);
    return { square: payload.sq, cube: payload.cb, combined: total };
  },
});

export const treePairAdd = task({
  id: "tree_pair_add",
  run: async (payload: { a: number; b: number }) => {
    const result = payload.a + payload.b;
    console.log(`[L7 tree_pair_add] ${payload.a} + ${payload.b} = ${result}`);
    return result;
  },
});

export const treePairMultiply = task({
  id: "tree_pair_multiply",
  run: async (payload: { a: number; b: number }) => {
    const result = payload.a * payload.b;
    console.log(
      `[L8 tree_pair_multiply] ${payload.a} * ${payload.b} = ${result}`
    );
    return result;
  },
});

// --- Sequential subtask helpers (triggerAndWait cannot be wrapped in Promise.all in v4) ---

async function batchSquares(numbers: number[]): Promise<number[]> {
  const results: number[] = [];
  for (const n of numbers) {
    results.push(await treeSquare.triggerAndWait({ n }).unwrap());
  }
  return results;
}

async function batchCubes(numbers: number[]): Promise<number[]> {
  const results: number[] = [];
  for (const n of numbers) {
    results.push(await treeCube.triggerAndWait({ n }).unwrap());
  }
  return results;
}

async function batchCombine(
  pairs: { sq: number; cb: number }[]
): Promise<{ square: number; cube: number; combined: number }[]> {
  const results: { square: number; cube: number; combined: number }[] = [];
  for (const p of pairs) {
    results.push(await treeCombine.triggerAndWait(p).unwrap());
  }
  return results;
}

async function batchPairAdd(pairs: [number, number][]): Promise<number[]> {
  const results: number[] = [];
  for (const [a, b] of pairs) {
    results.push(await treePairAdd.triggerAndWait({ a, b }).unwrap());
  }
  return results;
}

async function batchPairMultiply(
  pairs: [number, number][]
): Promise<number[]> {
  const results: number[] = [];
  for (const [a, b] of pairs) {
    results.push(await treePairMultiply.triggerAndWait({ a, b }).unwrap());
  }
  return results;
}

// --- Higher-level tree tasks ---

export const treeChunkProcess = task({
  id: "tree_chunk_process",
  run: async (payload: { chunk: number[]; chunkId: number }) => {
    console.log(
      `[L2 tree_chunk_process] chunk ${payload.chunkId}: ${payload.chunk}`
    );

    const squares = await batchSquares(payload.chunk);
    const cubes = await batchCubes(payload.chunk);

    const combinePairs = squares.map((sq, i) => ({ sq, cb: cubes[i] }));
    const combined = await batchCombine(combinePairs);

    const chunkTotal = combined.reduce((sum, r) => sum + r.combined, 0);
    console.log(
      `[L2 tree_chunk_process] chunk ${payload.chunkId} total = ${chunkTotal}`
    );

    return {
      chunk_id: payload.chunkId,
      elements: payload.chunk,
      records: combined,
      chunk_total: chunkTotal,
    };
  },
});

export const treeScatter = task({
  id: "tree_scatter",
  run: async (payload: { numbers: number[]; chunkSize: number }) => {
    const chunks: number[][] = [];
    for (let i = 0; i < payload.numbers.length; i += payload.chunkSize) {
      chunks.push(payload.numbers.slice(i, i + payload.chunkSize));
    }
    console.log(
      `[L1 tree_scatter] splitting ${payload.numbers.length} numbers into ${chunks.length} chunks`
    );

    const results: any[] = [];
    for (let i = 0; i < chunks.length; i++) {
      results.push(
        await treeChunkProcess
          .triggerAndWait({ chunk: chunks[i], chunkId: i })
          .unwrap()
      );
    }

    const scatterTotal = results.reduce(
      (sum: number, r: any) => sum + r.chunk_total,
      0
    );
    console.log(`[L1 tree_scatter] scatter total = ${scatterTotal}`);

    return {
      num_chunks: chunks.length,
      chunk_results: results,
      scatter_total: scatterTotal,
    };
  },
});

export const treeCrossReduce = task({
  id: "tree_cross_reduce",
  run: async (payload: { chunkResults: any[] }) => {
    const allCombined: number[] = [];
    for (const cr of payload.chunkResults) {
      for (const r of cr.records) {
        allCombined.push(r.combined);
      }
    }

    console.log(
      `[L6 tree_cross_reduce] cross-reducing ${allCombined.length} values`
    );

    const pairs: [number, number][] = [];
    for (let i = 0; i < allCombined.length - 1; i += 2) {
      pairs.push([allCombined[i], allCombined[i + 1]]);
    }

    const sums = await batchPairAdd(pairs);
    const products = await batchPairMultiply(pairs);

    console.log(
      `[L6 tree_cross_reduce] produced ${sums.length} sums, ${products.length} products`
    );

    return {
      pair_sums: sums,
      pair_products: products,
      num_pairs: pairs.length,
    };
  },
});

export const treePartialSum = task({
  id: "tree_partial_sum",
  run: async (payload: {
    values: number[];
    depth: number;
  }): Promise<{ final: number; depth: number }> => {
    console.log(
      `[L${9 + payload.depth} tree_partial_sum] depth=${payload.depth}, values=${payload.values.length}`
    );

    if (payload.values.length <= 1) {
      return {
        final: payload.values.length > 0 ? payload.values[0] : 0,
        depth: payload.depth,
      };
    }

    const pairs: [number, number][] = [];
    for (let i = 0; i < payload.values.length - 1; i += 2) {
      pairs.push([payload.values[i], payload.values[i + 1]]);
    }

    const reduced = await batchPairAdd(pairs);

    if (payload.values.length % 2 === 1) {
      reduced.push(payload.values[payload.values.length - 1]);
    }

    return await treePartialSum
      .triggerAndWait({ values: reduced, depth: payload.depth + 1 })
      .unwrap();
  },
});

export const treeLayeredSum = task({
  id: "tree_layered_sum",
  run: async (payload: {
    crossResult: { pair_sums: number[]; pair_products: number[] };
  }) => {
    const values = [
      ...payload.crossResult.pair_sums,
      ...payload.crossResult.pair_products,
    ];
    console.log(
      `[L9 tree_layered_sum] reducing ${values.length} values recursively`
    );
    return await treePartialSum
      .triggerAndWait({ values, depth: 1 })
      .unwrap();
  },
});

export const treeFinalize = task({
  id: "tree_finalize",
  run: async (payload: { scatter: any; cross: any; layered: any }) => {
    console.log("[L12 tree_finalize] assembling final result");
    return {
      scatter_total: payload.scatter.scatter_total,
      num_chunks: payload.scatter.num_chunks,
      cross_reduce_pairs: payload.cross.num_pairs,
      recursive_sum: payload.layered.final,
      recursive_depth: payload.layered.depth,
    };
  },
});

// --- Top-level parallel tasks ---

export const computeMultiple = task({
  id: "compute_multiple",
  run: async (payload: { numbers: number[] }) => {
    console.log(`Processing ${payload.numbers.length} numbers in parallel`);

    const squares = await batchSquares(payload.numbers);
    const cubes = await batchCubes(payload.numbers);

    return {
      input: payload.numbers,
      squares,
      cubes,
      count: payload.numbers.length,
    };
  },
});

export const sumOfSquares = task({
  id: "sum_of_squares",
  run: async (payload: { numbers: number[] }) => {
    console.log(
      `Calculating sum of squares for ${payload.numbers.length} numbers`
    );

    const squares = await batchSquares(payload.numbers);
    const total = squares.reduce((sum, v) => sum + v, 0);

    return {
      numbers: payload.numbers,
      squares,
      sum: total,
    };
  },
});

export const deepParallelTree = task({
  id: "deep_parallel_tree",
  run: async (payload: { numbers: number[]; chunkSize?: number }) => {
    const chunkSize = payload.chunkSize ?? 4;
    console.log(
      `[L0 deep_parallel_tree] START – ${payload.numbers.length} numbers, chunkSize=${chunkSize}`
    );

    const scatter: any = await treeScatter
      .triggerAndWait({ numbers: payload.numbers, chunkSize })
      .unwrap();

    const cross: any = await treeCrossReduce
      .triggerAndWait({ chunkResults: scatter.chunk_results })
      .unwrap();

    const layered: any = await treeLayeredSum
      .triggerAndWait({ crossResult: cross })
      .unwrap();

    const summary: any = await treeFinalize
      .triggerAndWait({ scatter, cross, layered })
      .unwrap();

    const n = payload.numbers.length;
    const numChunks = scatter.num_chunks;
    const numPairs = cross.num_pairs;
    const numCrossVals =
      cross.pair_sums.length + cross.pair_products.length;
    const recursiveAdds = numCrossVals > 1 ? numCrossVals - 1 : 0;
    const totalTasks =
      1 +
      1 +
      numChunks +
      n +
      n +
      n +
      1 +
      numPairs +
      numPairs +
      1 +
      recursiveAdds +
      1;

    summary.total_tasks_approx = totalTasks;
    summary.input_size = n;
    console.log(
      `[L0 deep_parallel_tree] DONE – ~${totalTasks} tasks spawned`
    );
    return summary;
  },
});
