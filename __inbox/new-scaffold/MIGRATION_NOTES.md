# zudo-doc rebuild of zcss — migration notes

Tracks decisions, deltas, and upstream bugs for epic zudolab/zudo-css-wisdom#47.

## Preset

File: `__inbox/zcss-preset.json`

```json
{
  "projectName": "zudo-css-wisdom",
  "defaultLang": "en",
  "colorSchemeMode": "light-dark",
  "lightScheme": "Default Light",
  "darkScheme": "Default Dark",
  "defaultMode": "dark",
  "respectPrefersColorScheme": true,
  "features": [
    "search", "sidebarFilter", "i18n", "claudeResources", "claudeSkills",
    "sidebarResizer", "sidebarToggle", "docHistory", "llmsTxt",
    "skillSymlinker", "tauri", "footerNavGroup", "footerCopyright"
  ],
  "cjkFriendly": true,
  "packageManager": "pnpm"
}
```

### `defaultLang` pivot (manager-level decision)

The original epic preset (in the issue body) had `defaultLang: "ja"` and a post-hoc "URL override" layered on top to flip URL defaults back to EN. During Sub #49 implementation, upstream issue zudolab/zudo-doc#400 surfaced: the scaffolder bakes `defaultLang` into `src/pages/<non-default-locale>/` directory names and internal locale literal strings, so settings.ts cannot override the URL shape after the fact.

**Pivot**: change the preset's `defaultLang` to `"en"`. The scaffolder then produces the correct URL shape natively (EN at `/docs/`, JA at `/ja/docs/`) without any override. This is a strict improvement over the epic's original plan — simpler, no impedance mismatch, less work in Sub #49.

Trade-off: the preset's `defaultLang` no longer reflects the authoring-source language preference (JA was the historical origin). This is a semantic mismatch for the preset, but the preset's role is to drive scaffolding, not to document authoring history. The rebuild makes EN the URL default, which matches the live production site.

Upstream issue zudolab/zudo-doc#400 stays open as a real framework bug — it will affect other consumers who genuinely need a post-hoc default-locale flip.

## Scaffold version snapshot

Generated via:

```
node /Users/takazudo/repos/myoss/zudo-doc/packages/create-zudo-doc/dist/index.js \
  --preset ./zcss-preset.json --name new-scaffold --no-install
```

Then `pnpm install --ignore-workspace --prefer-offline` inside `__inbox/new-scaffold/` to produce `pnpm-lock.yaml`.

### Top-level dependency delta (scaffold vs pre-rebuild zcss)

| Package | zcss pre-rebuild | scaffold | Change |
|---------|------------------|----------|--------|
| astro | ^6.0.4 | ^5.18.0 | DOWN (major) |
| @astrojs/mdx | ^5.0.0 | ^4.3.0 | DOWN (major) |
| @astrojs/react | ^4.0.0 | — | REMOVED |
| @astrojs/preact | — | ^4.x | NEW |
| react + react-dom | ^18.x | — | REMOVED |
| preact | — | ^10.x | NEW |
| shiki + @shikijs/transformers | — | — | REMOVED (pagefind-based search) |
| pagefind | — | ^1.x | NEW |
| remark-cjk-friendly | — | ^2.x | NEW (from cjkFriendly: true) |
| remark-directive | ^4.0.0 | ^3.0.0 | DOWN (major) |
| @types/node | ^25.3.5 | ^22.0.0 | DOWN (major, still within engines >=20) |
| lefthook + prettier + prettier-plugin-astro + vitest | present | — | REMOVED |

## Scaffold templates used

- `templates/base/` — core layer.
- `templates/features/i18n/` — applied because preset included `"i18n"`.
- `templates/features/search/`, `sidebarFilter/`, `claudeResources/`, `claudeSkills/`, `sidebarResizer/`, `sidebarToggle/`, `docHistory/`, `llmsTxt/`, `skillSymlinker/`, `tauri/`, `footerNavGroup/`, `footerCopyright/` — each applied per preset.

## Applied preset features

