# Signal Sticker Optimiser

An offline desktop app that turns the images and animations you already have into
sticker files Signal will accept. It handles PNG, JPG, WebP, WebM, GIF and AVIF
sources, resizes and pads them to a square canvas, knocks out backgrounds, and
re-encodes anything that is too big until it fits the budget.

Nothing leaves your machine. There is no server, no account and no telemetry; the
model used for background removal is bundled with the app.

## Signal limits the app enforces

- 512 x 512 px square canvas with a 16 px transparent margin
- 300 KB or less per sticker file
- 3 seconds or less for animations
- 200 stickers or fewer per pack
- PNG or WebP for still stickers, APNG for animated ones (GIFs are never produced)

## Getting started

Requires Node 22.12 or newer.

```bash
npm install
node scripts/fetch-segmentation-assets.mjs   # one-time model download for Remove BG
npm run dev                                  # run against the sources
npm run dist                                 # packaged build in dist/
```

The model download step is only needed if you want the background remover, and only
once; it fills `resources/onnx/`, which is bundled into packaged builds. The app
itself never reaches the network.

Other commands: `npm test` runs the unit and corpus tests, `npm run lint` the
linter, `npm run build` the bundling step on its own.

npm 11 and newer only run install scripts you have approved, so `package.json` approves
`ffmpeg-static`; without that entry its binary is never downloaded. Electron 42 and newer
have no install script at all — their binary is fetched the first time `npm run dev`,
`npm run dist` or `npx electron` runs, or earlier with `npx install-electron`.

## Using the app

1. Import files or Import folder picks the stickers to work on. A spinner shows
   while the folder is being read and converted.
2. Each tile shows a badge with the file size, dimensions and, for animations, the
   duration. Green means the sticker is within Signal limits; red means it is over
   budget and Signal would reject it.
3. Optimise re-encodes a single sticker and works down a quality ladder (colour
   count, dithering, canvas size, frame rate) until the result is under 300 KB.
4. Resize replaces the canvas with 512, 320 or 256 px.
5. Remove BG segments the subject locally and makes everything else transparent.
   It is only offered for images that do not already have an alpha channel. For
   animations the first frame is segmented and the resulting matte is applied to
   every frame.
6. Remove takes the sticker out of the pack.
7. Export pack asks for a folder and writes one numbered file per sticker:
   `001.webp`, `002.png`, `003.apng`, and so on. If anything in the pack is still
   over budget, the export is refused and a notification names the offenders.

Problems are reported as dismissible notifications in the corner of the window.

The pack itself is not saved to disk. When you close the app you start from an
empty grid again, so export before you quit.

## Making the pack in Signal

Signal only creates packs from Signal Desktop, so the Optimiser stops at the files.

1. Put Signal Desktop's sticker pack creator in drop mode and add the exported
   files, up to 200 at a time.
2. Assign one emoji to each sticker; Signal requires exactly one.
3. Give the pack a title and an author. The cover defaults to the first sticker and
   must be a 512 x 512 PNG or WebP.
4. Upload. Signal puts the pack on its CDN and gives you an install link of the
   form `https://signal.art/addstickers/#pack_id=...&pack_key=...`.
5. Install the pack from that link, and share the link if you want other people to
   have it.

Uploaded packs cannot be edited afterwards. If something needs fixing, change the
files here and upload the pack again.

Emoji, title, author and cover are set in Signal, not here: this app only produces
the sticker files themselves.

## Test corpus

`examples/webp/` (40 still WebP stickers) and `examples/webm/` (24 animated WebM
stickers) are read-only fixtures that live in this checkout but are not committed.
Every conversion path round-trips both corpora in the test suite, which also
asserts the size, dimension and duration limits.
