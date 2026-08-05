import { existsSync, mkdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** What the tracked .zshrc expects to already exist. Upstream install scripts, not packages. */

const OMZ_INSTALLER = "https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh";
const ANTIGEN_SRC = "https://raw.githubusercontent.com/zsh-users/antigen/master/bin/antigen.zsh";

const OMZ_DIR = join(homedir(), ".oh-my-zsh");
const ANTIGEN = join(homedir(), ".zsh", "antigen.zsh");

export const shell = (id: string, { command, bundle }: Toolkit): Bundle =>
  bundle(id, "Shell environment", [
    command({
      id: "shell:oh-my-zsh",
      description: "oh-my-zsh",
      check: () => existsSync(OMZ_DIR),
      apply: async () => {
        const installer = join(tmpdir(), "ohmyzsh-install.sh");
        await Bun.$`curl -fsSL ${OMZ_INSTALLER} -o ${installer}`;
        // KEEP_ZSHRC is load-bearing — the installer otherwise moves the
        // tracked .zshrc aside and drops in its own template.
        await Bun.$`sh ${installer} --unattended`.env({ ...process.env, KEEP_ZSHRC: "yes" });
        await Bun.$`rm -f ${installer}`.nothrow();
      },
    }),

    command({
      id: "shell:antigen",
      description: "antigen (~/.zsh/antigen.zsh)",
      check: () => existsSync(ANTIGEN),
      apply: async () => {
        mkdirSync(dirname(ANTIGEN), { recursive: true });
        // -f matters: without it curl writes the HTTP error page to the target,
        // which satisfies the check above forever after.
        await Bun.$`curl -fsSL ${ANTIGEN_SRC} -o ${ANTIGEN}`;
      },
    }),
  ]);
