'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Pattern */}
  <div className="absolute inset-0 bg-linear-to-br from-yellow-50 via-orange-50 to-amber-50">
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              }}
            >
              🛺
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-linear-to-r from-yellow-400 to-orange-500 text-white border-0 px-6 py-2 text-sm font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg">
            🚀 Connecting Students with Auto-Rickshaw Drivers
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-linear-to-r from-yellow-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
              Campus Rides,
            </span>
            <br />
            <span className="text-gray-900">Made Simple</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            RikHub connects college students with verified auto-rickshaw drivers for{' '}
            <span className="font-semibold text-orange-600">safe, affordable, and instant rides</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/signup">
              <Button className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Get Started 🛺
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {[
              { number: '500+', label: 'Active Students', icon: '🎓' },
              { number: '50+', label: 'Verified Drivers', icon: '🛺' },
              { number: '24/7', label: 'Available', icon: '⚡' },
            ].map((stat, index) => (
              <Card
                key={index}
                className="p-6 bg-white/80 backdrop-blur-sm border-2 border-yellow-200 hover:border-orange-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-bold bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16">Simple. Fast. Reliable.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '1',
                title: 'Sign Up',
                description: 'Create your account as a student or driver in seconds',
                icon: '📱',
              },
              {
                step: '2',
                title: 'Find Drivers',
                description: 'Browse available drivers nearby with real-time updates',
                icon: '🔍',
              },
              {
                step: '3',
                title: 'Book & Go',
                description: 'Request a ride and get picked up instantly',
                icon: '🚀',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative bg-white p-8 rounded-2xl border-2 border-yellow-200 hover:border-orange-400 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {item.step}
                </div>

                <div className="text-5xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-gray-900">
            Why Choose <span className="bg-linear-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">RikHub</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Instant Booking',
                description: 'Find and book rides in real-time with just a tap',
                icon: '⚡',
                color: 'from-yellow-400 to-orange-400',
              },
              {
                title: 'Safe & Secure',
                description: 'All drivers are verified with ratings and reviews',
                icon: '🛡️',
                color: 'from-orange-400 to-red-400',
              },
              {
                title: 'Fair Pricing',
                description: 'Transparent fares with no hidden charges',
                icon: '💰',
                color: 'from-yellow-500 to-orange-500',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-linear-to-br from-white to-yellow-50 border-2 border-yellow-200 hover:border-orange-400 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-linear-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center">
          <Card className="max-w-4xl mx-auto p-12 bg-linear-to-br from-yellow-500 via-orange-500 to-yellow-600 border-0 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-yellow-50 mb-8">
              Join hundreds of students and drivers already using RikHub
            </p>
            <Link href="/signup">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Sign Up Now 🚀
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Add floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
