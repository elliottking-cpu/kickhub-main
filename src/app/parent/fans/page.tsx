import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fan Access - KickHub",
  description: "Manage fan access and subscriptions",
};

export default function FansPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Fan Access</h1>
      <p className="text-gray-700">Manage fan access and subscriptions for family members.</p>
    </div>
  );
}