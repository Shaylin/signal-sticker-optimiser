# Development Roadmap

A build order for an agent to take this project from empty repo to shipped app. Each phase is independently verifiable and ends with tests green. All versions are the ones pinned in TECHNICAL.md (verified November 2026); don't drift to unlisted majors without re-checking the peer constraints noted there.

## Ground rules

- `examples/webp/` (40 static WebP, 512x443) and `examples/webm/` (24 animated VP9 WebM, 512x387, ~1s) are read-only test fixtures — never write into `examples/`, never modify or commit changes to it.
- Follow the Code Style, Unit Testing, and Linting sections of TECHNICAL.md from the first file created.
- Work in `src/main` first (pure processing), UI last. Every phase's acceptance criteria run against the fixtures.

## Phase 0 — Scaffold (no logic)

- `package.json`: `"type": "module"`, engines `>=22.12.0`; scripts: `dev` (electron-vite), `test` (vitest), `lint` (eslint), `format` (prettier), `dist` (electron-builder).
- Install: electron 45.2.3, electron-vite 6.0.0, electron-builder 26.18.0, vite 8.3.6, @vitejs/plugin-react 6.2.1, react/react-dom 19.3.1, typescript 5.9.x, sharp 0.35.5, ffmpeg-static 5.3.0.
- Dev: vitest 5.1.0, eslint 10.14.0, typescript-eslint 8.72.1, prettier 3.x with the exact rule values in TECHNICAL.md (including `trailingComma: "none"`).
- electron-vite config with main/preload/renderer targets; one empty window; one trivial vitest test.
- **Accept:** `npm run dev` opens a window; `npm test`, `npm run lint` pass.

## Phase 1 — Sticker model + constraint checks

- `src/main/pack/`: `Sticker`, `StickerPack` types; `pack.json` read/write.
- `src/main/validation/`: pure checks from `StickerStats`: `withinByteBudget` (307200), `withinDimensions` (512), `isSquare`, `withinDuration` (3s), `withinPackSize` (200). One file per check.
- **Accept:** equivalence-partition unit tests per check (at/over/under boundaries); no I/O in these modules.

## Phase 2 — Static image pipeline (sharp only)

- `src/main/image/`: `readImageStats`, `fitToSquareCanvas` (contain + transparent pad + 16px margin), `encodeStaticSticker` (webp or png), `measureEncodedSize`.
- Pipeline: any raster input -> 512x512 square, 16px margin, transparent background -> WebP (prefer, smaller) or PNG fallback when WebP > budget.
- **Accept:** all 40 `examples/webp/*` files convert; every output asserts `bytes <= 307200`, `width == height <= 512`; stats round-trip tests match `ffprobe`/`file` expectations recorded in the phase test.

## Phase 3 — Animated pipeline (ffmpeg-static + APNG)

- `src/main/video/`: `resolveFfmpegPath` (dev: `ffmpeg-static`, packaged: `process.resourcesPath/ffmpeg`), `probeStats` (duration, dims, frames via `-hide_banner -print_format json -show_streams`), `encodeAnimatedSticker` implementing the preset filter graph from TECHNICAL.md ("Legacy ffmpeg pipeline") against the ffmpeg binary passed in via options.
- `fitUnderBudget` optimiser: binary/ladder search over the documented settings until `bytes <= 307200` and `duration <= 3s`.
- **Accept:** all 24 `examples/webm/*` files convert to APNG; every output passes Phase 1 checks (detect APNG via `acTL` chunk); the 10 fixtures that exceed 300KB at default settings (notably `webm/9`, ~513KB) all converge at a ladder rung below default; total corpus run < 2 minutes.

## Phase 4 — Background removal

- `src/renderer/segmentation/`: `removeBackground(input: Blob): Promise<Blob>` via `@imgly/background-removal` 1.7.0 + `onnxruntime-web` 1.21.0 (exact peer pin), with the library's `asset_path` pointed at locally bundled assets; add a `scripts/fetch-segmentation-assets.mjs` that downloads model assets once (dev-time only) into `resources/onnx/` (~44MB `small`, ~80MB `medium`; expose model choice).
- Only invoke when the source has no usable alpha (decision is a pure predicate, unit-tested). Results flow back to main over IPC like any other edited sticker.
- **Accept:** a few static fixtures (e.g. `webp/29`) processed with `hasAlpha` after removal; unit tests mock the imgly module; one integration test gated behind an env flag and vitest browser mode (asset download is ~100MB).

## Phase 5 — UI (renderer)

- Pack grid over IPC: import files/folder, thumbnails (sharp-generated PNG previews), per-sticker badge showing KB vs 300KB budget (red/green), dimensions, duration; controls per sticker: enable background removal, resize preset, optimise, remove from pack.
- Pack panel: title, author, cover picker, emoji assignment per sticker (emoji picker), 200-sticker guard.
- Typed IPC: logic stays in main-process modules; preload exposes a narrow, typed API.
- **Accept:** renderer component tests (happy-dom) for badge/optimise flows with mocked main modules; manual run: import both example folders, see 10 webm stickers flagged over budget, press optimise, see them turn green.

## Phase 6 — Export + packaging

- `src/main/pack/exportFolder.ts`: write `NNN.webp|png|apng` files + `pack.json` (schema in INFORMATION.md).
- electron-builder config per TECHNICAL.md packaging notes (`extraResources` ffmpeg + onnx assets, `asarUnpack` sharp).
- **Accept:** `npm run dist` produces a Linux AppImage (plus Windows/macOS where CI allows); on a machine without ffmpeg installed system-wide, the packaged app converts the full `examples/` corpus end-to-end and the export folder re-opens as valid sticker files.

## Definition of done

The app builds to a standalone offline executable; imports WebP/WebM/any raster, flags and auto-fixes every Signal constraint, removes backgrounds offline, exports an import folder that becomes a shareable pack in Signal Desktop; the complete `examples/` corpus passes the golden-rule tests in CI (`npm test`).