All 13 features in the preset were applied. See `__inbox/new-scaffold/package.json` + `src/integrations/` for the resulting integrations.

## Upstream zudo-doc bugs surfaced during this rebuild

| Issue | Title | Impact on this rebuild |
|---|---|---|
| zudolab/zudo-doc#393 | breadcrumb trees on `src/pages/<locale>/docs/[...slug].astro` use the wrong locale | Will still manifest once content lands; cross-locale breadcrumb hops on click. Non-blocking for URL parity. |
| zudolab/zudo-doc#395 | `zudo-doc-version-bump` skill references non-existent `pnpm b4push` script | zcss has its own b4push; no impact. |
| zudolab/zudo-doc#397 | `src/pages/en/index.astro` hardcodes 概要 as overview CTA label | With `defaultLang: "en"` there is no `src/pages/en/` dir, but the source template still has the bug for other consumers. Currently the EN landing is `src/pages/index.astro`; the JA landing `src/pages/ja/index.astro` may have the mirror bug (English literal on a JA page). To verify during Sub #58. |
| zudolab/zudo-doc#399 | preset `cjkFriendly: true` does not propagate to `settings.ts` | Hand-flip `cjkFriendly: true` in settings.ts when porting (Sub #49 equivalent). |
| zudolab/zudo-doc#400 | scaffolder bakes defaultLang into `src/pages/` directory names and locale literals | Worked around by changing preset `defaultLang` to `"en"` (the pivot above). |
| zudolab/zudo-doc#402 | scaffold `.gitignore` missing `.DS_Store`, `.env`, `*.log`, `.wrangler` | Merged in by Sub #57 equivalent when porting `.gitignore`. |
| zudolab/zudo-doc#405 | consolidated: 16 pre-existing `pnpm check` TS errors (settings-types gaps for tagPlacement/frontmatterPreview/tagVocabulary/tagGovernance/githubUrl, dangling scaffold references, unconditional mermaid import, LanguageSwitcher prop mismatch, frontmatter-preview JSX type) | Supersedes #401/#403/#404. zcss does not use any of these features, so no workaround needed in zcss settings.ts. The 16 errors persist in `pnpm check` until upstream fixes. Non-blocking for URL parity and content rendering. |

## Sub #54 script decisions

Phase 3 port of zcss custom scripts and package.json wiring (issue
zudolab/zudo-css-wisdom#54). Landed in worktree
`zudo-doc-rebuild/sub54-scripts`.

Ported into `__inbox/new-scaffold/scripts/`:

| Script | Notes |
|---|---|
| `check-links.js` | Post-build link checker, `--strict` mode used by `pnpm check:links`. |
| `dev-stable.js` | Build-then-serve fallback dev mode. Not referenced from package.json; kept as a manual utility (`node scripts/dev-stable.js`) because the scaffold ships no equivalent. |
| `generate-css-wisdom.js` | Regenerates `.claude/skills/css-wisdom/SKILL.md` from `descriptions.json`. Driven by `pnpm generate:css-wisdom`. |
| `run-b4push.sh` | Pre-push orchestrator (typecheck + build + link check). Driven by `pnpm b4push`. |
| `version-bump.sh` | Release helper. Not wired into `package.json`; invoked manually (`./scripts/version-bump.sh …`). |
| `__tests__/check-links.test.ts` | Unit tests for `check-links.js`. `vitest.config.ts` currently only scans `e2e/`, so these tests are not yet included by `pnpm test`; widening the include pattern is Sub #58 territory. |

Deliberately NOT ported:

- **zcss's `scripts/setup-doc-skill.sh`** — superseded. zcss's own
  `package.json` no longer calls this file (the live `setup:doc-skill`
  entry is an inline `node … && ln -sfn …`). It was legacy/dead in
  zcss already, so porting it would be importing stale code.
- **`scripts/__tests__/setup-doc-skill.test.ts`** — its subject
  (`setup-doc-skill.sh`) is not in the port, so the test would be
  dangling. Also, the test's expected doc-category tree (`getting-started/`,
  `guides/`, `reference/`, `components/`) does not match zcss's actual
  tree (`layout/`, `typography/`, `styling/`, …) and would fail against
  the live content.

