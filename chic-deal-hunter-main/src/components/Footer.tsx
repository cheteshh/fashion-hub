import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-secondary/50 py-12">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <span className="text-gradient text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>FashionHub</span>
          <p className="mt-2 text-sm text-muted-foreground">Compare fashion prices across Myntra, Amazon, Flipkart & Ajio. Find the best deals instantly.</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Quick Links</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/" className="block hover:text-foreground">Home</Link>
            <Link to="/search" className="block hover:text-foreground">Browse Products</Link>
            <Link to="/cart" className="block hover:text-foreground">My Cart</Link>
            <Link to="/login" className="block hover:text-foreground">Sign In</Link>
            <Link to="/signup" className="block hover:text-foreground">Create Account</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Platforms</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="https://www.myntra.com" target="_blank" rel="noreferrer" className="block hover:text-foreground">Myntra</a>
            <a href="https://www.amazon.in" target="_blank" rel="noreferrer" className="block hover:text-foreground">Amazon</a>
            <a href="https://www.flipkart.com" target="_blank" rel="noreferrer" className="block hover:text-foreground">Flipkart</a>
            <a href="https://www.ajio.com" target="_blank" rel="noreferrer" className="block hover:text-foreground">Ajio</a>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        © 2026 FashionHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
