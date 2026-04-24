# MIGRATION_NOTES — zudo-doc rebuild (Sub #48)

Snapshot of the fresh `create-zudo-doc` scaffold generated for epic #47
(zudolab/zudo-css-wisdom). This file lives at `__inbox/new-scaffold/` and is
only a staging artefact — the sub-issues under #47 migrate zcss content into
it and then the whole scaffold is swapped into the repo root in Sub #59.

## How this scaffold was produced

```sh
cd __inbox
node /Users/takazudo/repos/myoss/zudo-doc/packages/create-zudo-doc/dist/index.js \
  --preset ./zcss-preset.json \
  --name new-scaffold \
  --no-install
```

The positional `projectName` in the preset is `"zudo-css-wisdom"`; `--name
new-scaffold` overrides it so the output folder lands at
`__inbox/new-scaffold/` instead of a nested `__inbox/zudo-css-wisdom/`. The
scaffolder consumed the preset, filled in any omitted options with its
non-interactive defaults, and composed the templates described below.

`pnpm install --ignore-workspace --prefer-offline` was then run inside
`__inbox/new-scaffold/` to produce `pnpm-lock.yaml` and verify the scaffold
is self-consistent. `--ignore-workspace` was a safety belt — this repo has
no `pnpm-workspace.yaml`, so there was no workspace to stumble over.

## Applied preset features

From `__inbox/zcss-preset.json`:

```
search, sidebarFilter, i18n, claudeResources, claudeSkills,
sidebarResizer, sidebarToggle, docHistory, llmsTxt, skillSymlinker,
tauri, footerNavGroup, footerCopyright
```

Color scheme: `light-dark` with `Default Light` / `Default Dark`, defaulting
to dark and respecting the OS `prefers-color-scheme`. Package manager:
`pnpm`. `cjkFriendly: true` in the preset (see Concerns).

## Scaffold templates used

Base layer:

- `templates/base/` — shared framework: `astro.config.ts` shell,
  `src/content.config.ts`, `src/pages/`, `src/layouts/`, `src/components/`,
  `src/integrations/`, `src/plugins/`, `src/config/`, `src/styles/`,
  `src/utils/`, `src/hooks/`, `src/types/`, `tsconfig.json`, `scripts/`,
  scaffold `CLAUDE.md`, scaffold-level `.gitignore`.

Per-feature layers (`templates/features/<feature>/`) composed on top of
base for every preset feature that has a template dir:

- `templates/features/search/`
- `templates/features/i18n/`
- `templates/features/claudeResources/`
- `templates/features/sidebarResizer/`
- `templates/features/sidebarToggle/`
- `templates/features/docHistory/`
- `templates/features/llmsTxt/`
- `templates/features/tauri/` — produces `src-tauri/` (Cargo.toml, main.rs,
  tauri.conf.json, capabilities, build.rs)
- `templates/features/footer/` — pseudo-feature triggered by
  `footerNavGroup` and `footerCopyright`

Features handled without a separate template dir (per
`create-zudo-doc/src/features/index.ts`):

- **sidebarFilter** — baked into `src/components/sidebar-tree.tsx`, stays in
  base.
- **claudeSkills** — `scaffold.ts` copies `zudo-doc-*` skills
  (design-system, translate, version-bump) from the zudo-doc monorepo into
  `.claude/skills/`.
- **skillSymlinker** — `scaffold.ts` produces `scripts/setup-doc-skill.sh`
  and wires the matching `setup:doc-skill` package.json script.

## Version delta table

"Before" = `/Users/takazudo/repos/wisdom/zudo-css-wisdom/package.json` on
`base/zudo-doc-rebuild` (the pre-rebuild zcss). "After" =
`__inbox/new-scaffold/package.json` as produced by the scaffolder.