Deleted from the scaffold:

- **`__inbox/new-scaffold/scripts/setup-doc-skill.sh`** (provided by
  the `skillSymlinker` feature). The scaffold's version generates a
  generic SKILL.md templated for `<HtmlPreview>` demos and a
  project-name-derived skill name (`new-scaffold-wisdom`). zcss's
  SKILL.md is curated via `generate-css-wisdom.js` + a static
  `descriptions.json`, and demos use `<CssPreview>`, so the scaffold
  script would produce the wrong shape. `setup:doc-skill` in
  `package.json` is overridden to point at zcss's inline
  generate-and-symlink flow instead.

`package.json` merge result (scripts section):

- Added: `predev`, `dev` (with `--port 8811 --host css-bp.localhost`),
  `dev:network`, `check:links`, `b4push`, `generate:css-wisdom`.
- Overridden: `setup:doc-skill` (see above).
- Left untouched (scaffold defaults): `build`, `preview`, `check`,
  `dev:tauri`, `build:tauri`. Overriding `check` (`astro check` →
  `astro sync && tsc --noEmit` in zcss) and `preview` (`--port 8811`
  in zcss) is out of Sub #54 scope; Sub #58 can revisit if actually
  needed.

No new zudo-doc upstream issues surfaced by this port.

## Sub #56 workflow port

