"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cartStr = localStorage.getItem("moso_cart");
      if (cartStr) {
        try {
          const cartItems = JSON.parse(cartStr);
          const count = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
          setCartCount(count);
        } catch (e) {
          console.error(e);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("cart_updated", updateCartCount);
    return () => window.removeEventListener("cart_updated", updateCartCount);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      isScrolled ? "glass shadow-md py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-tighter text-gradient">
            mososhop
          </span>
        </Link>

        {/* Search Bar - Desktop hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
          <input
            type="text"
            placeholder="搜尋商品、品牌..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-moso-pink transition-all border border-transparent focus:border-moso-pink"
          />
          <button
            onClick={handleSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-moso-pink transition-colors hover:text-moso-pink"
            aria-label="搜尋"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative text-slate-700 dark:text-slate-200 hover:text-moso-pink transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-moso-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <button 
            onClick={() => {
              if (typeof window !== "undefined") {
                const token = localStorage.getItem("token");
                if (token) {
                  router.push("/member/profile");
                } else {
                  router.push("/member/login");
                }
              }
            }}
            className="text-slate-700 dark:text-slate-200 hover:text-moso-pink transition-colors"
          >
            <User size={24} />
          </button>
          <button className="md:hidden text-slate-700 dark:text-slate-200">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
