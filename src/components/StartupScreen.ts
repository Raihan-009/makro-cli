/**
 * Makro Code startup screen — full-frame dashboard layout.
 * MAKRO: vivid crimson gradient. CODE: white→rose→red frosted gradient.
 * Completely different from v1: outer frame, centered logos, header/footer bars.
 */

declare const MACRO: { VERSION: string; DISPLAY_VERSION?: string }

const ESC = '\x1b['
const RESET = `${ESC}0m`
const DIM = `${ESC}2m`
const BOLD = `${ESC}1m`

type RGB = [number, number, number]
const rgb = (r: number, g: number, b: number) => `${ESC}38;2;${r};${g};${b}m`

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function gradAt(stops: RGB[], t: number): RGB {
  const c = Math.max(0, Math.min(1, t))
  const s = c * (stops.length - 1)
  const i = Math.floor(s)
  if (i >= stops.length - 1) return stops[stops.length - 1]
  return lerp(stops[i], stops[i + 1], s - i)
}

function paintLine(text: string, stops: RGB[], lineT: number): string {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const t = text.length > 1 ? lineT * 0.5 + (i / (text.length - 1)) * 0.5 : lineT
    const [r, g, b] = gradAt(stops, t)
    out += `${rgb(r, g, b)}${text[i]}`
  }
  return out + RESET
}

// ─── Color Palettes ────────────────────────────────────────────────────────────

// MAKRO: vivid neon-crimson at top → deep blood red at bottom
const MAKRO_GRAD: RGB[] = [
  [255, 60, 60],
  [240, 20, 20],
  [210, 5, 5],
  [170, 0, 0],
  [130, 0, 0],
  [95, 0, 0],
]

// CODE: pure white → light rose → soft coral → warm red (frosted glow)
const CODE_GRAD: RGB[] = [
  [255, 255, 255],
  [255, 230, 230],
  [255, 185, 185],
  [250, 135, 135],
  [230, 80, 80],
  [205, 40, 40],
]

// Separator: deep red → coral → soft white peak → coral → deep red
const SEP_GRAD: RGB[] = [
  [60, 0, 0],
  [140, 25, 25],
  [210, 70, 70],
  [255, 160, 160],
  [210, 70, 70],
  [140, 25, 25],
  [60, 0, 0],
]

const ACCENT: RGB  = [255, 80, 80]
const WHITE: RGB   = [255, 255, 255]
const DIMCOL: RGB  = [140, 60, 60]
const BORD: RGB    = [110, 28, 28]   // outer frame border color
const BORD_LIT: RGB = [170, 50, 50]  // brighter border for dividers

// ─── Logos ────────────────────────────────────────────────────────────────────

const LOGO_MAKRO = [
  `\u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557  \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557`,
  `\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551 \u2588\u2588\u2554\u255d\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557`,
  `\u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2554\u255d \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2551   \u2588\u2588\u2551`,
  `\u2588\u2588\u2551\u255a\u2588\u2588\u2554\u255d\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2588\u2588\u2557 \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557 \u2588\u2588\u2551   \u2588\u2588\u2551`,
  `\u2588\u2588\u2551 \u255a\u2550\u255d \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2557\u2588\u2588\u2551  \u255a\u2588\u2588\u2557\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d`,
  `\u255a\u2550\u255d     \u255a\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d\u255a\u2550\u255d   \u255a\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d`,
]

// C(8) + space + L(8) + space + I(3) = 21 chars per line
const LOGO_CLI = [
  ` \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557      \u2588\u2588\u2557`,
  `\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d \u2588\u2588\u2551      \u2588\u2588\u2551`,
  `\u2588\u2588\u2551      \u2588\u2588\u2551      \u2588\u2588\u2551`,
  `\u2588\u2588\u2551      \u2588\u2588\u2551      \u2588\u2588\u2551`,
  `\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2551`,
  ` \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u255d`,
]

// ─── Provider detection ────────────────────────────────────────────────────────

