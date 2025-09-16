import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Stats - KickHub",
  description: "View your match and training statistics",
};

export default function StatsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Stats</h1>
      <p className="text-gray-700">View your match and training statistics and performance data.</p>
    </div>
  );
}