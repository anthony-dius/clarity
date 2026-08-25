# Release Process

This project uses Release Please for automated releases.

> [!WARNING]
> Before doing anything, ensure you've set up [Trusted Publishing](#npm-trusted-publishing).

## Release Workflow

### Conventional Commits

PR titles (squash-merged onto `main`, and linted by `pr-title.yml`) follow
the [Conventional Commits](https://www.conventionalcommits.org/) spec:

- `fix:` patches
- `feat:` minor features
- `feat!:` or `fix!:` breaking changes

### Pre-1.0 Versioning

While the version is `0.x.x`, breaking changes bump the **minor** version
(`bump-minor-pre-major` in `release-please-config.json`).

### Release Process

1. Push (squash-merged) commits to `main`.
2. Release Please analyzes them, determines the version bump, updates
   `package.json` and `CHANGELOG.md`, and opens/updates a release PR.
3. Review and merge the release PR. This triggers, in the same `release.yml`
   run:
   - A GitHub Release + `vX.Y.Z` tag (release-please).
   - Cross-compiled binaries (macOS arm64/x64, Linux x64/arm64, Windows
     x64) built, checksummed (`SHA256SUMS`), attested
     (`actions/attest-build-provenance`), and uploaded onto that same
     release — Clarity-specific, since spec 001 (FR-004) commits to a
     standalone binary as well as the npm package.
   - A dispatch to `publish.yml`, which publishes `@anthony-dius/clarity`
     to npm under the `latest` tag.

### Commit Message Examples

- `fix: resolve verbatim marker line-number off-by-one`
- `feat: add --json output mode`
- `feat!: rename verbatim marker syntax`
- `docs: improve README`
- `chore: update dependencies`

## Advanced Release Features

### Force a Specific Version

```bash
git commit --allow-empty -m "chore: release 2.0.0" -m "Release-As: 2.0.0"
```

Release Please opens a PR for version `2.0.0` regardless of commit types.

## Do Not

- Manually edit Release Please PRs.
- Manually create GitHub releases.
- Modify version numbers directly (`package.json`, `.release-please-manifest.json`).

## Publishing

Releases are published to npm automatically when the Release Please PR is
merged (via the `dispatch-publish` job → `publish.yml`).

### npm Trusted Publishing

This project uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
with GitHub Actions. No npm tokens are needed at steady state — authentication
happens via OIDC.

**Setup required** (one-time, on npmjs.com):

1. `npmjs.com/package/@anthony-dius/clarity` → **Settings → Trusted Publisher → GitHub Actions**.
2. Fill in:
   - **Organization or user**: `anthony-dius`
   - **Repository**: `clarity`
   - **Workflow filename**: `publish.yml` — **not** `release.yml`; `publish.yml` is the workflow that actually runs `npm publish`.
   - **Allowed actions**: `npm publish`
3. Because npm requires the package to already exist before a trusted
   publisher can be attached to it, the very first publish must happen
   manually:
   ```bash
   bun run build:npm
   npm login
   npm publish --access public
   ```
   Do this once, configure the trusted publisher against the now-existing
   package, then every subsequent publish goes through `publish.yml`.
4. Once the first OIDC publish from CI succeeds, harden it: **Settings →
   Publishing access → "Require two-factor authentication and disallow
   tokens."**

### Manual / prerelease publishing

`publish.yml` also accepts a manual trigger (Actions tab → **Publish
Package** → **Run workflow**, choose `latest` or `next`). Every push to
`main` with unreleased commits gets an automatic `next`-tagged prerelease
this way too (via `dispatch-publish`'s `prs_created` branch), published as
`<version>-next.<commits-since-last-tag>` — install it with
`npm install @anthony-dius/clarity@next`.
