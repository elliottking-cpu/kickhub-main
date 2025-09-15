// app/(coach)/layout.tsx - Coach-specific layout
export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <CoachSidebar />
      <main className="flex-1 overflow-y-auto">
        <CoachHeader />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}