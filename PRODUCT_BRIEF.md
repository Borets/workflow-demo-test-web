# Render Workflows: Cost Perception & Reality

Prepared for: Engineering & Product Leadership
Date: April 10, 2026
Author: Yaroslav Borets, Product Manager


---


## The Problem

Developers don't see Render Workflows as cost-effective. This is partly a perception problem — it's hard to estimate what a workload will cost before migrating — and partly a real pricing gap for the fastest-growing workload type.

**The perception problem:** A developer on background workers knows exactly what they pay ($25-175/month per instance). With Workflows, they have to estimate task duration, volume, and instance tier, then multiply it out. When they do, the number often looks worse than what they're paying today — especially for AI workloads where tasks spend most of their time waiting for LLM responses. There's no quick way to say "this will cost roughly $X" before committing.

**The real problem:** Our billing model charges for wall-clock time — including time a task spends idle, waiting for subtasks or API responses. Our closest competitor, Trigger.dev, only charges for active compute. For AI agent workloads — the fastest-growing segment — this makes Workflows 5-13x more expensive for identical work, which confirms the developer's instinct that the pricing "doesn't make sense."

**The result:** We have already lost a customer decision. An AI support company running 800K requests/month calculated our Workflows pricing and said it was "many orders of magnitude greater than the current cost." They chose to stay on stacked background worker instances — even though they wanted the managed features Workflows provides.


---


## Where Each Option Wins Today

    WORKLOAD                  BEST OPTION TODAY         WHY
    ──────────────────────────────────────────────────────────────────────────
    Pure compute              Render Workflows          Cheapest per-second rate,
    (image resize, ETL,                                 no invocation fee, fast
    data transform)                                     execution

    High-concurrency          Background Workers        Fixed monthly cost,
    steady traffic                                      customer controls scaling,
    (queue processors,                                  already built infra
    batch jobs)

    AI / LLM orchestration    Trigger.dev               Only bills active compute,
    (agents, pipelines,                                 waits are free — 5-13x
    multi-step API calls)                               cheaper than Workflows

    The fastest-growing segment — AI agents and LLM orchestration —
    is exactly where we lose.


---


## The Perception Gap

Even where Workflows IS cost-effective, developers struggle to see it.

### What a developer sees today

    Background Worker:
    "I pay $175/month. I know what I get. Done."

    Render Workflows:
    "Let me estimate... 20K requests/day × 20 seconds each × $0.0000556/s...
     carry the one... is that per task or per subtask?... what about retries?...
     do I need Starter or Standard?..."

    Trigger.dev:
    "$50/month Pro plan, $5 included, calculator on the pricing page,
     and I only pay when my code runs."

The friction isn't just price — it's predictability. A developer evaluating Workflows has to do math they don't have to do with a fixed-cost instance. And when they do the math, the number for AI workloads looks alarming because they're multiplying wall-clock time (not active compute) by volume.

### What would help (alongside pricing changes)

    ├── Pricing calculator: "I run [___] tasks/month × [___] seconds → ~$X/month"
    │   (Trigger.dev has this — we should too)
    ├── BG worker migration comparison: "You pay $X on BG workers → Workflows costs ~$Y"
    ├── Free tier or trial credits: Let developers validate cost with real traffic
    └── Real-time cost dashboard: "This month: $47 across 12,400 task runs"


---


## Three Options, Three Billing Models

### Render Workflows

    Billing:     Per-second, wall-clock time (including waits)
    Per-run fee: None
    Rate:        $0.0000556/s at Standard (1 vCPU, 2 GB) = $0.20/hr
    Strengths:   Managed orchestration, retries, observability, fast execution
    Weakness:    Bills for idle wait time during subtask/API calls

### Background Workers

    Billing:     Flat monthly rate per instance, runs 24/7
    Per-run fee: None
    Rate:        $25/mo Standard, $85/mo Pro, $175/mo Pro Plus
    Strengths:   Predictable cost, full control, no per-task overhead
    Weakness:    No managed orchestration, must build retries/queuing/observability,
                 customers stack instances for concurrency (not compute)

