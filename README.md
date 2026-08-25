# Clarity

A standalone CLI that checks documentation, specs, and agent-instruction
files against ten writing rules derived from ASD-STE100 (the aerospace
"Simplified Technical English" standard), targeting the verbose/hedging/vague
prose patterns common in AI-generated text.

## Install

Pick whichever path fits:

```bash
# No install — run once via npx
npx @anthony-dius/clarity path/to/doc.md

# Install globally via npm
npm install -g @anthony-dius/clarity
clarity path/to/doc.md

# Download a prebuilt binary (no Node/npm required at all)
# — pick the asset matching your platform from the release page:
# https://github.com/anthony-dius/clarity/releases/latest
curl -LO https://github.com/anthony-dius/clarity/releases/latest/download/clarity-linux-x64
chmod +x clarity-linux-x64
./clarity-linux-x64 path/to/doc.md
```

**Verifying a release**: every binary and the npm package are built by CI
from a tagged commit, never uploaded by hand. Check a binary against the
release's `SHA256SUMS`, or verify cryptographic build provenance directly:

```bash
gh attestation verify clarity-linux-x64 --repo anthony-dius/clarity
```

The npm package carries the equivalent provenance, shown as a "Provenance"
badge on its [npmjs.com](https://www.npmjs.com/package/@anthony-dius/clarity)
page, linking back to the exact GitHub Actions run that published it.

## Usage

```bash
clarity path/to/doc.md              # check one file
clarity a.md b.md c.md              # check multiple files
clarity --json path/to/doc.md       # machine-readable output
clarity --version                   # tool + rule-set version
clarity --help                      # usage + the 10 built-in rules
```

No config file, no flags required for the common case — `clarity <file>` is
the whole interface. Exit code is `0` when every checked file passes with no
findings, `1` when any finding is reported. Every finding names the file and
location, the rule and ASD-STE100 principle it maps to, and a concrete
remediation instruction.

Full CLI contract: `specs/001-ste100-cli-checker/contracts/cli.md`.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). For dev environment setup
(prerequisites, building from source, this repo's non-standard tooling),
see [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).
