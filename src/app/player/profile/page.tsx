import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile - KickHub",
  description: "Manage your player profile",
};

export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <p className="text-gray-700">Manage your player profile and personal information.</p>
    </div>
  );
}