import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

const PNPM_VERSION = "12.4.2";
const PNPM_HOME = process.env.PNPM_HOME || join(
  process.platform === "darwin"
    ? join(homedir(), "Library")
    : process.env.XDG_DATA_HOME || join(homedir(), ".local/share"),
  "pnpm",
);

export const pnpm = (id: string, { command, bundle }: Toolkit): Bundle =>
  bundle(id, "Standalone pnpm", [
    command({
      id: "pnpm:install",
      description: `Standalone pnpm (initially ${PNPM_VERSION})`,
      check: async () => {
        const executable = [join(PNPM_HOME, "bin", "pnpm"), join(PNPM_HOME, "pnpm")]
          .find((path) => existsSync(path));
        if (!executable) return false;
        const result = await Bun.$`${executable} --version`
          .cwd(homedir()).quiet().nothrow();
        return result.exitCode === 0;
      },
      apply: async () => {
        const temporary = mkdtempSync(join(tmpdir(), "pnpm-install-"));
        try {
          const installer = join(temporary, "install.sh");
          const shellConfig = join(temporary, ".shrc");
          // The tracked .zshrc owns PATH ordering; let setup edit a disposable rc.
          writeFileSync(shellConfig, "");
          await Bun.$`curl -fsSL https://get.pnpm.io/install.sh -o ${installer}`;
          await Bun.$`sh ${installer}`.cwd(temporary).env({
            ...process.env,
            PNPM_VERSION,
            PNPM_HOME,
            SHELL: "/bin/sh",
            ENV: shellConfig,
          });
        } finally {
          rmSync(temporary, { recursive: true, force: true });
        }
      },
    }),
  ]);
