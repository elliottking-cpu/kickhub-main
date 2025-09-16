import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kit Management - KickHub",
  description: "Design and order team kits",
};

export default function KitManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Kit Management</h1>
      <p className="text-gray-700">Design and order team kits and equipment.</p>
    </div>
  );
}