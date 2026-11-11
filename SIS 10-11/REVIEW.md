# SIS 10–11 submission review

Review date: 11 November 2026. Original Word and PowerPoint files were preserved.
This review distinguishes the supplied historical reports from independently
executed checks of this repository. It is not a claim of instructor acceptance.

## Coverage

| Deliverable | Assessment | Remaining verification / handover |
| --- | --- | --- |
| 1. Test Cases and Testing Results | Covers more than three core features; expected/actual columns and provenance are present. | Retain historical results as historical; attach fresh command logs for the delivered revision. |
| 2. Updated Issue Log | Six prioritized issues; two selected corrections and four open issues are clearly separated. | Confirm implementation before retaining resolved status in the final revision. |
| 3. Technical Debt List | Four debt items with impact and repayment criteria; exceeds the minimum of two. | Keep frontend component/browser coverage distinct from filter-function unit tests. |
| 4. Improved Product / MVP | Before/after operator-reason evidence is present; warning recovery is described. | Add actual warning-error and successful-retry screenshots of the delivered application. The report is not the executable MVP. |
| 5. Updated User Stories and Product Backlog | Specific acceptance criteria and a ClickUp screenshot are included. | Refresh actual board statuses/attachments; distinguish administrative assignees from code authors. |
| 6. Change Request Document | CR-01 precisely defines prefix search and five status options. | Preserve whole-field prefix semantics, initial Held, Clear => empty query + All, and RU/KZ. |
| 7. Change Impact Analysis | Covers all five requested dimensions; incremental estimate is internally consistent. | Eight person-hours are an estimate, not a timesheet; extra analytics is outside CR-01. |
| 8. Implemented New Feature | Includes four UI screenshots and a source-file map. | Deliver the actual matching source and new evidence; historical dataset counts need not match a fresh database. |
| 9. New Feature Testing Report | Fourteen function-level cases with expected/actual outcomes and explicit limitations. | Independently rerun the delivered tests; add browser checks for Clear, polling, localization and controls. |
| 10. Commercial Offer | Required sections present; hypothetical client and non-production limitations are explicit. | Keep assumptions separate from actual effort, real bank procurement and current sprint duration. |
| 11. Simplified Fixed-Price Contract | Required scope, price, schedule, CR process, duties and acceptance clauses present. | Remains an unexecuted academic template, not a signed agreement. |
| SIS10-11.pptx | Eleven slides cover all five assignment parts; five suggested speakers are present. | Rehearse and reserve time for the live demo; refresh evidence and board snapshot after implementation. |

## Commercial arithmetic

- CR-01: 8 estimated hours × 5,000 KZT = 40,000 KZT.
- Offer: 240 estimated hours × 5,000 KZT = 1,200,000 KZT.
- 15% contingency = 180,000 KZT; fixed total = 1,380,000 KZT.
- Payment milestones: 414,000 + 552,000 + 414,000 = 1,380,000 KZT.
- CR-01 is explicitly included, not invoiced twice. Six weeks and the 30-day
  defect-correction warranty agree between the offer, contract and presentation.
- These supplied assumptions should not be replaced by the assistant's earlier
  preliminary 10-day / 300,000-KZT example; they describe different scopes.

## Independent checks completed during review

1. Original backend image (source commit `2115a8c`): **10 passed, 1 warning**.
   A dedicated `safestep_baseline_test` database was used, not application data.
   See `evidence/baseline-backend-tests.txt`.
2. Original UI in Firefox: reloading a held payment loses the client's active
   screen. Injecting HTTP 503 for its warning GET leaves loading with no Retry.
   See `evidence/baseline-browser-results.json` and `before-*.png`.
3. All eleven Word files and all eleven slides were rendered through LibreOffice
   for visual review. The layout is generally readable. Deliverable 4 has a small
   final paragraph orphaned onto page 4; this is cosmetic, not missing content.
4. PowerPoint structural validation passed. Slide 4 contains a **linked embedded
   video**, `ppt/media/media1.mov`, not a missing external file. It is H.264,
   764×1368, approximately 3.13 seconds. A portable MP4 remux is supplied as
   `evidence/historical-warning-before.mp4`; frames were not changed.
5. Word strict schema validation reported the same formatting problems in all
   eleven source files: missing `w:zoom/@w:percent`, missing `w:shd/@w:val`, and
   invalid ordering/duplication of a shading element. The files do render; these
   findings are compatibility concerns, not proof that Microsoft Word cannot
   open them. See `evidence/document-validation.json`. Original files were not
   silently rewritten.
6. Suggested slide narration totals **9 minutes 15 seconds**, leaving only
   45 seconds in a ten-minute presentation. Shorten narration if a live demo
   must fit in the same slot. Actual presentation timing is not measured.

## Implementation alignment

The official new feature in this supplied pack is **CR-01 Payment Prefix Search
and Status Filtering**, not Fraud Operations Analytics. The implementation must
match the supplied acceptance criteria. Analytics and the visual redesign can
be delivered as additional improvements, but cannot substitute for that CR.

The earlier claims of 18 backend and 14 frontend passing tests belong to the
supplied report's prior context. Their existence is not independently established
by screenshots of the queue. Fresh logs must identify the delivered source and
must not be combined with isolated probes into an invented test-suite total.

Per the project owner's clarification, **Beknur performs the code changes**;
teammates prepared submission materials. Collective project language is not in
itself false authorship, but speaking assignments and ClickUp assignees should
not imply that another member implemented code they did not change. Individual
documentation contributions should be stated only after the team confirms them.

## Submission gate

- Run the final application and record fresh backend, frontend, lint and build results.
- Capture the warning failure/retry flow, operator reason validation and CR-01 in the current UI.
- Link the actual final source commit and attach evidence to the real ClickUp cards.
- Update the live board, then capture its final state. Local files do not update ClickUp.
- Review Word compatibility fixes on copies before replacing supplied originals.
- Avoid colon characters in final cross-platform filenames; correct `Contrac` to `Contract`.
- Rehearse all five members within ten minutes and identify their actual contributions.
- Keep authentication, cryptographic device proof, concurrency/state-guard issues,
  dependency triage and live NAFC integration disclosed as open where not fixed.

**Review outcome:** the document package covers the assignment; successful
submission still depends on matching working code, fresh evidence and the actual
project-management board. No grade or production-security certification is claimed.
