import type { Bundle, Toolkit } from "mlms13-setup-runner";

/**
 * Skills are vendored in this repo at ~/.agents/skills, so a fresh checkout
 * already has them — this only makes the symlink Claude Code reads.
 */
export const skills = (id: string, { symlink, bundle }: Toolkit): Bundle =>
  bundle(id, "Agent skills", [
    symlink("~/.agents/skills", "~/.claude/skills", "~/.claude/skills → ~/.agents/skills"),
  ]);
