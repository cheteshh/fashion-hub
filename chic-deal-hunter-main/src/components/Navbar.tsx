import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Menu, X, ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar = ({ darkMode, toggleDarkMode }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-gradient text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            FashionHub
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands, colors..."
              className="h-10 w-64 rounded-full border bg-secondary pl-10 pr-4 text-sm text-foreground outline-none transition-all focus:w-80 focus:ring-2 focus:ring-ring"
            />
          </form>
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/search" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </Link>

          {/* Cart icon */}
          <Link to="/cart" className="relative rounded-full p-2 transition-colors hover:bg-secondary">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground leading-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-full p-2 transition-colors hover:bg-secondary"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Auth */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/80"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="h-5 w-5 rounded-full" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border bg-card shadow-lg"
                  >
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/cart"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"
                    >
                      <ShoppingCart className="h-4 w-4" /> My Cart
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-secondary">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground leading-none">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={toggleDarkMode} className="rounded-full p-2 hover:bg-secondary">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full p-2 hover:bg-secondary">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="space-y-3 px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brands, colors..."
                  className="h-10 w-full rounded-full border bg-secondary pl-10 pr-4 text-sm outline-none"
                />
              </form>
              <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Home</Link>
              <Link to="/search" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Browse</Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Cart {totalItems > 0 && `(${totalItems})`}</Link>
              {user ? (
                <div className="border-t pt-2">
                  <p className="py-2 text-sm font-medium">{user.name}</p>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block py-2 text-sm text-destructive">Sign Out</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-accent">Sign In / Sign Up</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
