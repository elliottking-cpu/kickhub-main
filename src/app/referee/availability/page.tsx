import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Availability - KickHub",
  description: "Manage your referee availability",
};

export default function AvailabilityPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Availability</h1>
      <p className="text-gray-700">Manage your availability for referee assignments.</p>
    </div>
  );
}