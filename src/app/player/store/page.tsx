import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Store - KickHub",
  description: "Browse and purchase player items",
};

export default function StorePage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Player Store</h1>
      <p className="text-gray-700">Browse and purchase items with your earned currency.</p>
    </div>
  );
}