| Dep | Before (zcss) | After (scaffold) | Change | Notes |
|---|---|---|---|---|
| astro | ^6.0.4 | ^5.18.0 | **MAJOR DOWN** | Scaffold ships the zudo-doc-blessed Astro 5 line. Re-upgrade to 6 is a separate concern — today's `patches/astro@6.0.4.patch` will need replanning. |
| @astrojs/mdx | ^5.0.0 | ^4.3.0 | **MAJOR DOWN** | Paired with Astro 5. |
| @astrojs/react | ^5.0.0 | — | **REMOVED** | Scaffold switches the islands runtime to Preact. |
| @astrojs/preact | — | ^4.1.0 | **NEW** | With `compat: true`, so React-shaped code can keep its `react`/`react-dom` import specifiers via the alias. |
| react | ^19.2.4 | — | **REMOVED** | Preact compat replaces runtime React. |
| react-dom | ^19.2.4 | — | **REMOVED** | Ditto. |
| preact | — | ^10.26.0 | **NEW** | Runtime for islands. |
| @tailwindcss/vite | ^4.2.1 | ^4.2.0 | patch float | Same major. |
| tailwindcss | ^4.2.1 | ^4.2.0 | patch float | Same major. |
| @shikijs/transformers | ^4.0.1 | ^4.0.0 | patch float | Same major. |
| shiki | ^4.0.2 | — | **REMOVED** | Scaffold relies on Astro-bundled Shiki; direct import is gone. Any custom `import { ... } from "shiki"` in migrated code must switch to Astro's re-export or re-add shiki explicitly. |
| remark-directive | ^4.0.0 | ^3.0.0 | **MAJOR DOWN** | Scaffold pins v3. Our admonition pipeline must verify compatibility when sub-issues port remark plugins. |
| unist-util-visit | ^5.1.0 | ^5.1.0 | none | |
| clsx | ^2.1.1 | ^2.1.0 | patch float | |
| diff | ^8.0.3 | ^8.0.3 | none | (Scaffold keeps v8 for the DocHistory diff view.) |
| github-slugger | ^2.0.0 | ^2.0.0 | none | |
| gray-matter | ^4.0.3 | ^4.0.0 | patch float | |
| minisearch | ^7.2.0 | ^7.2.0 | none | |
| remark-cjk-friendly | — | ^2.0.1 | **NEW** | Declared by the scaffold because the preset has `cjkFriendly: true` — but see the Concerns section. |
| @astrojs/check | ^0.9.7 | ^0.9.0 | patch float | |
| @types/hast | ^3.0.4 | ^3.0.4 | none | |
| @types/mdast | ^4.0.4 | ^4.0.4 | none | |
| @types/node | ^25.3.5 | ^22.0.0 | **MAJOR DOWN** | Scaffold pins Node 22 types. Our CI / engines > 20 remains compatible. |
| @types/react | ^19.2.14 | ^19.2.0 | patch float | Scaffold keeps React types for Preact `compat` typings. |
| @types/react-dom | ^19.2.3 | — | **REMOVED** | No standalone react-dom types needed with Preact. |
| typescript | ^5.9.3 | ^5.9.0 | patch float | |
| pagefind | — | ^1.4.0 | **NEW** | Scaffold wires Pagefind as the search backend. |
| lefthook | ^1.11.13 | — | **REMOVED** | Sub-issues port back via scripts. |
| prettier | ^3.5.3 | — | **REMOVED** | Ditto. |
| prettier-plugin-astro | ^0.14.1 | — | **REMOVED** | Ditto. |
| vitest | ^3.2.1 | — | **REMOVED** | Ditto. |

### Astro patch

Current `package.json` has:

```
"pnpm": {
  "patchedDependencies": {
    "astro@6.0.4": "patches/astro@6.0.4.patch"
  }
}
```

The scaffold is on Astro 5, so the existing patch file cannot apply as-is.
Downstream sub-issues must decide whether the patch is still needed, and if
so re-issue against whichever Astro version the rebuilt repo lands on.

## Scaffold layout snapshot

