export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">KickHub</h1>
          <p className="text-lg text-gray-600 mb-8">Comprehensive grassroots football management platform</p>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🚀 Ready for Development</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Next.js 15.5.3 with App Router</li>
            <li>✅ React 19 + TypeScript</li>
            <li>✅ Tailwind CSS v4</li>
            <li>✅ Shadcn/ui Components</li>
            <li>✅ Supabase Integration</li>
            <li>✅ PWA Support</li>
            <li>✅ Lucide Icons</li>
          </ul>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 1.2: Next.js Application Setup - Complete ✅</p>
          <p className="text-sm text-gray-500">Step 1.3: Git Repository Setup - In Progress 🚀</p>
        </div>
      </main>
    </div>
  );
}