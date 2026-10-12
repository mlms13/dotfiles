import { homedir } from "node:os";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

export const node = (id: string, { pkg, command, bundle }: Toolkit): Bundle =>
  bundle(id, "Node.js (fnm)", [
    pkg("fnm"),
    command({
      id: "node:default",
      description: "A working fnm default (initially Node 24)",
      // Invoke fnm directly so an asdf pin cannot satisfy this check.
      check: async () =>
        (await Bun.$`fnm exec --using=default node --version`
          .cwd(homedir()).quiet().nothrow()).exitCode === 0,
      apply: async () => {
        await Bun.$`fnm install 24`;
        await Bun.$`fnm default 24`;
      },
    }),
  ]);
