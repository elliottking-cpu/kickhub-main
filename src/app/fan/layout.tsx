// Simplified fan layout for staging
export default function FanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}