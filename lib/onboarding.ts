export type OnboardingData = {
  profile: {
    name?: string;
    headline?: string;
    bio?: string;
    company?: string;
    role?: string;
    avatarDataUrl?: string;
  };
  socials: {
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    x?: string;
    website?: string;
  };
};

const KEY = "onboarding:data";
const FLAG = "onboarding:complete";

export function loadOnboarding(): OnboardingData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { profile: {}, socials: {} };
}

export function saveOnboarding(patch: Partial<OnboardingData>) {
  const current = loadOnboarding();
  const merged: OnboardingData = {
    profile: { ...current.profile, ...(patch.profile ?? {}) },
    socials: { ...current.socials, ...(patch.socials ?? {}) },
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}

export function clearOnboarding() {
  localStorage.removeItem(KEY);
}

export function setOnboardingComplete(done: boolean) {
  localStorage.setItem(FLAG, done ? "true" : "false");
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(FLAG) === "true";
}
