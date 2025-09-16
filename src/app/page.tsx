import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚽</span>
              </div>
              <span className="text-xl font-bold text-gray-900">KickHub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/register/coach">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your
              <span className="text-green-600 block">Grassroots Football Team</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The complete team management platform built for UK coaches, parents, and players. 
              From muddy pitches to match day magic - we've got you covered.
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Match Day Stats</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Parent Communication</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Player Development</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Kit Ordering</span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              >
                <Link href="/register/coach">Start Your Team Free</Link>
              </Button>
              <p className="text-sm text-gray-500">
                No credit card required • Set up in 5 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Hero Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-green-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Real Grassroots Football
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand Sunday morning football. From village pitches to academy grounds, 
              KickHub works where you need it most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Match Day Stats */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Never Miss a Goal Again</h3>
              <p className="text-gray-600 text-sm">
                Record match stats offline on any device. Works on muddy pitches with no signal. 
                Sync automatically when you're back online.
              </p>
            </div>

            {/* Feature 2: Parent Communication */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Keep Parents in the Loop</h3>
              <p className="text-gray-600 text-sm">
                Real-time match updates, training schedules, and team news. 
                No more WhatsApp chaos or missed messages.
              </p>
            </div>

            {/* Feature 3: Player Development */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Develop Future Stars</h3>
              <p className="text-gray-600 text-sm">
                Track player progress with character development. 
                Motivate young players with achievements and skill progression.
              </p>
            </div>

            {/* Feature 4: Team Admin */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Simplify Team Admin</h3>
              <p className="text-gray-600 text-sm">
                Collect subs, order kit, schedule matches, and manage volunteers. 
                Everything in one place, nothing forgotten.
              </p>
            </div>
          </div>

          {/* Detailed Features Grid */}
          <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Match Day Management */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                Match Day Magic
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Works on Every Pitch in Britain
              </h3>
              <p className="text-gray-600 mb-6">
                From Hackney Marshes to your local recreation ground, KickHub works offline. 
                Record goals, assists, tackles, and saves without worrying about signal or weather.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Unlimited offline time - never lose data</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Live commentary for parents watching from the sideline</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Works on tablets, phones, and laptops</span>
                </li>
              </ul>
            </div>

            {/* Right: Visual Placeholder */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 text-center">
              <div className="w-full h-64 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <div className="text-gray-400">
                  <span className="text-4xl block mb-2">⚽</span>
                  <span className="text-sm">Match Day Interface Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Features Grid */}
          <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual Placeholder */}
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl p-8 text-center lg:order-2">
              <div className="w-full h-64 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <div className="text-gray-400">
                  <span className="text-4xl block mb-2">👨‍👩‍👧‍👦</span>
                  <span className="text-sm">Parent Dashboard Preview</span>
                </div>
              </div>
            </div>

            {/* Right: Parent Engagement */}
            <div className="lg:order-1">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                Parent Engagement
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Turn Parents into Your Biggest Supporters
              </h3>
              <p className="text-gray-600 mb-6">
                Keep parents engaged with real-time updates, player progress, and easy communication. 
                No more chasing payments or wondering who's bringing the oranges.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Automatic subs collection and payment tracking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Match notifications and live score updates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </span>
                  <span className="text-gray-700">Player development reports they'll actually read</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based CTAs Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join the KickHub Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're coaching your first team or managing a Sunday league veteran squad, 
              KickHub has something for everyone in grassroots football.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Coach CTA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">I'm a Coach</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Manage your team, track player development, and keep parents engaged. 
                  Perfect for grassroots coaches at any level.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/register/coach">Start Your Team</Link>
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Free setup • No credit card required
                </p>
              </div>
            </div>

            {/* Parent CTA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">I'm a Parent</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Stay connected with your child's football journey. Get live updates, 
                  track progress, and never miss a match moment.
                </p>
                <Button asChild variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Link href="/login">Sign In</Link>
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Invitation required from your child's coach
                </p>
              </div>
            </div>

            {/* Referee CTA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🟨</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">I'm a Referee</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Manage your availability, set your fees, and get booked by local teams. 
                  Professional referee management made simple.
                </p>
                <Button asChild variant="outline" className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-50">
                  <Link href="/register/referee">Join as Referee</Link>
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  Set your own rates and availability
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Trusted by Grassroots Football Across the UK
            </h2>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Teams Using KickHub</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Players Developed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">25K+</div>
                <div className="text-sm text-gray-600">Matches Recorded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">99%</div>
                <div className="text-sm text-gray-600">Uptime Guarantee</div>
              </div>
            </div>

            {/* Testimonial Placeholder */}
            <div className="bg-gray-50 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="text-gray-600 italic mb-4">
                "KickHub has transformed how we manage our U12s team. The parents love the live updates, 
                and I can finally focus on coaching instead of chasing subs payments. It just works, 
                even on the muddiest pitches in Manchester."
              </div>
              <div className="font-semibold text-gray-900">
                Sarah Thompson
              </div>
              <div className="text-sm text-gray-500">
                Coach, Didsbury FC Under 12s
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of UK coaches who've already made the switch to smarter team management. 
            Set up your team in less than 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Link href="/register/coach">Start Your Team Free</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-6"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <p className="text-sm text-green-100 mt-6">
            No credit card required • Free forever for basic features • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚽</span>
                </div>
                <span className="text-xl font-bold">KickHub</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The complete team management platform for UK grassroots football. 
                Built by coaches, for coaches.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 KickHub. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register/coach" className="hover:text-white transition-colors">Start Your Team</Link></li>
                <li><Link href="/register/referee" className="hover:text-white transition-colors">Join as Referee</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Centre</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}