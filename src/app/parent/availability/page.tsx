import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Availability - KickHub",
  description: "Manage child availability for matches and training",
};

export default function AvailabilityPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Availability</h1>
      <p className="text-gray-700">Manage your child's availability for matches and training.</p>
    </div>
  );
}