### Trigger.dev

    Billing:     Per-second, active compute only (waits checkpointed, not billed)
    Per-run fee: $0.000025/run ($0.25 per 10K)
    Rate:        $0.0000850/s at Medium 1x (1 vCPU, 2 GB) = $0.31/hr
    Strengths:   Only bills when code is actually running, managed orchestration
    Weakness:    53% higher per-second rate, invocation fee adds up at scale,
                 slower execution (checkpoint/restore overhead)


---


## The Core Issue: What Happens During Waits

The billing models are identical for pure compute. The gap opens when tasks wait.

    RENDER WORKFLOWS                       TRIGGER.DEV

    Task starts       ◀── billing ON       Task starts       ◀── billing ON
    ├── work...                            ├── work...
    ├── await sub()                        ├── await sub()
    ├── waiting...    ◀── STILL BILLING    │   ⏸ CHECKPOINTED
    ├── waiting...    ◀── STILL BILLING    │   💰 Cost = $0
    ├── waiting...    ◀── STILL BILLING    │   (resources freed)
    ├── sub returns                        ├── sub returns    ◀── billing RESUMES
    ├── work...                            ├── work...
    Task completes    ◀── billing OFF      Task completes    ◀── billing OFF

    Billed: FULL DURATION                  Billed: ACTIVE COMPUTE ONLY

    BACKGROUND WORKER

    Instance runs 24/7    ◀── ALWAYS BILLING
    ├── processing task 1
    ├── processing task 2
    ├── idle...           ◀── STILL BILLING
    ├── processing task 3
    └── idle...           ◀── STILL BILLING

    Billed: FLAT MONTHLY RATE (regardless of usage)


---


## Cost Comparison by Workload Type

All costs per 1,000 requests. Render Standard ($0.20/hr) vs Trigger.dev Medium 1x — same specs (1 vCPU, 2 GB).

    TASK TYPE              BILLED      BILLED       RENDER        TRIGGER       WINNER
                           RENDER      TRIGGER      WORKFLOWS     .DEV
    ─────────────────────────────────────────────────────────────────────────────────────
    Simple compute          1s          1s          $0.06/1K      $0.11/1K      ✅ Render 2x
    (square a number)

    Image processing        5s          5s          $0.28/1K      $0.45/1K      ✅ Render 2x
    (resize + compress)

    Single LLM call         8s          0.5s        $0.44/1K      $0.07/1K      ❌ Trigger 7x
    (summarize text)

    Multi-step agent        35s         2.5s        $1.94/1K      $0.36/1K      ❌ Trigger 5x
    (5 LLM calls)

    AI pipeline             90s         6s          $5.00/1K      $0.61/1K      ❌ Trigger 8x
    (translate→summ→sent)

    Data fan-out            200s        90s         $11.11/1K     $10.68/1K     ≈ Same
    (120 subtasks)

    Long-running agent      350s        15s         $19.44/1K     $1.53/1K      ❌ Trigger 13x
    (research, 5 min)
    ─────────────────────────────────────────────────────────────────────────────────────

    "Billed Render"  = wall-clock seconds across all tasks (parent + subtasks)
    "Billed Trigger" = active compute seconds only (waits excluded)

    Render wins the top 2 rows. Trigger.dev wins the bottom 5.
    The bottom 5 are where the market is heading.


---


## Where Background Workers Fit

Background workers look cheap on paper ($25-175/month per instance) but customers don't run one instance. They stack multiple instances for concurrency headroom — especially for AI workloads with long request times.

    Real customer example:
    ├── AI support agent, 800K requests/month
    ├── 4× Pro Plus instances ($175 each) = $700/month
    ├── CPU utilization: < 5%
    ├── Memory utilization: < 20%
    ├── Paying for CONCURRENCY, not compute
    ├── Had an outage when a large client spiked traffic
    └── Must build own retries, queuing, and observability

