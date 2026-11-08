# Technical Requirements

The goal is to ensure simplicity and maintainability

## Requirements
- This is an offline application 
- It should have all dependencies bundled
- It is intended to be shipped as a standalone executable

## Code Style
- Keep comments to an absolute minimum, only for when descriptive naming cannot explain what is going on
- Focus on descriptive function and variable naming
- The goal is to keep things as simple as possible
- Do not create 'util' files that act as a dumping ground for various functions to be grouped
- Create one file per export, folders can be used to group similar functions
- Tests will be located in a separate file named `<file>.test.ts` alongside the respective file

## Unit Testing
- Unit testing is a hard-requirement for all application code
- Use mocking to ensure that tests focus on their particular code unit
- Focus on relevant equivalence partitions rather than high code coverage

## Linting
- All files are subject to linting
- Double quotes and semicolons should be used
- Max line length of 120
- No nested ternaries
- Maximum function length should be 40 lines
- No trailing commas

# Tech Stack (verified November 2026)

All versions below were checked against the npm registry, and the marked "Verified" items were additionally tested live against the `examples/` corpus during planning.

## Application shell

| Package | Version | Role |
|---|---|---|
| electron | 45.2.3 | Desktop shell; embeds Chromium + Node. Chosen over Tauri because the whole pipeline is JS-native (sharp, ffmpeg child process, ONNX) and Electron's Chromium guarantees a consistent runtime for image preview and ONNX execution, without a Rust toolchain or webview fragmentation (WebKitGTK/WebView2) |
| electron-vite | 6.0.0 | Build tooling for main/preload/renderer (peer-compatible with Vite 8) |
| electron-builder | 26.18.0 | Packaging to standalone executables (nsis/AppImage/dmg), bundles ffmpeg + model assets via `extraResources`, `asarUnpack` for sharp native binaries |
| vite / @vitejs/plugin-react | 8.3.6 / 6.2.1 | Renderer bundling |
| react / react-dom | 19.3.1 | UI |
| typescript | 5.9.x (latest 5.x) | TypeScript 7.0 exists but typescript-eslint 8.72 peers require `>=4.8.4 <6.1.0`, so pin 5.9 until that widens |

