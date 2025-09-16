import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Management - KickHub",
  description: "Match list and scheduling for your team",
};

export default function MatchManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Match Management</h1>
      <p className="text-gray-700">View and schedule matches for your team.</p>
    </div>
  );
}