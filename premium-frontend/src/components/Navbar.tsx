import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity">
          SHOP.
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[var(--color-muted-foreground)]">
          <Link href="/" className="hover:text-[var(--color-foreground)] transition-colors">Products</Link>
          <Link href="#" className="hover:text-[var(--color-foreground)] transition-colors">Collections</Link>
          <Link href="#" className="hover:text-[var(--color-foreground)] transition-colors">Brands</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-[var(--color-foreground)] hover:opacity-70 transition-opacity">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-[var(--color-foreground)] hover:opacity-70 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
