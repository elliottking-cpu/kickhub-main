import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookings - KickHub",
  description: "View and manage your referee bookings",
};

export default function BookingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <p className="text-gray-700">View and manage your upcoming referee assignments.</p>
    </div>
  );
}