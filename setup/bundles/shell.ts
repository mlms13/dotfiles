import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** What the tracked .zshrc and .tmux.conf expect to already exist. Upstream
 *  install scripts, not packages. */

const OMZ_INSTALLER = "https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh";
const ANTIGEN_SRC = "https://raw.githubusercontent.com/zsh-users/antigen/master/bin/antigen.zsh";
const TPM_REPO = "https://github.com/tmux-plugins/tpm.git";

const OMZ_DIR = join(homedir(), ".oh-my-zsh");
const ANTIGEN = join(homedir(), ".zsh", "antigen.zsh");
const TMUX_CONF = join(homedir(), ".tmux.conf");
const TMUX_PLUGINS = join(homedir(), ".tmux", "plugins");
const TPM_DIR = join(TMUX_PLUGINS, "tpm");

/**
 * Directories TPM will clone into ~/.tmux/plugins, read back off the `@plugin`
 * lines in .tmux.conf so adding a plugin there re-arms the check on its own.
 * The dir is the repo name with any branch pin dropped: `catppuccin/tmux#v2.3.0`
 * clones to `~/.tmux/plugins/tmux`.
 */
const declaredTmuxPlugins = (): string[] => {
  if (!existsSync(TMUX_CONF)) return [];
  const conf = readFileSync(TMUX_CONF, "utf8");
  const dirs: string[] = [];
  for (const match of conf.matchAll(/^\s*set\s+-g\s+@plugin\s+['"]([^'"]+)['"]/gm)) {
    const name = match[1]?.split("#")[0]?.split("/").pop();
    if (name) dirs.push(name);
  }
  return dirs;
};

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

    command({
      id: "tmux:tpm",
      description: "tpm (~/.tmux/plugins/tpm)",
      // TPM is listed as a plugin in .tmux.conf, but it can't clone itself —
      // it's the thing that does the cloning. So it has to land out-of-band.
      check: () => existsSync(TPM_DIR),
      apply: async () => {
        mkdirSync(TMUX_PLUGINS, { recursive: true });
        await Bun.$`git clone --depth 1 ${TPM_REPO} ${TPM_DIR}`;
      },
    }),

    command({
      id: "tmux:plugins",
      description: "tmux plugins (via tpm)",
      // The `run '.../tpm'` line in .tmux.conf does install missing plugins, but
      // the two catppuccin `source-file` lines execute earlier in the file — so a
      // first launch still errors on dirs that don't exist yet. Installing here,
      // before tmux ever starts, is what actually fixes that ordering.
      check: () => {
        const plugins = declaredTmuxPlugins();
        return plugins.length > 0 && plugins.every((p) => existsSync(join(TMUX_PLUGINS, p)));
      },
      apply: async () => {
        // Documented as not needing a running server, so it's safe headless.
        // Needs the `tmux` binary, which `core` installs before this bundle runs.
        await Bun.$`${join(TPM_DIR, "bin", "install_plugins")}`;
      },
    }),
  ]);