Comparing all three for this customer's workload (800K AI agent requests/month):

    Trigger.dev (Small 1x)      █████████ $409     ◀── managed, cheapest
    BG Workers (4× Pro Plus)    ██████████████████ $700     ◀── unmanaged, current
    Render Workflows (Starter)  ██████████████ $556     ◀── managed, mid-range
    Render Workflows (Standard) ██████████████████████████████████████████████████ $2,224

    Customer quote: "When I worked out [Render Workflows pricing],
    it was many orders of magnitude greater. It just didn't make sense."

    They were willing to pay up to $1,000/month for managed orchestration.
    We priced ourselves out.

### When BG workers make sense

    ✅  Steady, predictable traffic (high utilization across the month)
    ✅  Customer already has queuing/retry infra built
    ✅  Workload doesn't need subtask orchestration or fan-out
    ✅  Team prefers full control over task execution

### When BG workers don't make sense

    ❌  Bursty traffic (low average utilization, high peak concurrency)
    ❌  Customer needs managed retries, observability, subtask composition
    ❌  AI workloads where concurrency matters more than compute
    ❌  Customer ends up stacking 3-4 expensive instances for headroom


---


## The Decision Matrix

    ┌─────────────────────┬──────────────┬──────────────┬──────────────┐
    │                     │   RENDER     │   BACKGROUND │  TRIGGER.DEV │
    │                     │  WORKFLOWS   │   WORKERS    │              │
    ├─────────────────────┼──────────────┼──────────────┼──────────────┤
    │ Pure compute        │  ✅ BEST      │  ◯ OK        │  ◯ OK        │
    │ (no waits)          │  Cheapest    │  Fixed cost  │  Higher rate │
    │                     │  per second  │  predictable │  + invoc fee │
    ├─────────────────────┼──────────────┼──────────────┼──────────────┤
    │ Moderate waits      │  ◯ OK        │  ◯ OK        │  ✅ BEST      │
    │ (some API calls)    │  Overpays    │  Fixed cost  │  Waits free  │
    │                     │  for waits   │  amortized   │              │
    ├─────────────────────┼──────────────┼──────────────┼──────────────┤
    │ Heavy waits (AI)    │  ❌ WORST     │  ◯ OK        │  ✅ BEST      │
    │ (LLM agents,        │  5-13x more │  Stacks up   │  Only bills  │
    │  pipelines)         │  expensive   │  for concurr │  active CPU  │
    ├─────────────────────┼──────────────┼──────────────┼──────────────┤
    │ Managed features    │  ✅ YES       │  ❌ NO        │  ✅ YES       │
    │ (retries, obs,      │              │  Build it    │              │
    │  orchestration)     │              │  yourself    │              │
    ├─────────────────────┼──────────────┼──────────────┼──────────────┤
    │ Execution speed     │  ✅ FASTEST   │  ✅ FAST      │  ◯ SLOWER    │
    │                     │  Warm workers│  Always-on   │  CRIU restore│
    │                     │  sub-second  │              │  overhead    │
    ├─────────────────────┼──────────────┼──────────────┼──────────────┤
    │ Burst handling      │  ✅ AUTO      │  ❌ MANUAL    │  ✅ AUTO      │
    │                     │  Scales up   │  Add more    │  Scales up   │
    │                     │  instantly   │  instances   │  instantly   │
    └─────────────────────┴──────────────┴──────────────┴──────────────┘

    Render Workflows is the best option for pure compute.
    Render Workflows is the WORST option for AI/LLM workloads.
    Background workers are never the "best" — they're the fallback
    when the managed options are too expensive.


---


## Recommendation

Address both the real pricing gap and the perception problem.


### Three approaches to fix the pricing gap

Each approach addresses a different layer of the problem and has different implementation complexity, revenue impact, and dependencies.


---


### Approach 1: Don't charge for parent compute while child tasks are running

