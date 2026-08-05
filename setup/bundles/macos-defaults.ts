import type { Bundle, Step, Toolkit } from "mlms13-setup-runner";

/**
 * Only settings `defaults` can read *back* belong here — one that can't check
 * itself would re-apply every run and lie about what it changed.
 */
export const macosDefaults = (id: string, { command, bundle }: Toolkit): Bundle => {
  const globalBool = (key: string, value: boolean, description: string): Step =>
    command({
      id: `defaults:${key}`,
      description,
      platforms: ["darwin"],
      check: async () => {
        const out = await Bun.$`defaults read -g ${key}`.quiet().nothrow().text();
        return out.trim() === (value ? "1" : "0");
      },
      apply: async () => {
        await Bun.$`defaults write -g ${key} -bool ${value ? "true" : "false"}`;
      },
    });

  return bundle(
    id,
    "macOS system defaults",
    [
      globalBool(
        "ApplePressAndHoldEnabled",
        false,
        "hold-a-key repeats instead of opening the accent picker",
      ),
      globalBool(
        "NSAutomaticPeriodSubstitutionEnabled",
        false,
        "no period inserted on double-space",
      ),
    ],
    { platforms: ["darwin"] },
  );
};
