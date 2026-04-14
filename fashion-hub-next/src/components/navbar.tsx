"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag, Menu, X, Bell, TrendingUp, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/products?category=T-Shirts", label: "T-Shirts" },
  { href: "/products?category=Jeans", label: "Jeans" },
  { href: "/products?category=Sneakers", label: "Sneakers" },
  { href: "/products?category=Dresses", label: "Dresses" },
  { href: "/products?category=Jackets", label: "Jackets" },
  { href: "/products?category=Ethnic", label: "Ethnic" },
];

const QUICK_SEARCHES = ["Nike Air Force 1", "Levi's 511", "Adidas Ultraboost", "Zara Dress", "Ralph Lauren"];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleQuickSearch = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${isScrolled ? "glass" : "bg-transparent"}`}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-brand-text hidden sm:block">
              FashionHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-[13px] text-white/60 hover:text-white/95 hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Deals badge */}
          <Link
            href="/deals"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}
          >
            <Tag className="w-3 h-3" />
            Top Deals
          </Link>

          {/* Search */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-[13px]"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:block">Search</span>
            </button>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-[420px] glass-card rounded-2xl shadow-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, brands, categories..."
                      className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")}>
                        <X className="w-4 h-4 text-white/40 hover:text-white/80" />
                      </button>
                    )}
                  </form>
                  <div className="p-3">
                    <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2 px-2">Popular Searches</p>
                    {QUICK_SEARCHES.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQuickSearch(q)}
                        className="w-full text-left px-3 py-2 text-[13px] text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-3"
                      >
                        <TrendingUp className="w-3 h-3 text-purple-400/60" />
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alerts */}
          <Link href="/alerts" className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all hidden md:flex">
            <Bell className="w-4 h-4" />
          </Link>

          {/* Wishlist */}
          <Link href="/wishlist" className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all hidden md:flex">
            <Heart className="w-4 h-4" />
          </Link>

          {/* Mobile menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-72 z-40 glass shadow-2xl lg:hidden flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="font-bold gradient-brand-text">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 flex-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="section-divider my-3" />
              <Link href="/deals" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-[14px] text-amber-400 hover:bg-amber-400/5 rounded-xl flex items-center gap-2">
                <Tag className="w-4 h-4" /> Top Deals
              </Link>
              <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-2">
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
