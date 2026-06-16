import { SettingsClient } from "@/components/settings-client";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main className="shell py-10">
      <p className="eyebrow">Control center</p>
      <h1 className="mt-2 text-4xl font-black text-indigo-950">Settings</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Search settings, adjust the interface, relaunch onboarding, track learning progress, and use AI-assisted story creation.
      </p>
      <SettingsClient />
    </main>
  );
}
