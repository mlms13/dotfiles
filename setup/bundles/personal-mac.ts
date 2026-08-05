import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** Apps I don't want on a work machine — mine-but-fine-at-work goes in `core-mac`. */
export const personalMac = (id: string, { brew, bundle }: Toolkit): Bundle =>
  bundle(
    id,
    "Personal-only macOS apps",
    [
      brew.cask("discord", { present: { path: "/Applications/Discord.app" } }),
      brew.cask("dropbox", { present: { path: "/Applications/Dropbox.app" } }),
      brew.cask("macpass", { present: { path: "/Applications/MacPass.app" } }),
    ],
    { platforms: ["darwin"] },
  );
