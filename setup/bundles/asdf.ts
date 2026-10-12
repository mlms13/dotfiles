import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Bundle, Toolkit } from "mlms13-setup-runner";

const TOOL_VERSIONS = join(homedir(), process.env.ASDF_TOOL_VERSIONS_FILENAME || ".tool-versions");
const PLUGINS = join(process.env.ASDF_DATA_DIR || join(homedir(), ".asdf"), "plugins");

const missingFallbacks = (): string[] => {
  const versions = new Map<string, string>();
  const contents = existsSync(TOOL_VERSIONS) ? readFileSync(TOOL_VERSIONS, "utf8") : "";
  for (const line of contents.split("\n")) {
    const [tool, ...values] = line.replace(/#.*$/, "").trim().split(/\s+/);
    if (tool) versions.set(tool, values.join(" "));
  }
  const plugins = existsSync(PLUGINS) ? readdirSync(PLUGINS) : [];
  // Node and pnpm always belong to their own managers outside projects.
  // Preserve explicit home defaults for other tools; only fill missing ones.
  return [...new Set(["nodejs", "pnpm", ...plugins])].filter((tool) =>
    tool === "nodejs" || tool === "pnpm"
      ? versions.get(tool) !== "system"
      : !versions.has(tool),
  );
};

export const asdf = (id: string, { pkg, command, bundle }: Toolkit): Bundle =>
  bundle(id, "asdf (work projects)", [
    pkg("asdf"),
    command({
      id: "asdf:fallbacks",
      description: "Machine-local asdf system fallbacks",
      check: () => missingFallbacks().length === 0,
      apply: async () => {
        for (const tool of missingFallbacks()) {
          await Bun.$`asdf set -u ${tool} system`;
        }
      },
    }),
  ]);
