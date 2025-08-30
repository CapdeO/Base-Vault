"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowRight, 
  Shield, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Lock, 
  Users,
  Zap,
  CheckCircle
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BaseVault</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white">How it Works</a>
            <a href="#security" className="text-gray-300 hover:text-white">Security</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-900 text-blue-200 border-blue-700">
            🚀 Built on Base Network
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Save Smarter with
            <br />
            Goal-Based Vaults
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Lock your USDC in secure vaults and watch your savings grow through Aave and Symbiotic yield strategies. 
            Set goals, track progress, and achieve your financial dreams on Base.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg" asChild>
              <a href="/lock">
                Start Saving <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Why Choose BaseVault?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of savings with our innovative features designed to help you reach your financial goals faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 border-gray-700 bg-gray-800 hover:border-blue-500 transition-colors">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <CardTitle className="text-white">Goal-Based Savings</CardTitle>
              <CardDescription className="text-gray-300">
                Set specific financial goals and lock your USDC to stay committed and earn yield.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6 border-gray-700 bg-gray-800 hover:border-green-500 transition-colors">
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-white">High Yield Returns</CardTitle>
              <CardDescription className="text-gray-300">
                Earn competitive returns through Aave and Symbiotic protocols with optimized strategies.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6 border-gray-700 bg-gray-800 hover:border-purple-500 transition-colors">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <CardTitle className="text-white">Battle-Tested Security</CardTitle>
              <CardDescription className="text-gray-300">
                Your funds are secured by proven DeFi protocols with millions in TVL.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6 border-gray-700 bg-gray-800 hover:border-orange-500 transition-colors">
            <CardHeader className="text-center">
              <Zap className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <CardTitle className="text-white">Base Network Speed</CardTitle>
              <CardDescription className="text-gray-300">
                Enjoy fast, low-cost transactions on Coinbase's secure Layer 2 solution.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6 border-gray-700 bg-gray-800 hover:border-red-500 transition-colors">
            <CardHeader className="text-center">
              <DollarSign className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <CardTitle className="text-white">USDC Stability</CardTitle>
              <CardDescription className="text-gray-300">
                Save with confidence using USDC, a regulated and transparent stablecoin.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="p-6 border-gray-700 bg-gray-800 hover:border-cyan-500 transition-colors">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <CardTitle className="text-white">Community Driven</CardTitle>
              <CardDescription className="text-gray-300">
                Join a community of savers working towards their financial independence together.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">How BaseVault Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to start earning yield on your savings goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Set Your Goal</h3>
              <p className="text-gray-300">
                Define your savings target and timeline. Whether it's an emergency fund, vacation, or down payment.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Lock Your USDC</h3>
              <p className="text-gray-300">
                Deposit USDC into your vault. Your funds are automatically deployed to Aave and Symbiotic for yield.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Watch It Grow</h3>
              <p className="text-gray-300">
                Track your progress and earnings in real-time. Withdraw when you reach your goal or timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Goal Examples */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Popular Savings Goals</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how BaseVault helps users achieve their financial milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                Emergency Fund
                <Badge variant="secondary" className="bg-gray-700 text-gray-200">6 months</Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">Building a $10,000 safety net</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2 text-gray-300">
                  <span>Progress</span>
                  <span>$7,245 / $10,000</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>APY: 8.2%</span>
                <span>+$594 earned</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                Dream Vacation
                <Badge variant="secondary" className="bg-gray-700 text-gray-200">12 months</Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">European adventure fund</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2 text-gray-300">
                  <span>Progress</span>
                  <span>$4,680 / $8,000</span>
                </div>
                <Progress value={58} className="h-2" />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>APY: 7.9%</span>
                <span>+$369 earned</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                House Down Payment
                <Badge variant="secondary" className="bg-gray-700 text-gray-200">24 months</Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">Saving for the perfect home</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2 text-gray-300">
                  <span>Progress</span>
                  <span>$32,150 / $50,000</span>
                </div>
                <Progress value={64} className="h-2" />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>APY: 8.7%</span>
                <span>+$2,795 earned</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Enterprise-Grade Security</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your funds are protected by the most trusted protocols in DeFi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Aave Protocol Integration</h3>
                    <p className="text-gray-300">
                      Deployed on Aave V3, the most battle-tested lending protocol with over $10B in TVL.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Symbiotic Restaking</h3>
                    <p className="text-gray-300">
                      Enhanced yield through Symbiotic's innovative restaking mechanism with additional security layers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Base Network Security</h3>
                    <p className="text-gray-300">
                      Built on Coinbase's Layer 2 solution, inheriting Ethereum's security with faster, cheaper transactions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Proven Protocol Security</h3>
                    <p className="text-gray-300">
                      Built on protocols that have secured billions of dollars with robust security practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-center text-white">Security Partners</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Aave Protocol</div>
                    <div className="text-sm text-gray-400">$10.2B+ TVL</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Symbiotic</div>
                    <div className="text-sm text-gray-400">Next-gen restaking</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Base Network</div>
                    <div className="text-sm text-gray-400">Coinbase L2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Start Your Savings Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who are already earning yield on their savings goals. 
            Start building your financial future today with BaseVault.
          </p>
          
          <div className="flex justify-center mb-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-12 py-4 text-lg" asChild>
              <a href="/lock">
                Launch App <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Battle-Tested Protocols</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Growing Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BaseVault</span>
              </div>
              <p className="text-gray-300 text-sm">
                Goal-based savings with yield generation on Base network.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2025 BaseVault. All rights reserved. Built on Base Network.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
