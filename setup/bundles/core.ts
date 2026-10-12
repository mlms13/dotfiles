import { homedir } from "node:os";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** Baseline CLI environment for any machine of mine, shell tooling and dev tooling
 *  alike. `pkg()` so a non-brew adapter needs no edit here. */

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
    pkg("uv"),

    command({
      id: "claude-code",
      description: "Claude Code (native installer)",
      // Keep existing Homebrew install; migration is a one-time manual choice
      check: async () => {
        if (await Bun.file(`${homedir()}/.local/bin/claude`).exists()) return true;
        if (!Bun.which("brew")) return false;
        return (await Bun.$`brew list --cask claude-code`.quiet().nothrow()).exitCode === 0;
      },
      apply: async () => {
        await Bun.$`bash -o pipefail -c ${"curl -fsSL https://claude.ai/install.sh | bash"}`;
      },
    }),
  ]);