Node engine: `>=22.12.0` (Electron 45's floor).

## Image + video engine

| Package | Version | Role |
|---|---|---|
| sharp | 0.35.5 | All non-video image work: decode/encode PNG + WebP (static *and* animated WebP), resize, pad to square with 16px transparent margin, palette quantisation, byte-size measurement (this is what enables the 300KB budget visualisation the ffmpeg CLI could not do). Ships prebuilt libvips 8.18.7 binaries — no system dependencies. **Verified:** loads `examples/webp/*` fine; 512x512 PNG of a sample measures ~246KB (< 300KB). |
| ffmpeg-static | 5.3.0 | VP8/VP9 (WebM) decoding and APNG encoding as a child process. Downloads a fully static ffmpeg binary (ships as ffmpeg 7.0.2) at install time; bundle it into the app with electron-builder `extraResources` — this removes the historical "requires a system dependency" drawback. **Verified:** the bundled binary contains the `apng` encoder and converted all 24 `examples/webm/*` fixtures successfully. |

Important verified facts that shape the design:

- ffmpeg-static's bundled ffmpeg 7.0.2 is a capable image encoder too — verified: it contains `apng`, `libwebp` and `libwebp_anim` encoders, and successfully encoded static WebP (with alpha) and a valid animated WebP from the corpus fixtures. So it *could* replace sharp for encoding.
- But ffmpeg cannot *inspect* images cleanly, and the no-sharp probing alternatives are all weak (verified):
  - `ffprobe-static` (3.1.0) ships an ffprobe **4.0.2 from 2018** — stale and mismatched against ffmpeg 7;
  - `@ffprobe-installer/ffprobe` (2.1.2) ships ffprobe 5.x — also stale, slow-moving;
  - parsing `ffmpeg -i` stderr works but is fragile, and duration/frame counts require a full `-f null -` decode pass.
- Probing is the backbone of the app (constraint validation, budget badges, the fit-to-budget loop), so sharp stays as the inspection + static-image engine. Keeping sharp is also slightly lighter: sharp's libvips (~35MB) + ffmpeg (~80MB) vs a second ffmpeg binary (~65-80MB) + ffmpeg.
- sharp **cannot** decode WebM (it is video, not an image format) — ffmpeg-static is the only decode path for `examples/webm/*`.
- sharp **cannot** write APNG through its JS API: feeding it an animated input and `.png()` output flattens to a single frame (sharp issue #3551; re-verified on 0.35.5). APNG encoding therefore goes through ffmpeg's `apng` encoder.
- The user's historical pipeline (below) runs unmodified with ffmpeg-static. Measured on the corpus at 320x320: 14/24 APNGs already fit under 300KB; 10 do not, which is exactly what the in-app fit-to-budget loop (tune `fps`, `max_colors`, scale) resolves automatically.

Division of labour: **sharp = inspect + encode for static images (and source stats); ffmpeg = all video work (WebM decode, APNG encode, palette pipeline).**

## Legacy ffmpeg pipeline (kept as the default "animated" preset)

The following filter graph is the starting preset inside the app (previously run by hand against a system ffmpeg):

```
for i in *.webp; do
  ffmpeg -i "$i" -vf "palettegen=max_colors=128:stats_mode=diff" "${i%.*}_palette.png"

  ffmpeg -i "$i" -i "${i%.*}_palette.png" -filter_complex \
    "[0:v] scale=320:320:force_original_aspect_ratio=decrease:flags=gauss, \
     pad=320:320:(ow-iw)/2:(oh-ih)/2:color=#000000, \
     unsharp=3:3:0.3:3:3:0.05, \
     fps=15, \
     colorkey=#000000:0.04:0.04 [new]; \
     [new][1:v] paletteuse=dither=floyd_steinberg:diff_mode=rectangle" \
    -plays 0 -compression_level 9 "${i%.*}.apng"

  rm "${i%.*}_palette.png"
done
```

Adjustments when ported into the app:

- `pad=...:color=#000000` becomes transparent padding; `colorkey` is only applied when the source has an opaque background (Telegram WebM stickers have black backgrounds, so it stays in the default WebM preset).
- Output canvas defaults to 512x512 (Signal's max), with a per-sticker override — the 300KB budget often forces 320 or 256.
- A **fit-to-budget ladder** re-runs the encode with progressively lower settings until the output is <= 307,200 bytes and <= 3 seconds:
  1. trim duration to 3s, `fps` 15
  2. `max_colors` 128 -> 64 -> 32, dither off
  3. canvas 512 -> 320 -> 256
  4. `fps` 15 -> 10 -> 8
- Two ffmpeg invocations (palettegen then paletteuse) can be collapsed to one using `palettegen` + `paletteuse` via `split` in a single `filter_complex`; keep either form — simplicity wins.

## Background removal

| Package | Version | Role |
|---|---|---|
| @imgly/background-removal | 1.7.0 | ONNX (u2net-class) segmentation run in the Electron **renderer** (Chromium handles the WASM/ONNX inference happily). Peer dependency is exactly `onnxruntime-web@1.21.0` — pin that exact version |
| onnxruntime-web | 1.21.0 | inference backend (imgly pins this exact version, not the 1.31.x latest) |

The Node twin `@imgly/background-removal-node` 1.4.5 exists but is stale: it drags in its own `sharp ~0.32.4` and `onnxruntime-node ~1.17.0` (verified from registry metadata), which duplicates native binaries and fights sharp 0.35.5. Prefer the renderer package; only fall back to the node variant if main-process inference is ever required.

Offline constraints (verified against the package docs/README):

- Model + WASM assets are downloaded from IMG.LY's CDN at runtime **by default**; for an offline app they must be pre-downloaded once at build time and shipped as `extraResources`, with the library's `asset_path` option pointed at the local folder. Model choice: `small` (quantized) or `medium` (~80MB, default) — expose as a setting.
- Licensing: AGPL-3.0. Fine for an open-source/offline personal tool; flag before any closed-source distribution.

## Signal export

Export produces a folder containing:
- one Signal-compliant file per sticker (`001.webp` / `002.png` / `003.apng`, ...) already resized, squared, margin-padded, <= 300KB, animations <= 3s
- a `pack.json` sidecar: `{ title, author, cover, stickers: [{ file, emoji }] }` (max 200 stickers)

The user imports the folder's files into Signal Desktop's built-in sticker pack creator, which performs hosting and yields the `signal.art/addstickers/#pack_id=...&pack_key=...` share URL.

## Architecture

```
src/
  main/            electron main process
    image/         sharp wrappers (one file per operation: resizeToSquare, addMargin, quantise, measureSize, ...)
    video/         ffmpeg-static wrappers (probeDuration, extractPoster, encodeApng, palettePass)
    validation/    stickerConstraint checks (sizeBytes, dimensions, square, duration, count)
    pack/          sticker model, pack.json read/write, exportFolder writer
    ipc/           typed IPC handlers (thin; logic lives in the modules above)
  preload/         typed bridge exposing ipc to the renderer
  renderer/        react UI (pack grid, budget badges, emoji picker, per-sticker optimise panel)
                   + segmentation/ (imgly background removal runs here, in Chromium)
```

- All image/video processing runs in the main process (background removal is the one exception, running in the renderer's Chromium); the renderer otherwise only renders state over typed IPC.
- ffmpeg is invoked via `child_process` with the binary path resolved from `ffmpeg-static` (dev) or `process.resourcesPath` (packaged). Inject the binary path so tests can substitute a stub executable.
- `StickerConstraint` checks are pure functions over a small `StickerStats` record so the UI badges and the optimiser share one source of truth.

## Testing (vitest 5.1.0)

- Unit tests colocated as `<file>.test.ts` (per Code Style); vitest, happy-dom for renderer component tests.
- ffmpeg/sharp/imgly wrappers get focused integration tests that run against `examples/` fixtures (they are fast enough: the full corpus converts in seconds) — the "mocking" rule applies to everything *consuming* these wrappers, which should mock the wrapper module, not the binary.
- Golden rules asserted across the whole corpus: output exists, `bytes <= 307200`, `width == height <= 512`, animated outputs report APNG (`acTL` chunk present), duration <= 3s.
- The fit-to-budget loop gets an equivalence-partition test using fixtures spanning the measured size range (e.g. `webm/20` ~132KB vs `webm/9` ~513KB at default settings).

## Lint/Format tooling (matches the Linting section above)

- eslint 10.14.0 (flat config) + typescript-eslint 8.72.1
- Rules: `quotes: double`, `semi: always`, `max-len: 120`, `no-nested-ternary`, `max-lines-per-function: 40`, `no-trailing-spaces`
- prettier 3.x with `semi: true`, `singleQuote: false`, `printWidth: 120`, `trailingComma: "none"` (note: prettier 3 defaults to `"all"`, must be set explicitly)

## Packaging notes

- `electron-builder` config: `asarUnpack: ["**/node_modules/sharp/**", "**/node_modules/@img/**"]`; `extraResources`: ffmpeg binary, `resources/onnx/**` (background removal assets).
- Standalone executables: AppImage (Linux), NSIS portable (Windows), dmg/zip (macOS).
- Licensing to keep in mind at distribution time: ffmpeg-static's default binary build is GPL-3.0 (an LGPL build source exists if that ever matters), imgly background-removal is AGPL-3.0, everything else MIT/Apache.

# Extra Info

FFMPEG was previously used for this with a system install; the two drawbacks noted before ("requires a system dependency" and "cannot easily show which files exceed 300KB") are resolved by:

- `ffmpeg-static` bundling a self-contained ffmpeg binary inside the app, and
- measuring output sizes directly from the encode results (or sharp for images) to drive the budget badges in the UI.
