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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop juggling WhatsApp groups, spreadsheets, and paper forms. 
              KickHub brings everything together in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Match Stats</h3>
              <p className="text-gray-600">
                Record live stats during matches. Parents and fans can follow along in real-time, 
                even when they can't make it to the pitch.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Communication</h3>
              <p className="text-gray-600">
                Send match updates, training schedules, and important announcements. 
                Keep everyone in the loop without endless group chats.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Player Development</h3>
              <p className="text-gray-600">
                Track individual player progress with character development and achievements. 
                Make football fun and rewarding for every child.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-orange-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">👕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kit & Equipment</h3>
              <p className="text-gray-600">
                Design team kits and order equipment. Parents can buy exactly what their child needs 
                with no guesswork or multiple trips to sports shops.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-red-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Payments</h3>
              <p className="text-gray-600">
                Collect subs, tournament fees, and kit payments automatically. 
                No more chasing parents for cash or keeping track of who's paid what.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-teal-50 p-6 rounded-xl">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Works Offline</h3>
              <p className="text-gray-600">
                Record match stats even with poor signal. Everything syncs automatically 
                when you're back online. Perfect for remote pitches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based CTAs */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Everyone in Grassroots Football
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Coaches */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👨‍🏫</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Coaches</h3>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Manage your entire team from one dashboard</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Plan training sessions with equipment tracking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Book referees and manage match day logistics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Track team finances and collect payments</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/register/coach">Start Managing Your Team</Link>
              </Button>
            </div>

            {/* Parents */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👨‍👩‍👧‍👦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Parents</h3>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Follow your child's matches and development</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Get match schedules and training updates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Pay subs and order kit with one click</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>Volunteer for match day roles when available</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href="/parent/register">Join as a Parent</Link>
              </Button>
            </div>

            {/* Referees */}
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🏃‍♂️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Referees</h3>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Set your availability and coverage areas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Receive match assignments automatically</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Get paid securely after each match</span>
          </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Build your reputation with coach ratings</span>
          </li>
              </ul>
              <Button asChild variant="outline" className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50">
                <Link href="/register/referee">Register as Referee</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Trusted by Grassroots Teams Across the UK
            </h2>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-gray-600">Teams Using KickHub</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">15,000+</div>
                <div className="text-gray-600">Players Registered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">25,000+</div>
                <div className="text-gray-600">Parents Connected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">98%</div>
                <div className="text-gray-600">Coach Satisfaction</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-green-50 p-8 rounded-xl max-w-4xl mx-auto">
              <blockquote className="text-xl text-gray-700 mb-6">
                "KickHub has transformed how we run our U10s team. Parents love getting live updates during matches, 
                and I've saved hours each week on admin. The kids are more engaged than ever with their character development!"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">MJ</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Mark Johnson</div>
                  <div className="text-gray-600">Coach, Riverside Rangers FC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of coaches who've already made the switch to KickHub.
            Set up your team in minutes and see the difference immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Link href="/register/coach">Start Your Free Team</Link>
            </Button>
            <p className="text-green-100 text-sm">
              Free forever • No credit card required • 5-minute setup
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚽</span>
                </div>
                <span className="text-xl font-bold">KickHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                The complete grassroots football management platform for UK teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 KickHub. All rights reserved. Built for grassroots football in the UK.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}