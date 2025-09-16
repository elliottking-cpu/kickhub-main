import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kit Orders - KickHub",
  description: "Order team kit and equipment",
};

export default function KitPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Kit Orders</h1>
      <p className="text-gray-700">Order team kit and equipment for your child.</p>
    </div>
  );
}