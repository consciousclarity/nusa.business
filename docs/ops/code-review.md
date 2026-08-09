# Code review & approval policy

Tracks [issue #4](https://github.com/consciousclarity/nusa.business/issues/4):
close the gap where a PR could be auto-approved even though **no code review
actually ran** (as happened on #3, a security-relevant change).

## Policy

Every PR into `main` must have a **completed review before it can be approved or
merged**:

1. **Greptile** posts an automated, architecture-aware review. It indexes
   `AGENTS.md` and the repo rules, so the project non-negotiables are review
   criteria — see [`.greptile/rules.md`](../../.greptile/rules.md).
2. A **human code owner** ([`.github/CODEOWNERS`](../../.github/CODEOWNERS) →
   `@consciousclarity`) approves.
3. An auto-approver must **not** approve when its review signal is absent. If the
   review check has not completed, approval is withheld — a missing signal is
   treated as "not reviewed", never as "pass".

## What lives in the repo (version-controlled)

- **`.greptile/config.json`** — enables `statusCheck` (each review becomes a
  GitHub status check that branch protection can require) and `triggerOnUpdates`
  (later commits are re-reviewed, so nothing merges past the review that ran on
  an earlier commit). `strictness: 2`.
- **`.greptile/rules.md`** — the `AGENTS.md` non-negotiables restated as blocking
  review rules.
- **`.github/CODEOWNERS`** — routes review to the maintainer.

## What must be configured outside the repo (one-time, needs admin)

These cannot be set from a committed file and require repo-admin / org access:

1. **Greptile GitHub App** — installed and scoped to *selected repositories*
   (`nusa.business`) via greptile.com → Code Providers. (Greptile reviews are
   already posting on PRs, so this appears active; confirm the scope.)
2. **Auto-approval policy** — whatever policy produced the auto-approval on #3
   must require the review check to have **completed** before it approves, or be
   removed so Greptile + code-owner review is the signal.
3. **Branch protection on `main`** (Settings → Branches → Add rule):
   - Require a pull request before merging, with **at least 1 approving review**.
   - **Require review from Code Owners**.
   - **Require status checks to pass** and select the **Greptile** review check
     (and `build`) as required — this is what makes “no completed review ⇒ no
     merge” enforceable.
   - Require branches to be up to date before merging.

## Acceptance (issue #4)

- [x] Greptile installed and scoped to this repo (reviews posting on PRs)
- [x] Greptile posts a review on the next PR
- [ ] An approval can no longer be granted when no review has run *(auto-approval
  policy change — outside repo)*
- [ ] `main` requires a completed review before merge *(branch protection —
  outside repo)*
