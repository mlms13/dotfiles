import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** Baseline CLI environment for any machine of mine, shell tooling and dev tooling
 *  alike. `pkg()` so a non-brew adapter needs no edit here. */

const TOOL_VERSIONS = join(homedir(), ".tool-versions");
const ASDF_DATA = process.env.ASDF_DATA_DIR || join(homedir(), ".asdf");

/**
 * The `<tool> <version>` pairs pinned in the tracked ~/.tool-versions. Comments
 * and blank lines dropped; a tool may legally list several fallback versions,
 * and asdf resolves the first, so that's the one we care about.
 */
const pinnedRuntimes = (): Array<{ tool: string; version: string }> => {
  if (!existsSync(TOOL_VERSIONS)) return [];
  return readFileSync(TOOL_VERSIONS, "utf8")
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [tool, version] = line.split(/\s+/);
      return tool && version ? [{ tool, version }] : [];
    });
};

export const core = (id: string, { pkg, command, bundle }: Toolkit): Bundle =>
  bundle(id, "Core CLI tools", [
    pkg("fzf"),
    pkg("tmux"),
    pkg("starship"),

    // Apple's /usr/bin/git is fine; `present` stops brew
    pkg("git", { present: { bin: "git" } }),
    pkg("git-delta", {}, "delta (git pager)"),
    pkg("gh", {}, "gh (GitHub CLI)"),

    // Stacked PRs (`gh stack init/add/submit/sync`). Not a formula — gh
    // extensions are their own thing, installed per-user under gh's data dir,
    // so there's no `pkg()` path to it.
    command({
      id: "gh:ext:stack",
      description: "gh stack (stacked PRs)",
      // `gh extension install` goes through the API, so this step fails until
      // `gh auth login` has been run — that stays manual, like yabai's
      // Accessibility grant in core-mac.
      check: async () => {
        const list = await Bun.$`gh extension list`.quiet().nothrow().text();
        return list.includes("gh-stack");
      },
      apply: async () => {
        await Bun.$`gh extension install github/gh-stack`;
      },
    }),

    pkg("neovim"),
    pkg("fd"),
    pkg("ripgrep", {}, "ripgrep (rg)"),
    pkg("asdf"),

    command({
      id: "asdf:runtimes",
      description: "asdf runtimes (from ~/.tool-versions)",
      // .zshrc puts the shims on PATH, so a fresh install needs to ensure the
      // tools are installed and present
      check: () =>
        pinnedRuntimes().every(({ tool, version }) =>
          existsSync(join(ASDF_DATA, "installs", tool, version)),
        ),
      apply: async () => {
        // `asdf install` reads .tool-versions but won't add plugins for itself,
        // and re-adding an existing one is an error — hence nothrow per tool.
        for (const { tool } of pinnedRuntimes()) {
          await Bun.$`asdf plugin add ${tool}`.nothrow().quiet();
        }
        // No args: installs every version pinned in ~/.tool-versions.
        await Bun.$`asdf install`.cwd(homedir());
      },
    }),
  ]);
