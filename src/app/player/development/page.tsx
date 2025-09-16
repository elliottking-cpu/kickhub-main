import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Development - KickHub",
  description: "Track your football development and skills",
};

export default function DevelopmentPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Development</h1>
      <p className="text-gray-700">Track your football development and skill progression.</p>
    </div>
  );
}