/**
 * Tipay header with Freighter wallet integration.
 * Brutalist design — massive spacing, structural borders, hard shadows.
 * @module components/Header
 */
"use client";

import { useState } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { shortAddress } from "@/lib/utils";
import {
  Wallet,
  LogOut,
  Shield,
  Zap,
  Menu,
  X,
} from "lucide-react";

export function Header() {
  const { connected, address, connect, disconnect } = useFreighter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect();
    } catch {
      // Error shown by wallet
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-b-2 border-black">
      <div className="w-full px-8 lg:px-16 xl:px-24 h-20 flex items-center justify-between relative">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-3 font-black text-2xl tracking-tight hover:text-[#d73b19] transition-colors"
        >
          <Zap className="w-6 h-6" strokeWidth={3} />
          <span className="uppercase">Tipay</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="/"
            className="text-sm font-bold uppercase tracking-[0.15em] hover:text-[#d73b19] transition-colors"
          >
            Sessions
          </a>

          {connected && address ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-4 py-2.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-bold text-sm tracking-wide active:translate-x-0.5 active:translate-y-0.5"
              >
                <Shield className="w-4 h-4" strokeWidth={3} />
                <span className="font-mono text-xs">{shortAddress(address)}</span>
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 bg-white border-2 border-black shadow-hard animate-slide-up"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="p-4 border-b-2 border-black">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">
                      Connected As
                    </p>
                    <p className="text-sm font-mono break-all leading-relaxed">
                      {address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-[#d73b19] hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={3} />
                    DISCONNECT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-3 px-5 py-2.5 border-2 border-black bg-black text-white hover:bg-[#d73b19] hover:border-[#d73b19] transition-all font-bold text-sm tracking-wide active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" strokeWidth={3} />
              {connecting ? "CONNECTING…" : "CONNECT WALLET"}
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 border-2 border-black"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" strokeWidth={3} /> : <Menu className="w-6 h-6" strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t-2 border-black bg-white animate-slide-up">
          <div className="p-6 space-y-4">
            <a
              href="/"
              className="block text-sm font-bold uppercase tracking-[0.15em] hover:text-[#d73b19]"
              onClick={() => setMobileOpen(false)}
            >
              Sessions
            </a>
            {connected && address ? (
              <div className="space-y-3 border-t-2 border-black pt-4">
                <p className="text-xs font-mono break-all">{address}</p>
                <button
                  onClick={() => {
                    disconnect();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-black text-white font-bold text-sm hover:bg-[#d73b19] hover:border-[#d73b19] transition-all"
                >
                  <LogOut className="w-4 h-4" strokeWidth={3} />
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-black text-white font-bold text-sm hover:bg-[#d73b19] hover:border-[#d73b19] transition-all"
              >
                <Wallet className="w-4 h-4" strokeWidth={3} />
                {connecting ? "CONNECTING…" : "CONNECT WALLET"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
