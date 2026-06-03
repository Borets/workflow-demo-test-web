# Render Workflows vs Trigger.dev: Cost Analysis

## The Problem

Render Workflows and Trigger.dev Cloud use fundamentally different billing models for task execution. This analysis, based on real task runs from our demo app, reveals where each platform has cost advantages and why.

---

## How Each Platform Bills

| | **Render Workflows** | **Trigger.dev Cloud** |
|---|---|---|
| **What you pay for** | Wall-clock time of every task (parent + subtasks) | Active compute time only + per-run invocation fee |
| **Per-run fee** | None | $0.000025/run |
| **During waits** | **Billed** — task holds the worker | **Not billed** — task is checkpointed via CRIU, resources released |
| **Per-second rate** | ~40-55% cheaper at comparable tiers | Higher per-second, but bills fewer seconds |

### Compute Rates (Per Second)

| Spec | **Render** | **Trigger.dev** |
|---|---|---|
| 0.5 CPU / 0.5 GB | Starter: $0.0000139/s ($0.05/hr) | Small 1x: $0.0000338/s |
| 1 CPU / 2 GB | Standard: $0.0000556/s ($0.20/hr) | Medium 1x: $0.0000850/s |
| 2 CPU / 4 GB | Pro: $0.0001111/s ($0.40/hr) | Medium 2x: $0.0001700/s |
| 4 CPU / 8 GB | Pro Plus: $0.0002778/s ($1.00/hr) | Large 1x: $0.0003400/s |

---

## Real-World Comparison: `compute_multiple([2, 3, 4])`

We ran the same task on both platforms — computing squares and cubes of 3 numbers in parallel (7 total task runs: 1 parent + 3 square + 3 cube subtasks).

### Render Workflows (actual run `trn-0914gd7b8psidbo4c73ct0ifg`)

Render bills each green bar (each task) for its full wall-clock duration:

| Task | Duration (billed) | Cost (Starter) |
|---|---|---|
| compute_multiple (parent) | 9.9s | $0.000138 |
| square(2) | 2.7s | $0.000038 |
| square(3) | 2.5s | $0.000035 |
| square(4) | 2.7s | $0.000038 |
| cube(2) | 2.6s | $0.000036 |
| cube(3) | 2.5s | $0.000035 |
| cube(4) | 2.6s | $0.000036 |
| **Total** | **25.5s billed** | **$0.000354** |

The parent task's 9.9s includes time spent waiting for subtasks — **this wait time is billed**.

### Trigger.dev (actual run `run_cmnqb5qs84q690oomf4g5da50`)

Trigger.dev only bills active compute. The parent was checkpointed while waiting for subtasks:

| Task | Wall-clock | Active compute (billed) | Compute cost | Invocation |
|---|---|---|---|---|
| compute_multiple (parent) | 17.8s | 1.3s | $0.000047 | $0.000025 |
| 3x tree_square | ~3s each | 78ms, 94ms, 12ms | $0.000006 | $0.000075 |
| 3x tree_cube | ~3s each | 21ms, 13ms, 98ms | $0.000004 | $0.000075 |
| **Total** | **17.8s wall-clock** | **1.7s billed** | **$0.000058** | **$0.000175** |
| | | | | **Total: $0.000233** |

### Side-by-Side

| | **Render (Starter)** | **Trigger.dev (Small 1x)** |
|---|---|---|
| Wall-clock time | 9.9s | 17.8s |
| Billed compute time | **25.5s** (all tasks, full duration) | **1.7s** (active compute only) |
| Compute cost | $0.000354 | $0.000058 |
| Invocation fees | $0.000000 | $0.000175 |
| **Total cost** | **$0.000354 (0.035 cents)** | **$0.000233 (0.023 cents)** |

**Trigger.dev is 1.5x cheaper** for this run despite higher per-second rates — because it only billed 1.7s vs Render's 25.5s.

**Render executed 1.8x faster** (9.9s vs 17.8s wall-clock) due to warm workers with no checkpoint/restore overhead.

---

## When Each Platform Wins

### Render wins: Pure compute, no waits

For leaf tasks that do compute work and return immediately (no subtask calls, no waits):

| Scenario | Render (Starter) | Trigger.dev (Small 1x) |
|---|---|---|
| 1s task, 10K runs/month | **$0.14** | $0.59 |
| 10s task, 1K runs/month | **$0.56** | $0.88 |

Render advantages: 40-55% cheaper per-second rate, no invocation fee, faster execution.

### Trigger.dev wins: Orchestrators that wait

For parent/orchestrator tasks that spend most of their time in `triggerAndWait`:

| Scenario | Render (Standard) | Trigger.dev (Medium 1x) |
|---|---|---|
| 5min wall-clock, 10s active compute, 1K runs/mo | **$16.68** | **$0.88** |

Trigger.dev is **19x cheaper** here because Render bills the full 300s while Trigger.dev checkpoints and only bills the 10s of active work.

### Mixed: Fan-out patterns

Deep parallel trees (like our 120-subtask tree) have both effects — many invocations (hurts Trigger.dev) but orchestrator wait time (helps Trigger.dev). Trigger.dev's checkpointing advantage typically outweighs the invocation cost.

---

## The Core Tradeoff

```
                    Render cheaper ◄──────────────►  Trigger.dev cheaper

Pure compute        ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
(leaf tasks)

Mixed               ░░░░░░░░░░░░░░░░████████████████░░░░░░░░░░░░░░░░░░
(some waits)

Orchestrators       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████░░
(mostly waiting)

                    Low wait ratio ◄────────────────► High wait ratio
```

**The deciding factor is the wait ratio** — what percentage of a task's wall-clock time is spent waiting vs doing active compute:

- **Low wait ratio** (leaf tasks, pure compute): Render wins on cheaper per-second rates and zero invocation fees
- **High wait ratio** (orchestrators, pipelines): Trigger.dev wins because checkpointing eliminates billing for all wait time
- **Crossover point**: roughly when tasks spend >60% of wall-clock time waiting

---

## Platform Cost Comparison

| | **Render** | **Trigger.dev** |
|---|---|---|
| Free tier | $0/mo (Hobby plan) | $0/mo ($5 usage included) |
| Pro plan | $19/user/mo | $50/mo ($50 usage included) |
| Dev environment | Billed normally | Free |
| Concurrency (base) | 20-50 included | 20 (Free) / 200+ (Pro) |

---

## Summary

| Factor | Render Workflows | Trigger.dev |
|---|---|---|
| Per-second compute rate | **40-55% cheaper** | Higher |
| Per-run invocation fee | **None** | $0.000025/run |
| Billing during waits | Full wall-clock | **Active compute only** |
| Execution speed | **Faster** (warm workers) | Slower (checkpoint/restore overhead) |
| Best for | Leaf tasks, pure compute, high-volume simple jobs | Orchestrators, pipelines, tasks with long waits |