```
__inbox/new-scaffold/
├── .claude/skills/
│   ├── zudo-doc-design-system/
│   ├── zudo-doc-translate/
│   └── zudo-doc-version-bump/
├── .gitignore                  (scaffold-level: node_modules, dist, .astro, src-tauri/{target,gen})
├── CLAUDE.md                   (scaffold default — Sub #57 replaces with zcss CLAUDE.md)
├── astro.config.ts
├── package.json
├── pnpm-lock.yaml
├── scripts/
│   └── setup-doc-skill.sh
├── src/
│   ├── components/             (admonitions, doc-history, sidebar-tree, search, etc.)
│   ├── config/                 (settings.ts, color-schemes.ts, sidebars.ts, ...)
│   ├── content.config.ts
│   ├── content/
│   │   ├── docs/               (default lang == ja; has the starter "ようこそ" page)
│   │   └── docs-en/            (EN locale dir per i18n feature)
│   ├── hooks/
│   ├── integrations/
│   ├── layouts/doc-layout.astro
│   ├── pages/                  (404.astro, docs/, en/, index.astro)
│   ├── plugins/                (remark + rehype plugin set)
│   ├── scripts/
│   ├── styles/
│   ├── types/
│   └── utils/
├── src-tauri/                  (tauri feature output)
└── tsconfig.json
```

## URL-shape override — **deferred to Sub #49**

The preset's `defaultLang: "ja"` caused the scaffold to treat Japanese as
the default locale. In the generated `src/config/settings.ts`:

```
docsDir: "src/content/docs",                               // -> ja
locales: { en: { label: "EN", dir: "src/content/docs-en" } },
```

And in `astro.config.ts` the i18n block hard-codes `defaultLocale: "ja"`
and builds the locale list from `["ja", ...Object.keys(settings.locales)]`.

Epic #47 overrides this to preserve the live zcss URL shape (EN at
`/docs/…`, JA at `/ja/docs/…`). **Sub #48 intentionally does NOT edit the
scaffold to fix this** — the scaffolder rule forbids hand-patching output
that the scaffolder should generate. Sub #49 will flip `docsDir`, `locales`,
and the `astro.config.ts` i18n block, and content files will be moved from
the scaffold's `src/content/docs-en/` into `src/content/docs/` plus
`src/content/docs/` starter into `src/content/docs-ja/`.

## Concerns for downstream sub-issues

1. **`cjkFriendly` mismatch**. The preset sets `cjkFriendly: true` and the
   scaffold installs `remark-cjk-friendly`, but the generated
   `src/config/settings.ts` hard-codes `cjkFriendly: false`. The
   `astro.config.ts` gates `remarkCjkFriendly` behind that flag, so the
   plugin is loaded at the npm level but not registered at runtime. Sub #49
   can flip `settings.cjkFriendly` to `true` while porting settings — this
   does **not** need a scaffolder hand-edit here. Worth reporting upstream
   to `zudo-doc` as a preset-to-settings bug.
2. **React vs Preact**. Today's zcss has hand-written React components
   (notably `<CssPreview>` and `<TailwindPreview>`). The scaffold uses
   Preact with `compat: true`, so most React code should transpile
   unchanged, but anything depending on React-specific runtime internals
   (concurrent features, `react-dom/client`, React devtools hooks) needs
   sub-issue attention. Owner: Sub #53 (port custom components).
3. **Astro downgrade**. The re-scaffold effectively downgrades Astro from
   6.0.4 to 5.18.x. This is the zudo-doc-blessed line today. If the team
   prefers to stay on Astro 6, the right path is to bump `zudo-doc` itself
   and re-scaffold, not to hand-edit the output here.
4. **Custom patches**. `patches/astro@6.0.4.patch` will not apply on Astro
   5.18. Sub #57 (misc files) should carry the decision forward — either
   drop the patch, re-target it at 5.18, or defer until the Astro re-bump.
5. **Node types downgrade**. `@types/node` 22 vs 25. Engines remains
   `>=20`, so no runtime break, but TS type surfaces change slightly (e.g.
   `Stream.Duplex` symbol names). Sub-issues that touch Node APIs should
   re-run `pnpm check` after porting.

## Upstream bugs surfaced by codex review

A `/codex-review` pass on the Sub #48 diff flagged three issues inside the
scaffolder output. Per the epic rule _"Do not hand-edit scaffold output to
fix something the scaffolder should generate"_, Sub #48 intentionally does
not patch them. They belong upstream at `zudo-doc` (via
`/refer-another-project -u zudo-doc …`) so a future re-scaffold produces
correct output. Logged here so they are not lost between sub-issues.

- **Breadcrumb trees use the wrong locale.**
  `src/pages/en/docs/[...slug].astro` calls `buildNavTree("ja", …)` and
  `src/pages/docs/[...slug].astro` calls `buildNavTree("en", …)` — so
  English pages build their breadcrumb nav from the Japanese tree and vice
  versa. Clicking a breadcrumb item cross-hops locales. Fix upstream in
  zudo-doc's `templates/base/src/pages/.../[...slug].astro`.
