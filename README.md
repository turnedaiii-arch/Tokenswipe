# Token Swipe
Mobile-first Tinder-style token browser. Plain HTML/CSS/JS, no build step (GitHub Pages ready).

- Data: `data/tokens.json` (real FOMO cards export, copied from `/workspace/shared/fomo-cards/cards.json`).
- Field mapping: `normaliseToken()` at the top of `app.js` — edit only this if the schema changes.
- Yes hook: `onYes(token)` in `app.js` (placeholder: console.log + toast).
- Controls: ✕/✓ buttons, swipe/drag the card, ← / → keys.
- Launchpad default links (floatlaunch.xyz, @floatdotxyz) are dimmed and labelled "launchpad default".
- Images: IPFS URLs retry via dweb.link then cf-ipfs.com, then a ticker placeholder.

Run locally: `python3 -m http.server 8000` then open http://localhost:8000
