# Grand Slam Fantasy 2026 — public read-only starter

This is a functional static leaderboard and team viewer. It refreshes published `data.json` every 60 seconds, but does **not** include a live darts feed, an authentication system or a private admin panel. Only someone with repository/deployment access can edit the published data. Don't put API keys in this folder or in browser JavaScript.

## Phone-friendly deployment

1. Create a private GitHub repository and upload `index.html` and `data.json` (or use a public repository with no private information).
2. Import the repository into Vercel, framework preset Other, and deploy.
3. Share the resulting `*.vercel.app` URL.
4. Edit `data.json` in GitHub to publish teams and point totals. Vercel will redeploy automatically when connected to GitHub.

## Data format

`teams` is an array of objects with `name`, `manager`, `picks` (array of six exact player names), and `captain` (one of the six). `points` is a map from player names to their cumulative fantasy points. The website calculates team totals and doubles the captain score. Example:

```json
{
  "updated": "2026-11-14 18:00 GMT",
  "teams": [{"name":"The 180 Club","manager":"Example","picks":["Luke Littler","Luke Humphries","Josh Rock","Beau Greaves","Lisa Ashton","Joe Hunt"],"captain":"Luke Littler"}],
  "points": {"Luke Littler": 10, "Luke Humphries": 5}
}
```

Do not publish names without consent. This starter does not enforce budgets, locked submissions, or admin permissions through a database. Those must be implemented server-side for the full product.

## Planned automatic update

A secure scheduled backend should read the Darts API key from server-side environment secrets, request verified match data, deduplicate matches, apply agreed fantasy scoring, and publish refreshed `data.json`. Confirm the provider's endpoint schema and 100+ checkout availability before implementing. Never expose the key in the website.
