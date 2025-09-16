import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coach Dashboard - KickHub",
  description: "Main coach dashboard for team management",
};

export default function CoachDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Coach Dashboard</h1>
      <p className="text-gray-700">Welcome to your team management dashboard.</p>
    </div>
  );
}