function detectProvider(): { name: string; model: string; baseUrl: string; isLocal: boolean } {
  const useGemini = process.env.CLAUDE_CODE_USE_GEMINI === '1' || process.env.CLAUDE_CODE_USE_GEMINI === 'true'
  const useGithub = process.env.CLAUDE_CODE_USE_GITHUB === '1' || process.env.CLAUDE_CODE_USE_GITHUB === 'true'
  const useOpenAI = process.env.CLAUDE_CODE_USE_OPENAI === '1' || process.env.CLAUDE_CODE_USE_OPENAI === 'true'

  if (useGemini) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    const baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai'
    return { name: 'Google Gemini', model, baseUrl, isLocal: false }
  }

  if (useGithub) {
    const model = process.env.OPENAI_MODEL || 'github:copilot'
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://models.github.ai/inference'
    return { name: 'GitHub Models', model, baseUrl, isLocal: false }
  }

  if (useOpenAI) {
    const rawModel = process.env.OPENAI_MODEL || 'gpt-4o'
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(baseUrl)
    let name = 'OpenAI'
    if (/deepseek/i.test(baseUrl) || /deepseek/i.test(rawModel))       name = 'DeepSeek'
    else if (/openrouter/i.test(baseUrl))                               name = 'OpenRouter'
    else if (/together/i.test(baseUrl))                                 name = 'Together AI'
    else if (/groq/i.test(baseUrl))                                     name = 'Groq'
    else if (/mistral/i.test(baseUrl) || /mistral/i.test(rawModel))     name = 'Mistral'
    else if (/azure/i.test(baseUrl))                                    name = 'Azure OpenAI'
    else if (/localhost:11434/i.test(baseUrl))                          name = 'Ollama'
    else if (/localhost:1234/i.test(baseUrl))                           name = 'LM Studio'
    else if (/llama/i.test(rawModel))                                   name = 'Meta Llama'
    else if (isLocal)                                                    name = 'Local'

    let displayModel = rawModel
    const codexAliases: Record<string, { model: string; reasoningEffort?: string }> = {
      codexplan: { model: 'gpt-5.4', reasoningEffort: 'high' },
      'gpt-5.4': { model: 'gpt-5.4', reasoningEffort: 'high' },
      'gpt-5.3-codex': { model: 'gpt-5.3-codex', reasoningEffort: 'high' },
      'gpt-5.3-codex-spark': { model: 'gpt-5.3-codex-spark' },
      codexspark: { model: 'gpt-5.3-codex-spark' },
      'gpt-5.2-codex': { model: 'gpt-5.2-codex', reasoningEffort: 'high' },
      'gpt-5.1-codex-max': { model: 'gpt-5.1-codex-max', reasoningEffort: 'high' },
      'gpt-5.1-codex-mini': { model: 'gpt-5.1-codex-mini' },
      'gpt-5.4-mini': { model: 'gpt-5.4-mini', reasoningEffort: 'medium' },
      'gpt-5.2': { model: 'gpt-5.2', reasoningEffort: 'medium' },
    }
    const alias = rawModel.toLowerCase()
    if (alias in codexAliases) {
      const resolved = codexAliases[alias]
      displayModel = resolved.model
      if (resolved.reasoningEffort) displayModel = `${displayModel} (${resolved.reasoningEffort})`
    }

    return { name, model: displayModel, baseUrl, isLocal }
  }

  const model = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || 'claude-sonnet-4-6'
  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
  const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(baseUrl)
  return { name: 'Huawei', model, baseUrl, isLocal }
}

// ─── Render helpers ────────────────────────────────────────────────────────────

// Frame line: border │ + content padded to IW + border │
function framed(content: string, rawLen: number, IW: number, borderColor: RGB): string {
  const B = rgb(...borderColor)
  const pad = Math.max(0, IW - rawLen)
  return `${B}\u2502${RESET}${content}${' '.repeat(pad)}${B}\u2502${RESET}`
}

// Empty line inside frame
function emptyFrame(IW: number, borderColor: RGB): string {
  return `${rgb(...borderColor)}\u2502${RESET}${' '.repeat(IW)}${rgb(...borderColor)}\u2502${RESET}`
}

