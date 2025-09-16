import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Finances - KickHub",
  description: "Manage team finances and payments",
};

export default function FinancesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Team Finances</h1>
      <p className="text-gray-700">Manage your team's finances and payment tracking.</p>
    </div>
  );
}