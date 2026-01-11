'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function Hero() {
  const { user, userData } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 animated-gradient opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
        
        <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                500+ Active Rides Today
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-barlow)] tracking-tight text-gray-900">
                  Your Campus Ride,
                  <br />
                  <span className="gradient-text">Simplified</span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto font-[family-name:var(--font-roboto)]">
                  Connect with verified student drivers for safe, affordable rickshaw rides around campus
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                {user ? (
                  <Link href={userData?.role === 'student' ? '/student/dashboard' : '/driver/dashboard'}>
                    <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl shadow-amber-200/50 hover:shadow-amber-300/50 transition-all duration-300 hover:scale-105">
                      Go to Dashboard
                      <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl shadow-amber-200/50 hover:shadow-amber-300/50 transition-all duration-300 hover:scale-105">
                        Get Started Free
                        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-all duration-300 hover:scale-105">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-barlow)] gradient-text">500+</div>
                  <div className="text-sm text-gray-600 mt-1">Active Riders</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-barlow)] gradient-text">150+</div>
                  <div className="text-sm text-gray-600 mt-1">Verified Drivers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-barlow)] gradient-text">10K+</div>
                  <div className="text-sm text-gray-600 mt-1">Rides Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-barlow)] text-gray-900">
              Why Students Love RikRide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Safe, affordable, and convenient campus transportation designed for students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200/50 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-barlow)] text-gray-900 mb-3">Verified & Safe</h3>
              <p className="text-gray-600">All drivers verified with Aadhaar/License. Students verified with College ID. Your safety is our priority.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200/50 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-barlow)] text-gray-900 mb-3">Student-Friendly Prices</h3>
              <p className="text-gray-600">Affordable rates designed for students. Transparent pricing with no hidden charges. Pay what you see.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-barlow)] text-gray-900 mb-3">Quick Booking</h3>
              <p className="text-gray-600">Find and book a ride in seconds. Real-time driver availability. Get to class on time, every time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-amber-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-barlow)] text-gray-900">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">Book your ride in three easy steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300" />

            {[
              { step: '01', title: 'Set Location', desc: 'Enter your pickup and drop-off locations', icon: '📍' },
              { step: '02', title: 'Choose Driver', desc: 'Select from available verified drivers', icon: '🛺' },
              { step: '03', title: 'Enjoy Ride', desc: 'Track your ride and reach safely', icon: '✨' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl shadow-amber-100/50 flex items-center justify-center mx-auto mb-6 text-4xl border-2 border-amber-100">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-amber-600 tracking-wider">STEP {item.step}</span>
                <h3 className="text-xl font-bold font-[family-name:var(--font-barlow)] text-gray-900 mt-2 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-barlow)] text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Join thousands of students who trust RikRide for their daily commute
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-amber-600 hover:bg-amber-50 shadow-xl transition-all duration-300 hover:scale-105">
                Sign Up as Student
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105">
                Become a Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🛺</span>
              </div>
              <span className="text-2xl font-bold font-[family-name:var(--font-barlow)] text-white">RikRide</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 RikRide. Made with ❤️ for students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
