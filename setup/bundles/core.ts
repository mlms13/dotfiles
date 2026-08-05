import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** Baseline CLI environment for any machine of mine, shell tooling and dev tooling
 *  alike. `pkg()` so a non-brew adapter needs no edit here. */
export const core = (id: string, { pkg, bundle }: Toolkit): Bundle =>
  bundle(id, "Core CLI tools", [
    pkg("fzf"),
    pkg("tmux"),
    pkg("starship"),

    // Apple's /usr/bin/git is fine; `present` stops brew
    pkg("git", { present: { bin: "git" } }),
    pkg("git-delta", {}, "delta (git pager)"),
    pkg("gh", {}, "gh (GitHub CLI)"),
    pkg("neovim"),
    pkg("fd"),
    pkg("ripgrep", {}, "ripgrep (rg)"),
    pkg("asdf"),
  ]);
