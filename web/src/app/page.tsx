import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, CheckCircle, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Open Admissions Network
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            A decentralized, transparent, and merit-based higher education admissions platform built on cryptographic trust.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Student Portal */}
          <a href="/student/login" className="block group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Student Portal</h3>
              <p className="text-sm text-gray-600">Access your wallet, credentials, and applications</p>
            </div>
          </a>

          {/* Institution Portal */}
          <a href="/institution/login" className="block group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Institution Portal</h3>
              <p className="text-sm text-gray-600">Manage programs, rules, and admissions</p>
            </div>
          </a>

          {/* Regulator Portal */}
          <a href="/regulator/dashboard" className="block group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Regulator Portal</h3>
              <p className="text-sm text-gray-600">Monitor compliance and system integrity</p>
            </div>
          </a>

          {/* Verify Credential */}
          <a href="/verify" className="block group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Verify Credential</h3>
              <p className="text-sm text-gray-600">Check authenticity of any OAN credential</p>
            </div>
          </a>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold mb-1">Cryptographic Trust</h3>
              <p className="text-sm text-gray-600">Every action is signed and verified</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Transparent Matching</h3>
              <p className="text-sm text-gray-600">Merit-based with verifiable quotas</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold mb-1">Append-Only Ledger</h3>
              <p className="text-sm text-gray-600">Complete audit trail of all events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
