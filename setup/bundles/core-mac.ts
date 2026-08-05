import type { Bundle, Step, Toolkit } from "mlms13-setup-runner";

// yabai and skhd both live here. `koekeishiya` renamed to `asmvik`, so the old
// tap name still redirects — this is upstream, not a fork.
const YABAI_TAP = "asmvik/formulae";

/** GUI baseline for any Mac of mine, work or not. Casks have no Linux analogue, hence the split. */
export const coreMac = (id: string, { brew, command, bundle }: Toolkit): Bundle => {
  // Homebrew refuses to load formulae from a non-official tap until it's
  // trusted, so without this the two installs below fail outright on a fresh
  // machine. Trust is per-user state in ~/.homebrew/trust.json — a tap can't
  // grant it to itself — which is exactly why it has to be an explicit step.
  const trustTap = (tap: string): Step =>
    command({
      id: `brew:trust:${tap}`,
      description: `trust ${tap}`,
      platforms: ["darwin"],
      check: async () => {
        const out = await Bun.$`brew trust --json v1`.quiet().nothrow().text();
        try {
          // Shape is { taps, formulae, casks, commands }, each a string array.
          const trusted = JSON.parse(out) as { taps?: string[] };
          return trusted.taps?.includes(tap) ?? false;
        } catch {
          // No trust.json yet on a fresh machine, so nothing is trusted.
          return false;
        }
      },
      apply: async () => {
        await Bun.$`brew trust --tap ${tap}`;
      },
    });

  // Substring match, not exact: the two register under different reverse-DNS
  // prefixes (com.asmvik.yabai, com.koekeishiya.skhd) depending on the tap.
  const service = (name: string): Step =>
    command({
      id: `service:${name}`,
      description: `${name} launchd service`,
      platforms: ["darwin"],
      check: async () => {
        const list = await Bun.$`launchctl list`.quiet().nothrow().text();
        return list.toLowerCase().includes(name);
      },
      apply: async () => {
        await Bun.$`${name} --start-service`;
      },
    });

  return bundle(
    id,
    "Core macOS apps",
    [
      // `present` on every app cask: brew can't see an app dragged in from a
      // .dmg, and installing a cask over one fails outright instead of adopting it.

      brew.cask("ghostty", { present: { path: "/Applications/Ghostty.app" } }),
      brew.cask("raycast", { present: { path: "/Applications/Raycast.app" } }),
      brew.cask("alt-tab", { present: { path: "/Applications/AltTab.app" } }),

      // Trust first, or both installs below fail on an untrusted tap.
      trustTap(YABAI_TAP),
      brew.formula("yabai", { tap: YABAI_TAP }),
      brew.formula("skhd", { tap: YABAI_TAP }),

      // After the installs above; `--start-service` needs the binary. Registers
      // the service only; yabai's Accessibility grant is still manual
      service("yabai"),
      service("skhd"),

      // ghostty + starship assume patched glyphs, so the Nerd Font is needed
      brew.cask("font-fira-code-nerd-font", { description: "Fira Code Nerd Font" }),
      brew.cask("font-fira-code", { description: "Fira Code" }),

      brew.cask("firefox", { present: { path: "/Applications/Firefox.app" } }),
      brew.cask("google-chrome", { present: { path: "/Applications/Google Chrome.app" } }),

      // GUI dev apps: no cask-free portable form, so they land here rather than `core`.
      brew.cask("cursor", { present: { path: "/Applications/Cursor.app" } }),
      brew.cask("claude", { present: { path: "/Applications/Claude.app" } }),

      brew.cask("obsidian", { present: { path: "/Applications/Obsidian.app" } }),
      brew.cask("spotify", { present: { path: "/Applications/Spotify.app" } }),
    ],
    { platforms: ["darwin"] },
  );
};
