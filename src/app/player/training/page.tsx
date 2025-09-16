import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training - KickHub",
  description: "View training sessions and progress",
};

export default function TrainingPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Training</h1>
      <p className="text-gray-700">View your training sessions and track your progress.</p>
    </div>
  );
}