# MiniMax-M2.5 Local Test Guide (Direct Connection)

No puku-worker. No code changes. Just env vars.

---

## How It Works

MiniMax exposes an Anthropic-compatible endpoint at `https://api.minimax.io/anthropic`.  
openclaude's Anthropic SDK already supports a `ANTHROPIC_BASE_URL` override — it will call `{ANTHROPIC_BASE_URL}/v1/messages` automatically.

```
openclaude Anthropic SDK
    ↓  baseURL = https://api.minimax.io/anthropic
    ↓  Authorization: Bearer <your-token>
MiniMax /v1/messages  (native Anthropic format)
```

---

## Step 1 — Set Environment Variables

Create a `.env.local` file in `openclaude/` (never commit this):

```bash
# MiniMax direct connection
ANTHROPIC_BASE_URL=https://api.minimax.io/anthropic
ANTHROPIC_AUTH_TOKEN=<your-minimax-token>
```

> **Why `ANTHROPIC_AUTH_TOKEN` and not `ANTHROPIC_API_KEY`?**  
> `ANTHROPIC_AUTH_TOKEN` makes openclaude send `Authorization: Bearer <token>` (see `client.ts:365`).  
> `ANTHROPIC_API_KEY` sends `x-api-key: <token>` — MiniMax may not accept that header.

---

## Step 2 — Set the Model

openclaude needs to know which model to request. Two ways:

**Option A — env var** (add to `.env.local`):
```bash
ANTHROPIC_MODEL=MiniMax-M2.5
```

**Option B — CLI flag** (pass at runtime):
```bash
--model MiniMax-M2.5
```

---

## Step 3 — Run openclaude [Install bun first]

Load the env vars and start:

```bash
cd openclaude

# Export the vars
export $(cat .env.local | xargs)

# Run
bun run dev
# OR if model via flag:
bun run dev --model MiniMax-M2.5
```

---

## Step 4 — Verify It Works

In the openclaude session, run a simple test:

```
> What model are you?
```

Then test a tool call (this is the most important check):

```
> List the files in the current directory
```

If both return valid responses → integration works.

## Summary of Env Vars

| Variable | Value | Purpose |
|----------|-------|---------|
| `ANTHROPIC_BASE_URL` | `https://api.minimax.io/anthropic` | Points SDK to MiniMax |
| `ANTHROPIC_AUTH_TOKEN` | `<your-minimax-token>` | Bearer token auth |
| `ANTHROPIC_MODEL` | `MiniMax-M2.5` | Model to request |