// Horizontal rule: tl + ─*IW + tr
function hRule(l: string, r: string, IW: number, borderColor: RGB): string {
  const B = rgb(...borderColor)
  return `${B}${l}${'\u2500'.repeat(IW)}${r}${RESET}`
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function printStartupScreen(): void {
  if (process.env.CI || !process.stdout.isTTY) return

  const p = detectProvider()

  // IW = inner width (space between │ chars). Outer total = IW + 2.
  // MAKRO logo lines are ~44 chars; we want breathing room → IW = 56
  const IW = 56
  const out: string[] = []

  out.push('')

  // ── Top border ──────────────────────────────────────────────────────────────
  out.push(hRule('\u250c', '\u2510', IW, BORD))

  // ── Header: makro (left)  ·  version (right) ────────────────────────────────
  const verStr = `v${MACRO.DISPLAY_VERSION ?? MACRO.VERSION}`
  const hLeftRaw  = ` \u25c6 makro`          // " ◆ makro" → 8 chars
  const hRightRaw = `${verStr} `             // "v0.1.0 " → dynamic
  const hMid = IW - hLeftRaw.length - hRightRaw.length
  const hContent =
    ` ${rgb(...ACCENT)}\u25c6${RESET} ${BOLD}${rgb(...WHITE)}makro${RESET}` +
    ' '.repeat(Math.max(0, hMid)) +
    `${DIM}${rgb(...DIMCOL)}${verStr}${RESET} `
  out.push(framed(hContent, hLeftRaw.length + Math.max(0, hMid) + hRightRaw.length, IW, BORD))

  // ── Divider after header ─────────────────────────────────────────────────────
  out.push(hRule('\u251c', '\u2524', IW, BORD_LIT))

  // ── Empty padding ────────────────────────────────────────────────────────────
  out.push(emptyFrame(IW, BORD))

  // ── MAKRO logo — centered inside the frame ───────────────────────────────────
  const makroMax = Math.max(...LOGO_MAKRO.map(l => l.length))
  for (let i = 0; i < LOGO_MAKRO.length; i++) {
    const t = i / (LOGO_MAKRO.length - 1)
    const line = LOGO_MAKRO[i]
    const lPad = Math.floor((IW - makroMax) / 2)
    const rPad = IW - lPad - line.length
    const B = rgb(...BORD)
    out.push(`${B}\u2502${RESET}${' '.repeat(lPad)}${paintLine(line, MAKRO_GRAD, t)}${' '.repeat(Math.max(0, rPad))}${B}\u2502${RESET}`)
  }

  // ── Glowing separator with diamond endpoints ─────────────────────────────────
  out.push(emptyFrame(IW, BORD))
  // "  ◆" + ─ * (IW-6) + "◆  " = IW chars
  const sepRaw = `  \u25c6${ '\u2500'.repeat(IW - 6) }\u25c6  `
  const B = rgb(...BORD)
  out.push(`${B}\u2502${RESET}${paintLine(sepRaw, SEP_GRAD, 0.5)}${B}\u2502${RESET}`)
  out.push(emptyFrame(IW, BORD))

  // ── CODE logo — centered, offset slightly right for visual balance ────────────
  const codeMax = Math.max(...LOGO_CLI.map(l => l.length))
  const codeOffset = Math.floor((IW - codeMax) / 2) + 2  // +2 for right-lean
  for (let i = 0; i < LOGO_CLI.length; i++) {
    const t = i / (LOGO_CLI.length - 1)
    const line = LOGO_CLI[i]
    const lPad = codeOffset
    const rPad = IW - lPad - line.length
    out.push(`${B}\u2502${RESET}${' '.repeat(lPad)}${paintLine(line, CODE_GRAD, t)}${' '.repeat(Math.max(0, rPad))}${B}\u2502${RESET}`)
  }

  // ── Empty padding ────────────────────────────────────────────────────────────
  out.push(emptyFrame(IW, BORD))

  // ── Provider section divider ─────────────────────────────────────────────────
  out.push(hRule('\u251c', '\u2524', IW, BORD_LIT))

  // ── Provider / Model / Endpoint ──────────────────────────────────────────────
  const provC: RGB = p.isLocal ? [120, 210, 120] : ACCENT

  const lbl = (key: string, val: string, valColor: RGB = WHITE): [string, number] => {
    const k = key.padEnd(9)
    const raw = ` ${k} ${val}`
    const styled = ` ${DIM}${rgb(...DIMCOL)}${k}${RESET} ${BOLD}${rgb(...valColor)}${val}${RESET}`
    return [styled, raw.length]
  }

  let [row, len] = lbl('Provider', p.name, provC)
  out.push(framed(row, len, IW, BORD_LIT))
  ;[row, len] = lbl('Model', p.model.length > 36 ? p.model.slice(0, 33) + '...' : p.model)
  out.push(framed(row, len, IW, BORD_LIT))
  const ep = p.baseUrl.length > 38 ? p.baseUrl.slice(0, 35) + '...' : p.baseUrl
  ;[row, len] = lbl('Endpoint', ep)
  out.push(framed(row, len, IW, BORD_LIT))

  // ── Status bar ───────────────────────────────────────────────────────────────
  out.push(hRule('\u251c', '\u2524', IW, BORD_LIT))

  const sC: RGB  = p.isLocal ? [120, 210, 120] : ACCENT
  const sLabel   = p.isLocal ? 'local' : 'cloud'
  const statusRaw     = ` \u25cf ${sLabel}   Ready \u2014 type /help to begin`
  const statusStyled  =
    ` ${rgb(...sC)}\u25cf${RESET} ` +
    `${DIM}${rgb(...DIMCOL)}${sLabel}${RESET}` +
    `   ${DIM}${rgb(...DIMCOL)}Ready \u2014 type ${RESET}` +
    `${rgb(...ACCENT)}/help${RESET}` +
    `${DIM}${rgb(...DIMCOL)} to begin${RESET}`
  out.push(framed(statusStyled, statusRaw.length, IW, BORD_LIT))

  // ── Bottom border ─────────────────────────────────────────────────────────────
  out.push(hRule('\u2514', '\u2518', IW, BORD))
  out.push('')

  process.stdout.write(out.join('\n') + '\n')
}
