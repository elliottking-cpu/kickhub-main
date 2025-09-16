import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Setup - KickHub",
  description: "Configure your team settings",
};

export default function TeamSetupPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Team Setup</h1>
      <p className="text-gray-700">Configure your team settings and information.</p>
    </div>
  );
}