import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - KickHub",
  description: "Team communications and updates",
};

export default function MessagesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <p className="text-gray-700">View team communications and important updates.</p>
    </div>
  );
}