import type { Bundle, Toolkit } from "mlms13-setup-runner";

/** Apps for a work machine. Anything employer-neutral belongs in `core-mac` instead. */
export const workMac = (id: string, { brew, bundle }: Toolkit): Bundle =>
  bundle(
    id,
    "Work macOS apps",
    [
      brew.cask("bitwarden", { present: { path: "/Applications/Bitwarden.app" } }),
      brew.cask("gifox", { present: { path: "/Applications/Gifox.app" } }),
      brew.cask("slack", { present: { path: "/Applications/Slack.app" } }),
      brew.cask("rancher", {
        description: "Rancher Desktop",
        present: { path: "/Applications/Rancher Desktop.app" },
      }),
      brew.cask("dbeaver-community", {
        description: "DBeaver",
        present: { path: "/Applications/DBeaver.app" },
      }),
    ],
    { platforms: ["darwin"] },
  );
