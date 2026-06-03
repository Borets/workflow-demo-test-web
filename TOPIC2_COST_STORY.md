## Topic 2: Deep dive into the cost story of Workflows

### The Problem

Developers don't see Workflows as cost-effective. Two reasons:

1. **Perception:** No pricing calculator, no free tier -- developers have to do napkin math to estimate costs. When they do, AI workloads look alarming.

2. **Reality:** We bill wall-clock time including idle waits. Trigger.dev checkpoints tasks and stops billing during waits. For AI workloads (90%+ idle), we are 3-10x more expensive for identical work.


### Who Wins Each Workload Type Today

**Assumptions:**
- **Workflows:** Standard tier (1 CPU, 2 GB) at $0.20/hr billed per second of wall-clock time
- **Trigger.dev:** Medium 1x (1 CPU, 2 GB) at $0.0000850/s + $0.000025 per run invocation. Already has active compute billing AND waitpoint checkpointing (CRIU) -- their costs reflect both optimizations
- **BG Worker:** 1x Pro (2 CPU, 4 GB) at $85/mo flat, running 2 subprocess workers with 50 async slots each. Does NOT include managed retries, orchestration, observability, or burst handling
- **Active Compute** = time the CPU is actually executing code (excludes I/O waits, LLM response waits, subtask waits)
- **Wall-Clock** = total elapsed time per request including all waits

| Workload | Volume | Wall-Clock | Active Compute | Cheapest Today | Workflows vs Best Alt |
|---|---|---|---|---|---|
| Simple compute | 500K/mo | 1s | 1s (100%) | **Workflows** | $28 vs Trigger $55 |
| Image processing | 200K/mo | 5s | 5s (100%) | **Workflows** | $56 vs BG $85 |
| Single LLM call | 300K/mo | 8s | 0.3s (4%) | Trigger.dev | $133 vs Trigger $15 |
| Multi-step LLM agent | 100K/mo | 35s | 1.5s (4%) | Trigger.dev | $195 vs Trigger $28 |
| AI pipeline | 50K/mo | 90s | 3s (3%) | Trigger.dev | $250 vs Trigger $18 |
| Data fan-out | 10K/mo | 200s | 85s (43%) | BG Worker | $111 vs BG $85 |
| Long-running agent | 10K/mo | 350s | 5s (1%) | Trigger.dev | $195 vs Trigger $7 |

**We win 2 of 7. We lose the 5 that involve waiting -- exactly where the market is heading.**


### Real Customer Lost

AI support company. 800K requests/month. 5-15 LLM calls per request. ~20s wall-clock per request. Less than 5% CPU utilization.

| | Monthly Cost |
|---|---|
| Current setup (4x Pro Plus BG workers) | $700 |
| Workflows quote (Standard tier) | $2,224 |
| Trigger.dev (Medium 1x) | $696 |

Customer quote: *"When I worked out the pricing, it was many orders of magnitude greater than the current cost. It just didn't make sense."*

They were willing to pay up to $1,000/month for managed orchestration. We priced ourselves out at $2,224.


### Root Cause

Our per-second rate is 35-55% cheaper than Trigger.dev at identical specs. But we bill 10x more seconds because idle wait time is included. The rate advantage is invisible.

| | Render bills | Trigger.dev bills |
|---|---|---|
| Per request (20s wall-clock, 2s active) | 20s | 2s |
| Same work | 10x the bill | -- |


### Three Projects to Fix It

| Project | What it does | Complexity | Workflows wins |
|---|---|---|---|
| P1: No parent billing | Stop billing parents during subtask waits | Low -- billing only, weeks | 2/7 (no change) |
| P2: Active compute only | Bill CPU-active time across ALL tasks | Medium -- cgroups, 1-2 months | **6/7** |
| P3: Waitpoints | SDK primitives to pause billing during LLM/API calls | High -- CRIU, 3-6 months, builds on P2 | **7/7** |

P1 alone does not flip any workloads. **P2 is the project that matters** -- it flips 4 workloads from losing to winning and makes Workflows 55% cheaper than Trigger.dev (our lower per-second rate and zero invocation fee become the deciding factors). P3 captures the last holdout (long-running agents) and unlocks new patterns like approval flows and webhook waits.


### After P2: The customer we lost becomes a customer we win

| Option | Today | After P2 |
|---|---|---|
| Render Workflows | $2,224/mo | **$311/mo** |
| Trigger.dev | $696/mo | $696/mo |
| BG Workers (customer setup) | $700/mo | $700/mo |
