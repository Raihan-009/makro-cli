/**
 * validate-config.ts
 *
 * Validates that ANTHROPIC_AUTH_TOKEN, base URL, and default model env vars
 * are correctly wired. Runs a live probe against the resolved endpoint to
 * confirm auth + connectivity in one shot.
 *
 * Usage:
 *   bun run validate-config
 *   ANTHROPIC_AUTH_TOKEN=sk-... bun run validate-config
 */

// @ts-nocheck
const STATIC_DEFAULT_BASE_URL = 'https://agione.pro/hyperone/xapi/api'
const PROBE_TIMEOUT_MS = 8000

type CheckResult = {
  ok: boolean
  label: string
  detail?: string
}

function pass(label: string, detail?: string): CheckResult {
  return { ok: true, label, detail }
}

function fail(label: string, detail?: string): CheckResult {
  return { ok: false, label, detail }
}

function masked(token: string): string {
  if (token.length <= 8) return '***'
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

// ─── Individual checks ────────────────────────────────────────────────────────

function checkAuthToken(): CheckResult {
  const token = process.env.ANTHROPIC_AUTH_TOKEN
  if (!token?.trim()) {
    return fail('ANTHROPIC_AUTH_TOKEN', 'Not set. Export ANTHROPIC_AUTH_TOKEN=<your-token>.')
  }
  return pass('ANTHROPIC_AUTH_TOKEN', `Set (${masked(token)}).`)
}

function checkBaseUrl(): CheckResult {
  const fromEnv = process.env.ANTHROPIC_BASE_URL?.trim()
  if (fromEnv) {
    return pass('ANTHROPIC_BASE_URL', `Overridden via env → ${fromEnv}`)
  }
  return pass('ANTHROPIC_BASE_URL', `Using static default → ${STATIC_DEFAULT_BASE_URL}`)
}

function resolvedBaseUrl(): string {
  return process.env.ANTHROPIC_BASE_URL?.trim() || STATIC_DEFAULT_BASE_URL
}

function checkModelVar(envVar: string, tier: string): CheckResult {
  const value = process.env[envVar]?.trim()
  if (!value) {
    return fail(envVar, `Not set. The codebase will fall back to the built-in ${tier} default (claude-* model).`)
  }
  return pass(envVar, value)
}

// ─── Live API probe ───────────────────────────────────────────────────────────

async function probeEndpoint(): Promise<CheckResult> {
  const token = process.env.ANTHROPIC_AUTH_TOKEN
  if (!token?.trim()) {
    return fail('Live API probe', 'Skipped — ANTHROPIC_AUTH_TOKEN is not set.')
  }

  const baseUrl = resolvedBaseUrl().replace(/\/$/, '')

  // Resolve the model to use: prefer ANTHROPIC_DEFAULT_SONNET_MODEL → haiku → opus → fallback
  const model =
    process.env.ANTHROPIC_DEFAULT_SONNET_MODEL?.trim() ||
    process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL?.trim() ||
    process.env.ANTHROPIC_DEFAULT_OPUS_MODEL?.trim() ||
    'claude-sonnet-4-6' // last-resort so the probe has something to send

  // Anthropic SDK appends /v1/messages to the baseURL. Most compatible providers
  // also follow this convention, so probe that path. If the baseURL already ends
  // with /v1, avoid doubling it.
  const baseTrimmed = baseUrl.replace(/\/v1\/?$/, '')
  const endpoint = `${baseTrimmed}/v1/messages`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'anthropic-version': '2023-06-01',
        'x-app': 'cli',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Reply with just the word PONG.' }],
      }),
    })

    clearTimeout(timer)

    const raw = await response.text().catch(() => '')
    const compact = raw.trim().replace(/\s+/g, ' ').slice(0, 300)

    if (response.status === 200) {
      let modelUsed = model
      try {
        const json = JSON.parse(raw)
        if (json.model) modelUsed = json.model
        const reply = json.content?.[0]?.text ?? '(no text in response)'
        return pass(
          'Live API probe',
          `200 OK — model="${modelUsed}" reply="${reply.trim().slice(0, 80)}"`,
        )
      } catch {
        return pass('Live API probe', `200 OK — model="${modelUsed}" (response body not JSON)`)
      }
    }

    if (response.status === 401) {
      return fail(
        'Live API probe',
        `401 Unauthorized — token rejected by ${baseUrl}. Check ANTHROPIC_AUTH_TOKEN.`,
      )
    }

    if (response.status === 403) {
      return fail(
        'Live API probe',
        `403 Forbidden — token valid but no access to this endpoint/model. Body: ${compact}`,
      )
    }

    if (response.status === 404) {
      return fail(
        'Live API probe',
        `404 Not Found — endpoint "${endpoint}" does not exist. Check ANTHROPIC_BASE_URL.`,
      )
    }

    return fail(
      'Live API probe',
      `Unexpected status ${response.status} from ${endpoint}. Body: ${compact}`,
    )
  } catch (err) {
    clearTimeout(timer)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes('abort')) {
      return fail('Live API probe', `Timed out after ${PROBE_TIMEOUT_MS / 1000}s — ${baseUrl} unreachable.`)
    }
    return fail('Live API probe', `Network error: ${msg}`)
  }
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function printResults(results: CheckResult[]): void {
  const width = Math.max(...results.map(r => r.label.length)) + 2
  console.log()
  for (const r of results) {
    const icon = r.ok ? '\x1b[32m✔ PASS\x1b[0m' : '\x1b[31m✘ FAIL\x1b[0m'
    const label = r.label.padEnd(width)
    const detail = r.detail ? `  ${r.detail}` : ''
    console.log(`  ${icon}  ${label}${detail}`)
  }
  console.log()
}

function printSummary(results: CheckResult[]): void {
  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  if (failed === 0) {
    console.log('\x1b[32mAll checks passed.\x1b[0m\n')
  } else {
    console.log(`\x1b[31m${failed} check(s) failed.\x1b[0m  (${passed} passed)\n`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n\x1b[1mOpenClaude config validator\x1b[0m')
  console.log('─'.repeat(50))

  const results: CheckResult[] = [
    checkAuthToken(),
    checkBaseUrl(),
    checkModelVar('ANTHROPIC_DEFAULT_SONNET_MODEL', 'Sonnet'),
    checkModelVar('ANTHROPIC_DEFAULT_HAIKU_MODEL', 'Haiku'),
    checkModelVar('ANTHROPIC_DEFAULT_OPUS_MODEL', 'Opus'),
    await probeEndpoint(),
  ]

  printResults(results)
  printSummary(results)

  if (results.some(r => !r.ok)) {
    process.exitCode = 1
  }
}

if (import.meta.main) {
  await main()
}

export {}
