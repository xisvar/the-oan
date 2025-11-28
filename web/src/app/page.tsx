import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, CheckCircle, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 border-b">
        <div className="container px-4 md:px-6 mx-auto text-center space-y-6">
          <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-600 mb-4">
            Admissions Integrity Infrastructure
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 max-w-4xl mx-auto">
            Trust is good. <br className="hidden sm:inline" />
            <span className="text-indigo-600">Evidence is better.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl leading-relaxed">
            OAN replaces opaque admissions processes with cryptographic proof.
            Every credential, every decision, and every event is signed, verifiable, and permanent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/institution">
              <Button size="lg" className="gap-2">
                Issue Credential <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" size="lg" className="gap-2">
                Verify Credential <CheckCircle className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Cryptographic Truth</h3>
              <p className="text-slate-600">
                Credentials are signed using ECDSA. No more screenshots or forged documents.
                Verification is mathematical, not manual.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Append-Only History</h3>
              <p className="text-slate-600">
                Every action is logged in an immutable ledger. Changes to rules or decisions
                leave a permanent, auditable trail.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Universal Verification</h3>
              <p className="text-slate-600">
                Anyone can verify a credential instantly. Schools, employers, and regulators
                share a single source of truth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