The simplest change. When a parent task calls `await subtask()`, stop billing the parent. Only the actively executing child task accrues cost.

    TODAY:
    Parent task         ████████████████████████████████  billed 20s
      └─ subtask A          ██████                        billed 3s
      └─ subtask B                    ██████              billed 3s
      └─ subtask C                              ██████    billed 3s
                                                          Total: 29s billed

    WITH APPROACH 1:
    Parent task         ██░░░░░░░░░░░░░░░░░░░░░░░░░░██  billed 2s
      └─ subtask A          ██████                        billed 3s
      └─ subtask B                    ██████              billed 3s
      └─ subtask C                              ██████    billed 3s
                                                          Total: 11s billed

    ░░░ = waiting for child task, NOT billed

    TRADEOFFS:

    ✅ Simplest to implement — billing change only, no runtime changes
    ✅ No new infrastructure needed (no checkpointing, no CRIU)
    ✅ No SDK changes — existing customer code works as-is
    ✅ No performance impact — tasks still run on warm workers
    ✅ Immediately addresses the biggest cost driver (parent wait time)

    ❌ Subtasks still bill full wall-clock (including their own API waits)
    ❌ A subtask calling an LLM for 8s still bills 8s even if only
       0.5s is active compute — this approach doesn't help there
    ❌ Revenue reduction on orchestrator-heavy workloads (~30-50%)

    DEPENDENCIES:
    ├── Billing system: must track parent-child relationships and
    │   detect when a parent is in an await-subtask state
    ├── Metering: need to distinguish "parent waiting for child"
    │   from "parent doing work"
    └── No runtime or SDK changes required

    IMPACT ON AI SUPPORT CUSTOMER (800K req/month, Standard tier):

    Parent cost:     $889 → $89    (90% reduction)
    Subtask cost:    $1,334 → $1,334  (unchanged — subtasks still bill wall-clock)
    ──────────────────────────────────────────────
    Total:           $2,224 → $1,423   (36% reduction)

    Trigger.dev         █████████ $409
    Render (Approach 1) ██████████████████████████████████ $1,423
    Render (today)      ██████████████████████████████████████████████████ $2,224

    Better, but still 3.5x more expensive than Trigger.dev.

    WHY APPROACH 1 ALONE ISN'T ENOUGH:
    The parent cost ($889) is only 40% of the total bill.
    The subtask cost ($1,334) is 60% — and it's untouched.
    Each subtask still bills full wall-clock (e.g., 3s for an LLM call
    where only 0.5s is active compute). At scale, this is the bigger problem.


---


### Approach 2: Charge for active compute only (across all tasks)

Go further than Approach 1. Don't just exempt parents — exempt ALL idle time across every task. If a subtask is waiting for an LLM response, waiting for an API call, or waiting for a timer, stop billing.

    TODAY:
    Parent task         ████████████████████████████████  billed 20s
      └─ subtask A          ██████████████                billed 8s  (0.5s compute + 7.5s LLM wait)

    WITH APPROACH 2:
    Parent task         ██░░░░░░░░░░░░░░░░░░░░░░░░░░██  billed 2s
      └─ subtask A          ██░░░░░░░░░░██                billed 1s  (only active compute)

    ░░░ = any idle time, NOT billed

    TRADEOFFS:

    ✅ Full parity with Trigger.dev's billing model
    ✅ Combined with our lower per-second rate (40-55% cheaper) and
       zero invocation fee, we BEAT Trigger.dev on every workload
    ✅ Simple story for customers: "You only pay when your code runs"

    ❌ Requires runtime-level CPU activity tracking to distinguish
       "task is computing" from "task is waiting for I/O"
    ❌ Significant metering infrastructure change — need to measure
       active CPU time per task, not just wall-clock duration
    ❌ Edge cases: What counts as "active"? Polling loops? Busy waits?
       Event loop idle? Need clear definitions.
    ❌ Largest revenue impact — could reduce Workflows revenue 60-80%
       on wait-heavy workloads
    ❌ Harder to predict revenue per customer (depends on wait ratio)

    DEPENDENCIES:
    ├── Runtime: must instrument per-task CPU usage tracking
    │   (e.g., cgroup CPU accounting per container)
    ├── Metering: replace wall-clock billing with CPU-active billing
    ├── Billing system: new metering pipeline for active-compute seconds
    ├── Definition work: clear policy on what is "active" vs "idle"
    └── No SDK changes required — billing is transparent to customers

    IMPACT ON AI SUPPORT CUSTOMER:

    Parent cost:     $889 → $89     (billed 2s active, not 20s)
    Subtask cost:    $1,334 → $222  (billed 0.5s active per sub, not 3s)
    ──────────────────────────────────────────────
    Total:           $2,224 → $311   (86% reduction)

    Render (Approach 2) ██████ $311
    Trigger.dev         █████████ $409
    BG Workers          ███████████████ $700
    Render (today)      ██████████████████████████████████████████████████ $2,224

    We win on every dimension: cheaper than Trigger.dev, cheaper than
    BG workers, with managed features and faster execution.


