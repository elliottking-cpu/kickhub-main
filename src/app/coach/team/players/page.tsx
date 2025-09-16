import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Management - KickHub",
  description: "Manage your team players",
};

export default function PlayerManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Player Management</h1>
      <p className="text-gray-700">Manage your team's players and their information.</p>
    </div>
  );
}