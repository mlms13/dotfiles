# setup — machine catalog

Your personal machine setup, as data. This is the **catalog** (bundles +
profiles). The **runner** that executes it is a separate project, (packaged as
`mlms13/setup-runner`), invoked via `bunx`.

## Files

- `config.ts`: entry loaded by the runner
- `bundles/*.ts`: bundles of apps to install, symlinks to make, commands to run 
- `bootstrap.sh`: installs CLT / Homebrew / Bun, needed before the runner
- `package.json` / `tsconfig.json`: types only, so `bun run check` can
  typecheck the catalog — the runner is not a runtime dependency

## Run

Bootstrap and the runner are **two separate commands**. The bootstrap script
installs what is needed for the runner; the runner installs everything else.

### Fresh machine

1. **Establish the home-as-repo checkout.** Everything below assumes `~/setup`
   and `~/.zshrc` are already on disk.
2. **`~/setup/bootstrap.sh`** — Xcode Command Line Tools → Homebrew → Bun, in
   that order, each skipped if already present. Safe to re-run.
3. **Open a new shell.** The tracked `.zshrc` is what puts `/opt/homebrew/bin`
   and `~/.bun/bin` on `PATH`; bootstrap only fixed up its own environment, so
   `brew` and `bun` won't be on `PATH` in the shell that ran it.
4. **Preview, then apply:**

   ```sh
   bunx github:mlms13/setup-runner --config ~/setup --dry-run
   bunx github:mlms13/setup-runner --config ~/setup
   ```

### Day to day

```sh
# default profile (mac-personal); profiles are mac-personal, mac-work, base
bunx github:mlms13/setup-runner --config ~/setup

# a named profile, or specific bundles
bunx github:mlms13/setup-runner --config ~/setup base
bunx github:mlms13/setup-runner --config ~/setup core skills --dry-run

# non-interactive (takes every pending step; pairs well with --dry-run)
bunx github:mlms13/setup-runner --config ~/setup --yes
```

### Runtimes

All profiles install **fnm** for Node and **standalone pnpm**. Setup supplies
initial defaults and preserves subsequent version choices and pnpm self-updates.
In interactive zsh, fnm follows `.node-version` or `.nvmrc` files through
subdirectories and restores its default outside projects. pnpm honors project
`packageManager` pins. Mac profiles also install **Homebrew Python**, with no
minor version hardcoded in the catalog or shell paths.

Only `mac-work` includes **asdf**. Project pins take precedence; the bundle sets
Node and pnpm to `system` in the ignored `~/.tool-versions` so unpinned commands
fall through to fnm and standalone pnpm. It also fills missing home defaults for
installed plugins. Rerun the `asdf` bundle after adding plugins; work setup owns
project runtime installation. A `system` fallback requires an installed tool.

```sh
fnm install 22             # install another Node version
fnm use 22                 # select it in this shell
fnm default 24             # set the default outside projects
pnpm self-update           # run outside a pinned project to update the default
```

Open a new shell after setup to load the PATH configuration in `.zshrc`.

### Editing the catalog

`bun run check` needs the dev deps installed first — `bun run` does not
auto-install, so without this step `tsc` is simply not found:

```sh
cd ~/setup && bun install   # once per machine
bun run check
```

This is a dev-loop convenience only. `bun.lock` is gitignored and
`package.json` pins carets, so each machine resolves its own patch versions
within the same majors.

## Skills

Skills are **vendored** into the repo at `~/.agents/skills` (un-ignored in
`.gitignore`). `bundles/skills.ts` only ensures the `~/.claude/skills` symlink
that Claude Code reads.

`~/.agents/.skill-lock.json` is **provenance, not a restore manifest**. It
records which skills came from upstream repos and at what `skillFolderHash`.

### Workflows

- **New skill (yours):** write it under `~/.agents/skills/<name>/SKILL.md`, commit.
- **Install upstream:** `npx skills` on any machine, then commit — the diff
  carries both the skill's files and its `.skill-lock.json` entry.
- **Update upstream:** re-run `npx skills` and commit. Because it's vendored,
  an upstream change arrives as a **reviewable diff** instead of silent drift.
