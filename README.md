# Amma's 70th Bollywood Birthday Bash — Frontend

Plain HTML5 + CSS3 + Vanilla JS. No frameworks, no build step.
Open `index.html` directly in a browser (or serve via `node server.js`).

---

## Image Files

Place all four images in the `images/` folder with these exact filenames:

| Filename                    | Used in       | Description                              |
|-----------------------------|---------------|------------------------------------------|
| `amma-golden-wings.jpg`     | Scene 2 Hero  | Full-width hero — golden wings photo     |
| `amma-star-portrait.jpg`    | Scene 4 Card 1| White/pink-shawl portrait                |
| `amma-mj-dance.jpg`         | Scene 4 Card 2| Michael-Jackson-display dancing photo    |
| `amma-heart-sunglasses.jpg` | Scene 4 Card 3| Heart sunglasses / flower-filter photo   |

> Do NOT rename, replace, AI-alter, or retouch any of these images.

---

## Placeholder / Demo Data

**Scene 6 — Wishes Wall** is currently populated with 5 placeholder wishes
defined in `script.js` as `PLACEHOLDER_WISHES`. These are clearly marked and
exist solely for layout review.

---

## TODO Comments — Backend Wiring

There are two clearly marked `// TODO: connect to backend` locations:

### 1. RSVP Submission — `script.js` line ~160
```js
// TODO: connect to backend
// Replace the simulated delay below with a real fetch() call, e.g.:
//
//   fetch('/api/rsvp', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: params.toString(),
//   })
//   .then(r => r.json())
//   .then(data => showSuccess())
//   .catch(err => { console.error(err); /* show user-facing error */ });
```

Currently the form collects data into a `URLSearchParams` object, logs it to
the console, waits 1.4 s, then shows the success screen. Swap the `setTimeout`
block for the real `fetch()` call when the Google Apps Script web-app URL is ready.

### 2. Wishes Fetch — `script.js` line ~220
```js
// TODO: fetch real wishes from backend
// Replace PLACEHOLDER_WISHES above with a fetch call, e.g.:
//
//   fetch('/api/wishes')
//     .then(r => r.json())
//     .then(data => renderWishes(data.wishes))
//     .catch(() => renderWishes(PLACEHOLDER_WISHES));
```

Also marked in `index.html` with a comment just above `#wishes-track`.

---

## File Structure

```
ammas-70th-bollywood-bash/
├── index.html      ← single-page app; all 6 scenes
├── styles.css      ← full CSS; design tokens at top
├── script.js       ← all JS; major sections numbered 1-11
├── images/
│   ├── amma-golden-wings.jpg
│   ├── amma-star-portrait.jpg
│   ├── amma-mj-dance.jpg
│   └── amma-heart-sunglasses.jpg
├── README.md       ← this file
├── server.js       ← Node proxy server (backend scope, not part of this pass)
├── api/            ← backend handlers (out of scope for this pass)
└── vercel.json     ← deploy config (out of scope for this pass)
```

---

## Running Locally

```bash
node server.js
# Then open http://localhost:3000
```

Or simply double-click `index.html` (works fine for the frontend-only pass;
the fetch calls are stubbed so no server is required to review the UI).

---

## Colour Palette (CSS custom properties)

| Token          | Value     | Usage                        |
|----------------|-----------|------------------------------|
| `--pink`       | `#FF2E88` | CTAs, photo borders, curtain |
| `--orange`     | `#FF9F1C` | Gradients, petals            |
| `--magenta`    | `#6A1B9A` | Blobs, form section bg       |
| `--gold`       | `#FFD447` | Headlines, ticket labels     |
| `--teal`       | `#00BFA6` | Third photo border, "no" btn |
| `--base`       | `#1A0B2E` | Deep background              |
| `--cream`      | `#FFF8F0` | Body text                    |