- **`pnpm b4push` referenced but not defined.** The scaffold ships
  `.claude/skills/zudo-doc-version-bump/SKILL.md`, which instructs the
  release workflow to run `pnpm b4push`. The scaffold's `package.json` has
  no `b4push` script, so the skill dead-ends. Fix upstream: either have
  `zudo-doc` emit a `b4push` stub in `package.json` for projects that opt
  into `zudoDocVersionBump`, or soften the skill's hard dependency on that
  script. (zcss already has its own `b4push` pipeline — Sub #54 restores
  it, so zcss itself will be fine post-rebuild; the upstream concern is
  other consumers of the template.)
- **English homepage CTA hardcodes `概要`.**
  `src/pages/en/index.astro` (line ~52) hardcodes the Japanese string
  `概要` as the overview CTA label on the EN landing page. Fix upstream so
  the EN template uses an English label (or threads the label through the
  i18n dictionary). Downstream zcss may replace this page entirely in
  Sub #57, but the upstream bug remains for other consumers.

## Build verification

**Not** run in Sub #48 by design — `/x-wt-teams` rules ban heavy test /
build work in child agents. `pnpm install` succeeded and produced a clean
lockfile, which is enough here. Full `pnpm build` in `__inbox/new-scaffold/`
is the acceptance criterion for Sub #58 (manager-side verification).

## Sub #57 — misc files ported (decisions log)

This section captures the judgement calls made while porting the
repo-level misc files. Written as decisions + rationale so Sub #58 /
Sub #59 can adjust if any trade-off was wrong.

### Verbatim copies (no decision needed)

- `CLAUDE.md` — overwrites the scaffold's placeholder with zcss's real
  project instructions (bilingual rule, content categories, CssPreview
  conventions, Claude Code skill references).
- `README.md` — zcss public README (bilingual JA/EN, tech stack, commands,
  css-wisdom skill hint).
- `public/favicon.ico`, `public/img/{logo.svg, ogp.png, social-card.jpg,
  speed-lines.svg}` — the live-site static assets. `favicon.ico` in the
  source repo is actually an SVG with an `.ico` name; copied as-is.
- `.env.example` — AI chat config template (`AI_CHAT_MODE`,
  `ANTHROPIC_API_KEY`).

### Dotfiles (scaffold ships none of these, so zcss copies kept)

- `.mdx-formatter.json` — `@takazudo/mdx-formatter` config. Ignores
  multi-line JSX formatting for `CssPreview` and `TailwindPreview` so
  demo content indentation isn't mangled.
- `.prettierrc` — registers `prettier-plugin-astro` for `.astro` files.
  Prettier itself is not in the new scaffold's devDependencies (scaffold
  dropped prettier and vitest — see the version delta table above). Sub
  #54 is expected to reintroduce prettier + this config still applies.
- `.npmrc` — pnpm hardening:
  - `strictDepBuilds=true` blocks all dependency lifecycle scripts by
    default (defensive against supply-chain attacks).
  - `ignoredBuilds[]=core-js`, `ignoredBuilds[]=core-js-pure` — these
    packages' postinstall is just a donation banner; silencing the pnpm
    warning without opening a hole.
  - `package-manager-strict-version=false`, `trust-policy=permissive` —
    cross-machine developer convenience.

### `.gitignore` — merged, not replaced

The scaffold shipped a 7-line `.gitignore` (`node_modules`, `dist`,
`.astro`, `src-tauri/target`, `src-tauri/gen`). Merged zcss-specific
project-root entries above the scaffold defaults:

- Staging / worktree scratch: `__inbox/`, `worktrees/`
- Unversioned data dirs: `src/data/`, `doc/`
- Generated Claude skills (machine-specific absolute paths):
  `.claude/skills/css-wisdom/SKILL.md`,
  `.claude/skills/css-wisdom/docs`,
  `.claude/skills/css-wisdom/docs-ja`,
  `.claude/skills/zcss-wisdom/`
- Build-time claude-resources docs: `src/content/docs/claude/`,
  `claude-agents/`, `claude-md/`, `claude-skills/`