Phase 3 port of zcss GitHub Actions workflows (issue
zudolab/zudo-css-wisdom#56). Landed in worktree
`zudo-doc-rebuild/sub56-gh-actions`.

Copied verbatim from `.github/workflows/` to `__inbox/new-scaffold/.github/workflows/`:

| Workflow | Trigger | Purpose |
|---|---|---|
| `main-deploy.yml` | push to `main` | Build + Cloudflare Pages production deploy + IFTTT notify |
| `pr-checks.yml` | pull_request to `main` | Typecheck + build + link check + Cloudflare Pages preview deploy + PR comment |
| `preview-deploy.yml` | push to `preview` / `expreview/*` | Branch-based preview deploys to Cloudflare Pages with commit status |

### Version alignment

- `actions/checkout@v5`, `actions/setup-node@v5`, `actions/github-script@v8`, `pnpm/action-setup@v4` — all current.
- `node-version: 22` in all three workflows. Satisfies scaffold's documented Node.js >= 20 (zcss CLAUDE.md).
- pnpm version comes from `packageManager` field via `pnpm/action-setup@v4`. zcss source specifies `pnpm@10.30.3`; scaffold's `package.json` currently has **no** `packageManager` or `engines` field (scaffold gap). CI will still resolve pnpm via the action's default, but for reproducible builds the scaffold's `package.json` should gain `packageManager: pnpm@10.x` + `engines.node: ">=20"`. Out of Sub #56 scope — flag for Sub #58 / #59 to add before repo-root swap.

### Command references

| Workflow step | Command | Scaffold `package.json` mapping |
|---|---|---|
| Type Check | `pnpm check` | `astro check` (scaffold default). zcss uses `astro sync && tsc --noEmit`; scaffold version is less strict but still catches type errors. |
| Build | `pnpm build` | `astro build` ✓ |
| Link Check | `node scripts/check-links.js` | matches Sub #54's ported `scripts/check-links.js`. Note: workflow invokes the script directly (non-strict), while `pnpm check:links` in `package.json` passes `--strict`. Kept verbatim to match current production CI semantics. |

### Secrets

Verified via `gh secret list --repo zudolab/zudo-css-wisdom`:

- `CLOUDFLARE_ACCOUNT_ID` ✓
- `CLOUDFLARE_API_TOKEN` ✓
- `IFTTT_PROD_NOTIFY` ✓

### Project references

Both Cloudflare deploy steps use `--project-name=zudo-css`, preserving the existing Pages project binding. Base path `/pj/zcss/` preserved in `_redirects` + deploy directory shape.

### Validation

- `actionlint` not installed on the agent host — skipped per Sub #56 directive. Workflows will be validated by GitHub's own parser at PR time.
- YAML syntactic validity confirmed via `js-yaml` parse (3/3 files OK).

### No upstream bug filed

The zudo-doc scaffolder has no github-actions feature template — this is by design, not a bug. Features dir listing confirms: `bodyFootUtil/`, `claudeResources/`, `designTokenPanel/`, `docHistory/`, `footer/`, `i18n/`, `imageEnlarge/`, `llmsTxt/`, `search/`, `sidebarResizer/`, `sidebarToggle/`, `tagGovernance/`, `tauri/`, `versioning/`. Consumers bring their own CI. Not filing.

## Sub #55 .claude resources port

Phase 3b port of zcss `.claude/` content into the scaffold (issue zudolab/zudo-css-wisdom#55). Session was restarted mid-phase; port executed by manager directly, not via child agent.

### Ported

- `__inbox/new-scaffold/.claude/agents/ja-translator.md` — subagent for EN → JA doc translation.
- `__inbox/new-scaffold/.claude/skills/b4push/SKILL.md` — pre-push quality gate invocation.
- `__inbox/new-scaffold/.claude/skills/l-writing/SKILL.md` — MDX writing rules for docs.
- `__inbox/new-scaffold/.claude/skills/l-translate/SKILL.md` — translate EN docs to JA via `ja-translator` subagent.
- `__inbox/new-scaffold/.claude/skills/l-demo-component/SKILL.md` — CssPreview usage guide.
- `__inbox/new-scaffold/.claude/skills/l-handle-deep-article/SKILL.md` — deep-article conversion guide.
- `__inbox/new-scaffold/.claude/skills/css-wisdom/descriptions.json` — **source only**. `SKILL.md`, `docs/`, `docs-ja/` in this dir are generated by `scripts/generate-css-wisdom.js` at setup time (gitignored, not ported).

### NOT ported

- `.claude/skills/zcss-wisdom/` — entirely generated by the scaffold's `skillSymlinker` feature at setup time (absolute symlinks to `src/content/docs` and `src/content/docs-ja` + a templated `SKILL.md`). The scaffold's `scripts/setup-doc-skill.sh` was dropped by Sub #54 in favour of zcss's inline `setup:doc-skill` package.json script; but the skillSymlinker feature still produces a zcss-wisdom-equivalent directory when that script runs. Nothing to port as tracked content.

### Feature-interaction conflict audit

The preset enables three `.claude/skills/`-touching features: `claudeResources`, `claudeSkills`, `skillSymlinker`. No write-path overlap observed:

| Feature | What it writes |
|---|---|
| `claudeResources` | Build-time generator under `src/integrations/claude-resources/`; writes to `src/content/docs/claude*/` at build time (these paths gitignored per the zcss .gitignore merge by Sub #57). Does NOT touch `.claude/skills/`. |
| `claudeSkills` | Scaffolds the 3 zudo-doc-* starter skills (zudo-doc-design-system, zudo-doc-translate, zudo-doc-version-bump) under `.claude/skills/`. Disjoint names from zcss skills — no overlap. |
| `skillSymlinker` | Generates a project-wisdom skill via `scripts/setup-doc-skill.sh`. Sub #54 dropped the scaffolder-supplied script in favour of zcss's inline `setup:doc-skill` in package.json. The run output is zcss-wisdom/ under `.claude/skills/` (gitignored). No overlap with zcss custom skills. |

Authoritative source for each `.claude/skills/<name>/` path:

- `b4push`, `l-demo-component`, `l-handle-deep-article`, `l-translate`, `l-writing` — hand-written, tracked (ported by Sub #55).
- `css-wisdom` — `descriptions.json` tracked, `SKILL.md` + `docs/` + `docs-ja/` generated by `pnpm generate:css-wisdom`.
- `zcss-wisdom` — entirely generated by `pnpm setup:doc-skill` (gitignored).
- `zudo-doc-design-system`, `zudo-doc-translate`, `zudo-doc-version-bump` — shipped by the `claudeSkills` scaffold feature (kept as-is; they cover zudo-doc conventions that are orthogonal to zcss custom skills).

## Sub #58 verification — BLOCKED on upstream fixes

End-to-end verification of `__inbox/new-scaffold/` (issue zudolab/zudo-css-wisdom#58). Manager-run inside the in-flight rebuild branch `base/zudo-doc-rebuild`.

### Results

| Check | Result |
|---|---|
| `pnpm install` (clean) | ✓ pass |
| `pnpm check` | 16 errors (pre-existing framework gaps, zudolab/zudo-doc#405, non-blocking) |
| `pnpm build` | ✓ pass, 211 pages (104 EN + 105 JA + 2 root), 193 search entries, llms.txt OK |
| `pnpm check:links --strict` | ✗ 43 broken internal links |
| `pnpm b4push` | NOT run (chain-fails on `check:links`) |
| URL parity audit | Partial — EN / JA landings + all content pages rendered; `/pj/zcss/docs/` and `/pj/zcss/ja/docs/` 404 because no `src/pages/docs/index.astro` (neither new scaffold nor old zcss ships one; but the new scaffold's `tags/` page generates links to them) |

### Broken-links root cause

The scaffold ships `src/plugins/remark-resolve-markdown-links.ts` whose `hasMarkdownExtension()` only matches URLs ending in `.mdx` or `.md`. zcss MDX convention (per zcss CLAUDE.md) drops the `.mdx` extension on relative links (`[text](./sibling)`). The plugin skips these, and under `trailingSlash: true` the raw `./sibling` href resolves to a child of the current URL directory — 404.

Filed upstream as zudolab/zudo-doc#406 with repro + suggested fix.

### Workaround options considered

1. **Fix zcss MDX** (add `.mdx` extensions to all relative links across 182 MDX files) — rejected. Violates epic's "byte-identical content copy" rule.
2. **Hand-patch scaffold plugin** — rejected. Violates epic's "fix zudo-doc and re-scaffold" rule.
3. **Wait for zudolab/zudo-doc#406** — accepted path. Epic Sub #58 acceptance rule: "Do not proceed to Sub-12 until this task is all-green."

### Decision

**Halt before Sub #59** (destructive repo-root swap). Current `base/zudo-doc-rebuild` has:
- Full scaffold regenerated with `defaultLang: "en"`
- All Phase 2 ports (settings, sidebars, EN docs, JA docs, CssPreview + TailwindPreview, misc files)
- All Phase 3 ports (scripts, .claude resources, GitHub Actions)
- `mermaid` dep installed as workaround for zudolab/zudo-doc#405 unconditional-import bug

Push current state to origin, mark root PR WIP with the blocker, and resume once upstream fixes land.

### Follow-ups before Sub #59 becomes safe

- zudolab/zudo-doc#406 — extensionless relative MDX links (HIGHEST — blocks the epic).
- zudolab/zudo-doc#405 — 16 pre-existing `pnpm check` TS errors (medium — non-blocking for build/URL parity but blocks a green `pnpm b4push`).
- zudolab/zudo-doc#393 — breadcrumb cross-locale hop (low — affects UX after swap, not URL parity).
- zudolab/zudo-doc#397 — hardcoded 概要 on EN landing (low — with `defaultLang: en` the symptom is now hypothetical; verify no mirror bug on `src/pages/ja/index.astro`).
- zudolab/zudo-doc#402 — gitignore gaps in scaffold (low — Sub #57 merged them; upstream fix avoids future consumers hitting it).

## Concerns for downstream

- `patches/astro@6.0.4.patch` will not apply on astro 5.18. Sub #57 equivalent decides drop/retarget/defer.
- React → Preact switch. Sub #53 equivalent must verify `<CssPreview>` and `<TailwindPreview>` work under Preact compat. Empirically the current CssPreview only uses `ReactNode` type + `useMemo`, which Preact handles fine.
- `__inbox/` .gitignore adjusted so `__inbox/new-scaffold/` content tracks but `node_modules/dist/.astro/.output/.wrangler/.playwright-cli/.DS_Store` inside the scaffold stays ignored.
