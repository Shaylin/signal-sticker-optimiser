# Signal Sticker Studio

The goal of this project is to create an offline application that can be used to convert images or animations into sticker packs for the Signal messenger application.

Typically, stickers come to other platforms first in the form of webp images or webm video animations (e.g. Telegram exports). These are the two inputs the app must handle, alongside plain user images (png, jpg, etc.).

This project will assist users in converting these packs into packs that are compatible with Signal.

It should also allow users to author their own sticker packs using their own custom images.

## Signal Sticker Limitations

Signal is only compatible with the following image formats:

- PNG or WEBP for static non-animated stickers
- APNG for animated stickers

Additionally, Signal has the following size and aspect limitations:

- Each sticker must be 300KB or less
- Each sticker can be at most 512x512 in dimensions
- Stickers must be square in aspect ratio
- A 16px margin is advised for stickers
- Each animated sticker can be at most 3 seconds long in duration
- A pack may contain at most 200 stickers
- Each sticker gets exactly one assigned emoji (used as a shortcut in Signal)
- A pack has a title and an author; the cover must be a 512x512 PNG or WebP (defaults to the first sticker)

## How packs are shared

Packs can only be *created* from Signal Desktop (File -> Create/Upload Sticker Pack). Signal uploads the pack to its CDN and produces a share link of the form:

```
https://signal.art/addstickers/#pack_id=<hex>&pack_key=<hex>
```

The app's export path is therefore an **offline export**: produce a folder of Signal-compliant sticker files plus a metadata sidecar (title, author, emoji per sticker). The user drags the files into Signal Desktop's sticker pack creator, and Signal generates the share URL.

## Examples corpus (test material)

The `examples/` folder is the reference test corpus and should be treated as read-only fixtures:

- `examples/webp/` — 40 static (single-frame) WebP stickers, 512x443, RGBA, 17-74 KB each. Verified to load fine in sharp/libvips.
- `examples/webm/` — 24 animated VP9/WebM stickers, 512x387, ~1 second / ~30 frames each, 55-258 KB each. WebM is *video*; libvips/sharp cannot decode it, so video decoding is the ffmpeg side of the pipeline.

Every conversion feature must round-trip the entire corpus without errors, and every produced sticker must satisfy the constraints above (see acceptance criteria in ROADMAP.md).

## Desired Functionality

- Create sticker packs in a user interface that allows people to import one or more images
- Convert incompatible image formats to be compatible with signal
- Visualise which stickers in the pack exceed signal size limits
- Auto-remove backgrounds from non-transparent images
- Be able to resize or optimise individual images and animations within a sticker pack, including automatic "fit under 300KB" optimisation
- Assign one emoji per sticker, plus title/author/cover for the pack
- Finally, export to a signal sticker pack: an import folder whose files Signal Desktop turns into a shareable pack

## Non-Goals

- No server component, no cloud processing, no telemetry — the app is fully offline
- No sticker *consumption* (browsing/installing packs) — creation and conversion only
- No support for Telegram's `.tgs` (Lottie) stickers in v1
