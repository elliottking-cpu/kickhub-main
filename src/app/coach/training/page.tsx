import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training Sessions - KickHub",
  description: "Plan and manage training sessions",
};

export default function TrainingPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Training Sessions</h1>
      <p className="text-gray-700">Plan and manage your team's training sessions.</p>
    </div>
  );
}