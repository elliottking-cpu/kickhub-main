import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer Opportunities - KickHub",
  description: "Sign up for volunteer roles",
};

export default function VolunteersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Volunteer Opportunities</h1>
      <p className="text-gray-700">Sign up for volunteer roles and help support the team.</p>
    </div>
  );
}