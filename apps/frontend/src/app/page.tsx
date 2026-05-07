/**
 * Tipay Landing Page — Brutalist Terminal
 * Based on Stitch "Tipay - Landing Page (V2)" design
 * @module app/page
 */
"use client";

import { useFreighter } from "@/hooks/useFreighter";
import Link from "next/link";
import {
  Zap,
  Shield,
  Coins,
  Vote,
  FileCode,
  ArrowRight,
  Terminal,
  Lock,
  Wallet,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const { connect, connected } = useFreighter();

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-8 lg:px-16 xl:px-24 border-b-2 border-black relative">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 py-20 pt-32">
          <div className="lg:col-span-8 flex flex-col justify-center">
            {/* Tags */}
            <div className="flex gap-4 mb-8">
              <span className="inline-block border-2 border-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#F9F9F9] shadow-[2px_2px_0px_0px_#000000]">
                Built on Stellar
              </span>
              <span className="inline-block border-2 border-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d73b19] text-white shadow-[2px_2px_0px_0px_#000000]">
                Secured by Soroban
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-[80px] md:text-[120px] font-black uppercase leading-[0.85] tracking-tighter mb-6">
              Tipay
            </h1>

            {/* Orange Bar */}
            <div className="h-8 w-full bg-[#d73b19] border-2 border-black mb-10 shadow-[8px_8px_0px_0px_#000000]" />

            {/* Tagline */}
            <p className="text-xl md:text-2xl font-bold uppercase leading-tight mb-12 max-w-2xl tracking-tight">
              Accountability sessions on Stellar.<br />
              Deposit USDC. Vote absentees.<br />
              Earn rewards.
            </p>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap">
              {!connected && (
                <button
                  onClick={connect}
                  className="bg-black text-white px-10 py-4 border-2 border-black text-lg font-black uppercase tracking-[0.05em] hover:shadow-[8px_8px_0px_0px_#d73b19] hover:-translate-y-1 transition-all duration-100 active:translate-y-0 active:shadow-none flex items-center gap-3"
                >
                  <Wallet className="w-5 h-5" strokeWidth={3} />
                  Connect Wallet
                </button>
              )}
              <Link
                href="/sessions"
                className="bg-[#F9F9F9] text-black px-10 py-4 border-2 border-black text-lg font-black uppercase tracking-[0.05em] hover:shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 transition-all duration-100 active:translate-y-0 active:shadow-none"
              >
                Start Now
              </Link>
            </div>
          </div>

          {/* Right visual block */}
          <div className="lg:col-span-4 hidden lg:block border-2 border-black shadow-[16px_16px_0px_0px_#d73b19] bg-white p-3">
            <div className="w-full h-full border-2 border-black bg-black flex items-center justify-center">
              <Terminal className="w-32 h-32 text-[#d73b19]" strokeWidth={1.5} />
              <p className="text-8xl text-[#d73b19] pb-5">0</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 lg:px-16 xl:px-24 py-24 border-b-2 border-black bg-white">
        <div className="mb-16 border-b-4 border-black pb-4 inline-block">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Core System
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-2 border-black p-8 bg-[#F9F9F9] shadow-[8px_8px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#d73b19] transition-all">
            <FileCode className="w-12 h-12 mb-6 text-[#d73b19]" strokeWidth={2} />
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight">
              Soroban Smart Contracts
            </h3>
            <p className="text-sm uppercase text-gray-600 leading-relaxed">
              Trustless automation on Stellar. Locks and distributes funds based on strict algorithmic parameters.
            </p>
          </div>

          <div className="border-2 border-black p-8 bg-[#F9F9F9] shadow-[8px_8px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#d73b19] transition-all">
            <Coins className="w-12 h-12 mb-6 text-[#d73b19]" strokeWidth={2} />
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight">
              Low Fees
            </h3>
            <p className="text-sm uppercase text-gray-600 leading-relaxed">
              Minimal network costs. Keep more of your stake and rewards thanks to the highly efficient Stellar network.
            </p>
          </div>

          <div className="border-2 border-black p-8 bg-[#F9F9F9] shadow-[8px_8px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#d73b19] transition-all">
            <Vote className="w-12 h-12 mb-6 text-[#d73b19]" strokeWidth={2} />
            <h3 className="text-xl font-black uppercase mb-4 tracking-tight">
              Transparent Voting
            </h3>
            <p className="text-sm uppercase text-gray-600 leading-relaxed">
              On-chain verifiable absence. Peer consensus mechanism ensures accurate penalty application.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 lg:px-16 xl:px-24 py-24 bg-[#eeeeee] border-b-2 border-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#d73b19] transition-all">
            <div className="bg-black text-white p-4 border-b-2 border-black">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Network Metric 01
              </h3>
            </div>
            <div className="p-8">
              <span className="text-6xl md:text-7xl font-black block mb-2">3+</span>
              <span className="text-lg font-bold uppercase text-[#d73b19] tracking-tight">
                Players
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#d73b19] transition-all">
            <div className="bg-black text-white p-4 border-b-2 border-black">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Network Metric 02
              </h3>
            </div>
            <div className="p-8">
              <span className="text-6xl md:text-7xl font-black block mb-2">USDC</span>
              <span className="text-lg font-bold uppercase text-[#d73b19] tracking-tight">
                Stakes
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[8px_8px_0px_0px_#d73b19] transition-all">
            <div className="bg-black text-white p-4 border-b-2 border-black">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Network Metric 03
              </h3>
            </div>
            <div className="p-8">
              <span className="text-6xl md:text-7xl font-black block mb-2">100%</span>
              <span className="text-lg font-bold uppercase text-[#d73b19] tracking-tight">
                On-chain
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Flow Section */}
      <section className="px-8 lg:px-16 xl:px-24 py-24 bg-white border-b-2 border-black">
        <div className="mb-16 border-b-4 border-black pb-4 inline-block">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Protocol Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-2 border-black shadow-[12px_12px_0px_0px_#000000]">
          {/* Left panel */}
          <div className="lg:col-span-5 p-10 lg:p-12 border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-[#d73b19] text-white">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 tracking-tight">
              Immutable Accountability
            </h2>
            <p className="text-lg uppercase mb-8 leading-relaxed">
              The TIPAY protocol enforces social contracts via financial stakes. Every deposit is locked in a Soroban smart contract until the session parameters are met or failed.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                <Terminal className="w-5 h-5" strokeWidth={3} />
                No Trust Required
              </li>
              <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                <Shield className="w-5 h-5" strokeWidth={3} />
                Soroban Protected
              </li>
              <li className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest">
                <Coins className="w-5 h-5" strokeWidth={3} />
                Automated Payouts
              </li>
            </ul>
          </div>

          {/* Right panel - Steps */}
          <div className="lg:col-span-7 p-10 lg:p-12 bg-[#F9F9F9]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-black p-6 bg-white relative">
                <span className="absolute -top-4 -left-4 text-5xl font-black text-[#d73b19]/20">01</span>
                <h4 className="font-black text-xl mb-4 uppercase border-b-2 border-black inline-block relative z-10 pb-1">
                  Deposit
                </h4>
                <p className="text-sm uppercase relative z-10 leading-relaxed text-gray-600">
                  Initialize a session by locking USDC. Set the rules of your accountability event with precision parameters.
                </p>
              </div>

              <div className="border-2 border-black p-6 bg-white relative">
                <span className="absolute -top-4 -left-4 text-5xl font-black text-[#d73b19]/20">02</span>
                <h4 className="font-black text-xl mb-4 uppercase border-b-2 border-black inline-block relative z-10 pb-1">
                  Verify
                </h4>
                <p className="text-sm uppercase relative z-10 leading-relaxed text-gray-600">
                  Peers verify participation. Absence is calculated as a protocol violation.
                </p>
              </div>

              <div className="border-2 border-black p-6 bg-white relative">
                <span className="absolute -top-4 -left-4 text-5xl font-black text-[#d73b19]/20">03</span>
                <h4 className="font-black text-xl mb-4 uppercase border-b-2 border-black inline-block relative z-10 pb-1">
                  Slash
                </h4>
                <p className="text-sm uppercase relative z-10 leading-relaxed text-gray-600">
                  Violations result in automatic stake slashing. Slashed funds are distributed to successful participants.
                </p>
              </div>

              <div className="border-2 border-black p-6 bg-white relative">
                <span className="absolute -top-4 -left-4 text-5xl font-black text-[#d73b19]/20">04</span>
                <h4 className="font-black text-xl mb-4 uppercase border-b-2 border-black inline-block relative z-10 pb-1">
                  Claim
                </h4>
                <p className="text-sm uppercase relative z-10 leading-relaxed text-gray-600">
                  Success triggers a release of your original stake plus network rewards for integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-8 py-32 flex flex-col items-center justify-center text-center bg-[#d73b19] border-b-2 border-black relative overflow-hidden">
        <div className="absolute top-4 left-4 text-black/20 text-[10px] font-bold uppercase tracking-[0.2em] hidden lg:block text-left leading-relaxed">
          System Status: Ready<br />
          Encryption: AES-256<br />
          Network: Stellar Testnet
        </div>

        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase mb-12 relative z-10 tracking-tighter">
          Are you ready?
        </h2>

        {connected ? (
          <Link
            href="/sessions"
            className="bg-black text-white px-16 py-6 border-4 border-black text-xl md:text-2xl font-black uppercase hover:bg-white hover:text-black hover:shadow-[12px_12px_0px_0px_#000000] transition-all active:translate-y-2 active:shadow-none relative z-10"
          >
            Go!
          </Link>
        ) : (
          <button
            onClick={connect}
            className="bg-black text-white px-16 py-6 border-4 border-black text-xl md:text-2xl font-black uppercase hover:bg-white hover:text-black hover:shadow-[12px_12px_0px_0px_#000000] transition-all active:translate-y-2 active:shadow-none relative z-10 flex items-center gap-4"
          >
            <Wallet className="w-6 h-6" strokeWidth={3} />
            Connect Wallet Now
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-black text-[#F9F9F9]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 lg:px-16 xl:px-24 py-12 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-black text-[#d73b19] uppercase tracking-tight">Tipay</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Tipay Protocol v1.0 — Stellar Network
            </span>
          </div>

          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:underline decoration-[#d73b19] decoration-2 transition-colors">
              Source Code
            </a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:underline decoration-[#d73b19] decoration-2 transition-colors">
              Telegram
            </a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:underline decoration-[#d73b19] decoration-2 transition-colors">
              Whitepaper
            </a>
          </div>

          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; 2024 Tipay Systems
          </div>
        </div>
      </footer>
    </div>
  );
}
