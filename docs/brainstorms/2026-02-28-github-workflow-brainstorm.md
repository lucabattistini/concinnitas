---
date: 2026-02-28
topic: github-workflow
---

# GitHub Actions CI/CD Workflow

## What We're Building

Two GitHub Actions workflows for the concinnitas CLI:

1. **CI workflow** (`ci.yml`) — runs on every push and PR. Builds TypeScript, runs Vitest tests.
2. **Release workflow** (`release.yml`) — triggered by git tags (`v*`). Builds and publishes to GitHub Packages. Version and CHANGELOG.md are already committed (via `changeset version` run locally before tagging).

Also: migrate from npm to pnpm as the package manager (both locally and in CI).

## Why This Approach

**Two workflows** were chosen over a single workflow because:

- **Clean separation** — CI logic (build, test) is independent from release logic (changelog, publish). Different triggers, different concerns.
- **CI runs on every PR** — fast feedback loop. Release only runs when you push a version tag.
- **Easier to debug** — when a release fails, you're looking at release code, not wading through test config.

**Changesets** was chosen over semantic-release because:

- **Deliberate versioning** — you create a changeset file per PR describing the change. At release time, changesets are consumed to determine the version bump and changelog entry. No magic from commit messages.
- **Solo maintainer friendly** — you control exactly what goes into each release, which matters for a CLI tool where breaking changes affect users.
- **Works well with tag-triggered releases** — changesets prepares the version bump, you tag and push, release workflow publishes.

**GitHub Packages** was chosen as the registry:

- Integrated with GitHub ecosystem (permissions, visibility, releases)
- Trade-off acknowledged: users need `.npmrc` configuration to use `npx @lucabattistini/concinnitas install`. The frictionless one-liner only works out of the box with npm public registry.

**pnpm** migration included because:

- Faster installs, stricter dependency resolution
- Consistent tooling between local dev and CI

## Key Decisions

- **Registry: GitHub Packages** (`npm.pkg.github.com`) — requires `publishConfig` in package.json and `.npmrc` for auth in CI
- **Changelog: Changesets** — `.changeset/` directory for pending changes, consumed at release time
- **CI trigger: push + PR** — build and test on every code change
- **Release trigger: git tag** (`v*`) — push a tag to trigger publish. Version comes from changesets (not the tag). The release flow is: run `changeset version` locally to bump package.json + generate CHANGELOG.md, commit, tag the commit, push. The tag is a publish signal, not the version source.
- **Package manager: pnpm** — migrate from npm, delete `package-lock.json`, add `pnpm-lock.yaml`
- **Two workflow files** — `ci.yml` for tests, `release.yml` for release

## Next Steps

→ `/workflows:plan` for implementation details (workflow YAML, package.json changes, pnpm migration steps)