---


### Approach 3: Introduce waitpoints (explicit pause/resume)

Instead of automatically detecting idle time (Approach 2), give developers explicit SDK primitives to pause billing. When a task hits a waitpoint, it checkpoints its state, releases its container, and billing stops. When the wait condition is met, the task is restored and billing resumes.

    SDK API:

    ```python
    from render_sdk import wait

    @app.task
    async def call_llm(prompt: str) -> str:
        # Task checkpointed, container released, billing stops
        response = await wait.for_result(
            openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
        )
        # Task restored, billing resumes
        return response.choices[0].message.content

    @app.task
    async def process_payment(order_id: str) -> dict:
        await payment_api.charge(order_id, callback_url=wait.callback_url())
        # Checkpoint until webhook callback received
        result = await wait.for_callback(timeout=300)
        return result

    @app.task
    async def poll_with_backoff(job_id: str) -> dict:
        while True:
            status = await check_status(job_id)
            if status == "complete":
                return await get_result(job_id)
            # Checkpoint for 30 seconds
            await wait.for_duration(seconds=30)
    ```

    BILLING FLOW:

    Task starts           ◀── billing ON
    ├── doing work...
    ├── await wait.for_result(llm_call)
    │   ┌─────────────────────────────────────┐
    │   │  ⏸ CHECKPOINTED                     │
    │   │  State saved, container released    │
    │   │  💰 Billing PAUSED                  │
    │   │  (same as Trigger.dev's model)      │
    │   └─────────────────────────────────────┘
    ├── LLM responds      ◀── billing RESUMES
    ├── doing work...     │   (task restored from checkpoint)
    Task completes        ◀── billing OFF

    TRADEOFFS:

    ✅ Matches Trigger.dev's model exactly (they use CRIU checkpointing)
    ✅ Customer controls when billing pauses — explicit, predictable
    ✅ Enables very long-running workflows (hours/days) at minimal cost
    ✅ Opens new use cases: approval flows, webhook waits, scheduled
       retries — things that are impractical with wall-clock billing
    ✅ Revenue model is sustainable — customers pay for real compute

    ❌ REQUIRES CHECKPOINTING INFRASTRUCTURE (CRIU or equivalent)
       This is a significant engineering investment:
       ├── Must snapshot full process state (memory, file descriptors,
       │   network connections, CPU registers)
       ├── Must store checkpoints reliably (likely object storage)
       ├── Must restore tasks on potentially different machines
       ├── Must handle checkpoint failures gracefully
       └── Trigger.dev invested heavily in this — it's core to their product
    ❌ Adds restore latency (Trigger.dev is 1.8x slower than us partly
       because of checkpoint/restore overhead)
    ❌ Requires SDK changes — customers must adopt new wait primitives
    ❌ Existing customer code doesn't benefit without migration
    ❌ Edge cases: what if a checkpoint fails mid-save? What about
       open database connections? Streaming responses?

    DEPENDENCIES:
    ├── Checkpointing runtime: CRIU integration or equivalent
    │   (this is the biggest dependency — months of engineering)
    ├── Checkpoint storage: reliable storage for process snapshots
    ├── Task scheduler: must handle checkpoint/restore lifecycle
    ├── SDK: new wait primitives (wait.for_result, wait.for_callback,
    │   wait.for_duration)
    ├── Billing system: track checkpoint/resume events, pause metering
    └── Documentation: migration guides for existing customers

    IMPACT ON AI SUPPORT CUSTOMER:

    Only if the customer wraps every LLM/API call in wait primitives:
    Total: $2,224 → $311 (86% reduction)

    Same end-state as Approach 2, but:
    ├── Approach 2 gets there automatically (no code changes)
    ├── Approach 3 gets there only if the customer adopts wait hooks
    ├── Approach 3's real value is not cost parity — it's the NEW
    │   USE CASES that checkpointing unlocks (long waits, approval
    │   flows, webhook patterns, multi-day workflows)
    └── Without Approach 2, customers who DON'T adopt wait hooks
        still pay wall-clock rates on their subtasks


---


### Approaches compared

    ┌─────────────────────┬────────────────┬────────────────┬────────────────┐
    │                     │  APPROACH 1    │  APPROACH 2    │  APPROACH 3    │
    │                     │  No parent     │  Active compute│  Waitpoints    │
    │                     │  billing       │  only          │  (checkpoint)  │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Customer cost       │  $1,423/mo     │  $311/mo       │  $311/mo        │
    │ (AI support case)   │  (36% less)    │  (86% less)    │  (86% less, but │
    │                     │                │                │  only if customer│
    │                     │                │                │  adopts wait SDK)│
    ├─────────────────────┼────────────────┼────────────────┼─────────────────┤
    │ vs Trigger.dev      │  Still 3.5x    │  ✅ 24% cheaper │  ✅ 24% cheaper  │
    │                     │  more expensive│  (automatic)   │  (requires code) │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Implementation      │  Low           │  Medium        │  High          │
    │ complexity          │  Billing only  │  Runtime +     │  CRIU / equiv  │
    │                     │                │  metering      │  + SDK + store │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ SDK changes         │  None          │  None          │  Yes — new     │
    │                     │                │                │  wait prims    │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Customer code       │  No changes    │  No changes    │  Must adopt    │
    │ changes needed      │                │                │  wait hooks    │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Performance         │  No impact     │  No impact     │  Adds restore  │
    │ impact              │                │                │  latency       │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Revenue impact      │  Moderate      │  Large         │  Large         │
    │                     │  (~30-50%)     │  (~60-80%)     │  (~60-80%)     │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Key dependency      │  Billing       │  CPU activity  │  Checkpointing │
    │                     │  system only   │  tracking      │  infrastructure│
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ Time to ship        │  Weeks         │  1-2 months    │  3-6 months    │
    │ (estimate)          │                │                │                │
    ├─────────────────────┼────────────────┼────────────────┼────────────────┤
    │ New use cases       │  No            │  No            │  Yes — approval│
    │ unlocked            │                │                │  flows, webhook│
    │                     │                │                │  waits, long   │
    │                     │                │                │  async patterns│
    └─────────────────────┴────────────────┴────────────────┴────────────────┘


### Recommended sequencing

These approaches are not mutually exclusive. They can be shipped incrementally:

    PHASE 1 (weeks)        Approach 1 — Stop billing parents during subtask waits
                           ├── Billing-only change, no runtime work
                           ├── Immediately reduces cost 36% for orchestrator workloads
                           ├── Existing customer code benefits automatically
                           └── Buys time while Approaches 2/3 are built

    PHASE 2 (1-2 months)   Approach 2 — Active compute billing
                           ├── Closes remaining gap with Trigger.dev
                           ├── Makes us cheaper than Trigger.dev across all workloads
                           ├── Requires runtime CPU tracking (cgroups)
                           └── Still no customer code changes needed

    PHASE 3 (3-6 months)   Approach 3 — Waitpoints with checkpointing
                           ├── ADDITIVE to Phases 1+2, not a replacement
                           ├── Phases 1+2 close the pricing gap automatically
                           ├── Phase 3 unlocks NEW USE CASES that neither we
                           │   nor BG workers support today:
                           │   ├── Multi-day approval workflows
                           │   ├── Webhook wait patterns
                           │   ├── Long-running async orchestration (hours)
                           │   └── Scheduled checkpoint/resume cycles
                           ├── Full parity with Trigger.dev's developer experience
                           └── Most resource-intensive — CRIU or equivalent

    ┌──────────────────────────────────────────────────────────────────────┐
    │  Phase 1 alone:    "doesn't make sense" → "worth evaluating"       │
    │  Phases 1+2:       cheaper than Trigger.dev on every workload      │
    │  Phases 1+2+3:     cheaper + new capabilities competitors lack     │
    │                                                                     │
    │  CRITICAL: Phase 3 without Phase 2 still leaves subtask wait       │
    │  time billed for customers who don't adopt the new SDK.            │
    │  Phase 2 is what closes the gap. Phase 3 is what widens it.        │
    └──────────────────────────────────────────────────────────────────────┘


### Impact at each phase — AI Support Customer (800K req/month, Standard)

    Today                   ██████████████████████████████████████████████████ $2,224
    After Phase 1           ██████████████████████████████████ $1,423
    After Phase 2           ██████ $311
    After Phase 3           ██████ $311  (same cost, but new capabilities)
    ─────────────────────────────────────────────────────
    Trigger.dev             █████████ $409
    BG Workers              ███████████████ $700


---


## Appendix A: Plan & Platform Costs

### Workspace Plans

                            Render              Trigger.dev
    ─────────────────────────────────────────────────────────────────
    Free                    $0/mo               $0/mo
    Starter / Hobby         $0/mo               $10/mo
    Professional / Pro      $19/user/mo         $50/mo (flat)
    Organization            $29/user/mo         —
    Enterprise              Custom              Custom

    For a 5-person team:
    Render Pro:      5 × $19 = $95/month
    Trigger.dev Pro: $50/month (flat, 25 seats included)

### Compute Rates (Per Second)

    SPEC                    RENDER                  TRIGGER.DEV
    ────────────────────────────────────────────────────────────────
    0.5 CPU / 0.5 GB        Starter: $0.0000139/s   Small 1x: $0.0000338/s
    1 CPU / 2 GB            Standard: $0.0000556/s  Medium 1x: $0.0000850/s
    2 CPU / 4 GB            Pro: $0.0001111/s       Medium 2x: $0.0001700/s
    4 CPU / 8 GB            Pro Plus: $0.0002778/s  Large 1x: $0.0003400/s

### Background Worker Instances

                            Monthly     CPU        Memory
    ──────────────────────────────────────────────────────
    Starter                 $7          0.5 vCPU   512 MB
    Standard                $25         1 vCPU     2 GB
    Pro                     $85         2 vCPU     4 GB
    Pro Plus                $175        4 vCPU     8 GB
    Pro Max                 $225        4 vCPU     16 GB
    Pro Ultra               $450        8 vCPU     32 GB


### Trigger.dev Additional Costs Render Doesn't Charge

    ├── Per-run invocation: $0.000025/run ($0.25/10K, $25/1M)
    ├── Extra concurrency: $10/month per 50 concurrent runs beyond plan
    ├── Extra team seats: $20/month per seat beyond 25 (Pro)
    ├── Extra schedules: $10/month per 1,000 beyond plan limit
    ├── Extra realtime connections: $10/month per 1,000
    └── Free plan log retention: 1 day (Render: 7 days)

### Included Compute Credits

                            Render              Trigger.dev
    ─────────────────────────────────────────────────────────
    Free                    None                $5/mo
    Hobby                   None                $10/mo
    Pro                     None                $50/mo


---


## Appendix B: Real Customer Conversation Summary

Customer: AI customer support company
Volume: 600K-800K requests/month
Stack: Python backend on Render, Portkey for LLM gateway

    Current setup:           4× Pro Plus BG workers = $700/month
    CPU utilization:         < 5%
    Request profile:         10-50s wall-clock, 5-15 LLM calls per request
    Active compute:          ~2-3s per request (rest is API waits)
    Willing to pay:          Up to $1,000/month for managed workflows
    Render Workflows quote:  $2,224/month (Standard tier)
    Customer reaction:       "Many orders of magnitude greater... didn't make sense"
    Outcome:                 Stayed on background workers

    They would rather stack $175/month instances than pay for a workflow
    engine that costs 3x more — even though they want the managed features.
