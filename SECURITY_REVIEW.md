# Security review — 20-point pen-test checklist (2026-11-19)

ConsensusGraph is a fully static, client-only tool for detecting agreement/
contradiction between research claims — no backend, no accounts, no
database. Core detection runs via an offline heuristic (Jaccard topic
overlap + polarity/negation); an optional Gemini key refines the summary,
stored only in the user's own `localStorage` and used only for direct
browser → Google API calls (bring-your-own-key, same pattern as `loom`,
`prompt-forge` and `vision-bridge` elsewhere in this portfolio). Reviewed
`app.js` and `core.js` in full.

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | HTTP/2 Rapid Reset | N/A | Static site, no backend server. |
| 2 | bcrypt 72-byte limit | N/A | No passwords/accounts. |
| 3 | SAML signature bypass | N/A | No SAML. |
| 4 | nOAuth | N/A | No OAuth. |
| 5 | GraphQL alias batching | N/A | No GraphQL. |
| 6 | TOTP replay | N/A | No TOTP/2FA. |
| 7 | ReDoS | No | The only regex is `esc()`'s `/[&<>]/g`; the claim-overlap/polarity detection uses word-splitting and set operations, not regex matching over arbitrary-length input. |
| 8 | JWT algorithm confusion | N/A | No JWTs. |
| 9 | HTTP request smuggling | N/A | No backend; the only network calls are direct browser → Google's Gemini API. |
| 10 | Web cache poisoning | N/A | No backend responses. |
| 11 | Spoofed X-Forwarded-For | N/A | No server-side code, no IP-based logic. |
| 12 | Postgres views bypassing RLS | N/A | No database. |
| 13 | `Math.random()` for security tokens | N/A | No tokens/ids — no auth, no session. |
| 14 | Timing attacks on secret comparison | N/A | No secret comparison. |
| 15 | Padding oracle | N/A | No encryption. |
| 16 | Server-side prototype pollution | N/A | No backend at all. |
| 17 | Server-side template injection | N/A | No server-side templating. Client-side, every user-entered claim text and every rendered pairwise comparison in `app.js` (the graph tooltip, the analysis table, the contradiction summary) is passed through `esc()` before insertion into `innerHTML`; the one AI-generated field (the Gemini-refined summary) is assigned via `textContent`, never parsed as HTML. |
| 18 | XXE | N/A | No XML parsing. |
| 19 | Cross-site WebSocket hijacking | N/A | No WebSocket endpoint. |
| 20 | Unicode username normalization | N/A | No usernames/login. |

## Summary

No findings. Fully static, bring-your-own-key client app with no backend;
user-entered claim text is consistently escaped before being placed in
HTML, and the one AI-generated output is rendered as plain text content.