**Not merged** (on purpose): the generic entries a modern Node project
always wants — `.DS_Store`, `.env`, `.env*.local`, `*.log`, `.wrangler/`.
These are scaffold's responsibility, not zcss-specific overrides. Filed
upstream as **zudo-doc#402**. When the scaffolder starts shipping those,
the zcss repo will inherit them automatically on the next re-scaffold.

`git status` inside `__inbox/new-scaffold/` after `pnpm install` +
`pnpm check` shows no untracked files, with the expected `--ignored`
paths only: `node_modules/`, `.astro/`, `src/content/docs/claude-md/`,
`src/content/docs/claude-skills/`, `src/content/docs/claude/`. Merge is
working.

### E2E — vitest, not Playwright

Issue #57 titles the file bundle "playwright", but zcss's e2e suite is
actually a vitest-based static OGP meta-tag check against the built
`dist/` tree (no browser automation). Neither the scaffold nor the live
zcss repo contains a `playwright.config.ts`. Decision tree resolved as
follows:

- Scaffold ships no `playwright.config.ts` → fall back to "copy both".
- zcss has no `playwright.config.ts` to copy → copy the actual config
  zcss uses (`vitest.config.ts`) alongside `e2e/ogp.test.ts`.

Files ported:

- `e2e/ogp.test.ts` — walks `dist/`, asserts every non-404 HTML page has
  `og:title`, `og:type=website`, `og:url` and `og:image` on the
  production domain (`takazudomodular.com`), `og:site_name`, and
  `twitter:card=summary_large_image`.
- `vitest.config.ts` — 8-line config pinning `test.include` to
  `e2e/**/*.test.ts`.

`vitest` itself is **not yet in `package.json`** — the scaffold dropped
it per the Sub #48 version-delta table. Reintroducing vitest to
devDependencies is Sub #54's lane (or a post-swap follow-up). `pnpm test`
won't run until then; `pnpm check` already ignores e2e/ (astro check
only scans the Astro import graph), so there is no check regression
from copying these files into the scaffold without vitest installed.

### `patches/astro@6.0.4.patch` — **DROPPED**

The zcss repo carries a 980-byte pnpm patch that targets `astro@6.0.4`.
The patch is a defensive two-line fallback for a Rollup module-ordering
issue — when `astroFileToCompileMetadata.get(filename)` returns
`undefined` during build, the patched code re-reads the parent `.astro`
file from disk and compiles it as a fallback.

Decision: **DROP** the patch entirely. Rationale:

1. The patch pins the exact version `astro@6.0.4`. pnpm will refuse to
   apply it against any other version; the scaffold is on `^5.18.0`, so
   the patch is a dead file today.
2. The scaffold's `package.json` carries no `pnpm.patchedDependencies`
   block, so nothing references the file. There is no stale pointer to
   clean up.
3. The underlying Rollup ordering issue does not obviously reproduce on
   Astro 5.18 (zcss's most recent Sub #48 install succeeded cleanly
   without the patch).
4. Keeping a commented-out `patches/` directory creates maintenance
   confusion for future contributors.

If the bug reappears on 5.18.x or when zudo-doc eventually re-bumps to
Astro 6, the patch is trivially recoverable from git history on
`base/zudo-doc-rebuild` (pre-swap commits) — re-target it against the
version in use at that time, not `6.0.4`.

### `pnpm check` status

Ran `pnpm install --prefer-offline --ignore-workspace` and then
`pnpm check` inside `__inbox/new-scaffold/` after all Sub #57 file
additions. Result:

- **16 errors, 0 warnings, 6 hints** — identical to the pre-Sub #57
  baseline. All 16 errors are scaffold-internal: `settings.ts` in the
  scaffold lacks `tagPlacement`, `tagVocabulary`, `tagGovernance`,
  `frontmatterPreview`, `docsSubdir`, etc., which are zcss site
  features that Sub #49 (settings) will restore.
- No error originates from any file ported in Sub #57. `e2e/ogp.test.ts`
  is outside the Astro import graph and is not scanned by astro check.
- Sub #58 is the right gate for "check passes cleanly" — it runs after
  #49 + #54 have restored settings and scripts.
