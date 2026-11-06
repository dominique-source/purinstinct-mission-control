# Codex task — Simulateur financier Écoles

Implement the private financial simulator in this repository, in a feature branch / PR. The full implementation brief and reference scenario CSV are supplied separately in `purinstinct-simulateur-ecoles-codex.zip` in the ChatGPT conversation. Read them before coding.

## Non-negotiable
- Inspect existing Next.js/React/TypeScript app, UI, navigation and persistence; keep all existing features and data intact.
- Add Mission Control → Finances → Simulateur Écoles; visual first, FR-CA, CAD, responsive, 5–6 primary inputs, advanced costs collapsible, three-year comparison.
- Cost of PürInstinct workers defaults to **100 CAD per worker-hour**. Cost is NOT price. No price-per-student model.
- Year 1 illustrative costs 9,450 CAD, price 14,500; Year 2 costs 6,600, price 10,500; Year 3 costs 5,350, price 8,500. All are assumptions, not confirmed quotes.
- 15 zones × (6 active + 6 next) + 2 courts × (14 active + 14 next) = 236 participants simultaneously, not 2,000 at once. Nine waves minimum for 2,000; validate real schedule.
- Reference 5 PürInstinct staff is editable; with 17 stations and 15 school supervisors, only 2 station supervisors plus 2 coordinators are mechanically implied, so surface this inconsistency rather than silently assuming 5.
- CRITICAL: this repository is public and its README documents no authentication. The new route and any API must have SERVER-ENFORCED authorization before public deployment. Hidden navigation is not security. If auth is not configured, gate the feature OFF by default and do not deploy it publicly.
- Keep simulator storage separate from the existing `purinstinct-mission-control-v1` key.
- Implement pure finance functions and tests, run lint/typecheck/test/build, document setup, create PR with screenshots; do not merge or deploy without approval.

See attached ZIP for exact line-item cost model, UX and acceptance criteria.
