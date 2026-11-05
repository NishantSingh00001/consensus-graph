# ConsensusGraph

**Scientific contradiction detection — in your browser.**

Collect research claims from papers and sources, and see where the literature agrees, contradicts, or merely relates — as a living, physics-driven graph. Analysis runs offline with a transparent heuristic (topic overlap + polarity + negation); an optional free Gemini key refines verdicts and summaries. Nothing is uploaded.

## Pages
- **Home** (`index.html`) — landing with a live 3D knowledge-graph hero.
- **Claims** (`claims.html`) — build a claim library (text + source); add/remove; load a curated sample set.
- **Graph** (`graph.html`) — interactive force-directed graph; nodes are claims, edges colored by verdict (agree / conflict / related); hover to read; live consensus stats.
- **Analysis** (`analysis.html`) — transparent pairwise verdict table + a consensus summary (optionally AI-refined).
- **Settings** (`settings.html`) — theme, accent, Gemini key, export.

## Highlights (50+ features)
Claim library with sources, sample corpora, topic-overlap detection (Jaccard), polarity analysis, negation handling, pairwise verdicts (support/contradict/related), relevance score, consensus percentage, conflict count, interactive force-directed graph with physics layout, node hover tooltips, verdict-colored edges, analysis table sorted by verdict, AI-refined summary (Gemini), JSON export/import, 3D knowledge-graph hero (Three.js), custom cursor, ambient motion, scroll reveals, shortcuts, autosave, offline-first, responsive.

## How detection works
Two claims are compared only if their keyword sets overlap (Jaccard ≥ 14%). Each claim gets a polarity from an increase/decrease lexicon, flipped by negation. Opposite polarity on a shared topic → **contradict**; same polarity → **support**; otherwise **related**. It's a transparent heuristic you can read — the Gemini option adds LLM judgment on top.

## Deploy (free)
Static site, no build. Upload the folder to GitHub → Netlify/Vercel. Local: `python3 -m http.server`.

## Tech
Vanilla HTML/CSS/JS + Three.js (bundled locally). Fonts: Spectral, Space Grotesk, IBM Plex Mono.
