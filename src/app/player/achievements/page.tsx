import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements - KickHub",
  description: "View your football achievements and progress",
};

export default function AchievementsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Achievements</h1>
      <p className="text-gray-700">View your football achievements and progress milestones.</p>
    </div>
  );
}