import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Children - KickHub",
  description: "Manage your children's football activities",
};

export default function ChildrenPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Children</h1>
      <p className="text-gray-700">Manage your children's football activities and progress.</p>
    </div>
  );
}