import React from 'react'
import Link from 'next/link'

function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Welcome to <span className="text-gray-700">Rikshaw</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
              Experience the future of transportation. Fast, reliable, and affordable rides at your fingertips. 
              Book your journey with just a few clicks.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/dashboard"
                className="bg-gray-900 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600 mt-1">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600 mt-1">Cities</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Placeholder for image - you can replace with actual image */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600 rounded-3xl transform rotate-3 shadow-2xl"></div>
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
                <div className="text-white p-12 text-center">
                  <svg className="w-full h-full opacity-20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-1.086-2h2.202zm-1.441 3.506c.639 1.186.946 2.252.946 3.666 0 1.882-.792 3.75-2.284 5.5l-.212.238c-.828.914-1.972 1.569-3.509 1.569-1.431 0-2.524-.546-3.438-1.188-.494-.347-.971-.692-1.562-.692-.592 0-1.068.345-1.562.692-.914.642-2.007 1.188-3.438 1.188-1.537 0-2.681-.655-3.509-1.569l-.212-.238c-1.492-1.75-2.284-3.618-2.284-5.5 0-1.414.307-2.48.946-3.666.829-1.537 1.851-2.938 2.602-3.506.751-.567 2.064-1.034 3.11-1.034.822 0 1.519.286 2.171.864l.729.649.729-.649c.652-.578 1.349-.864 2.171-.864 1.046 0 2.359.467 3.11 1.034.751.568 1.773 1.969 2.602 3.506zm-13.059-3.506c-.956 0-1.922.396-2.486.838-.564.442-1.4 1.662-2.053 2.915-.508.943-.811 1.793-.811 2.915 0 1.536.665 3.101 1.925 4.605l.21.235c.656.724 1.505 1.156 2.465 1.156 1.058 0 1.835-.42 2.648-.981.565-.39 1.125-.778 1.852-.778.727 0 1.287.388 1.852.778.813.561 1.59.981 2.648.981.96 0 1.809-.432 2.465-1.156l.21-.235c1.26-1.504 1.925-3.069 1.925-4.605 0-1.122-.303-1.972-.811-2.915-.653-1.253-1.489-2.473-2.053-2.915-.564-.442-1.53-.838-2.486-.838-.626 0-1.084.199-1.639.639l-1.361 1.213-1.361-1.213c-.555-.44-1.013-.639-1.639-.639z"/>
                  </svg>
                  <p className="mt-4 text-2xl font-bold">Your Journey Starts Here</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="hidden lg:block absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Verified</div>
                  <div className="text-sm text-gray-600">Safe & Secure</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Fast</div>
                  <div className="text-sm text-gray-600">Quick Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
    </section>
  )
}

export default Hero
