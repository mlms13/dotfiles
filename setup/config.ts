import { core } from "./bundles/core";
import { coreMac } from "./bundles/core-mac";
import { macosDefaults } from "./bundles/macos-defaults";
import { personalMac } from "./bundles/personal-mac";
import { shell } from "./bundles/shell";
import { skills } from "./bundles/skills";
import { workMac } from "./bundles/work-mac";
import type { ConfigFn } from "mlms13-setup-runner";

/** The catalog the runner loads. See setup/README.md for how the bundles split. */
const config: ConfigFn = (tk) => ({
  bundles: [
    core("core", tk),
    shell("shell", tk),
    skills("skills", tk),
    coreMac("core-mac", tk),
    macosDefaults("macos-defaults", tk),
    personalMac("personal-mac", tk),
    workMac("work-mac", tk),
  ],
  profiles: {
    "mac-personal": [
      "core", "shell", "skills",
      "core-mac", "macos-defaults", "personal-mac",
    ],
    "mac-work": [
      "core", "shell", "skills",
      "core-mac", "macos-defaults", "work-mac",
    ],
    base: ["core", "shell", "skills"],
  },
  defaultProfile: "mac-personal",
});

export default config;
