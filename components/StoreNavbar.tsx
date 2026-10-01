'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StoreNavbarProps {
  onSignInClick?: () => void;
}

export default function StoreNavbar({ onSignInClick }: StoreNavbarProps) {
  const { isSignedIn, signOut, wishlist, cart, user } = useStore();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-soft-sm border-b border-slate-200/50 py-3' 
            : 'bg-white/95 backdrop-blur-md border-b border-slate-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform duration-300">
                <span className="font-black text-xl tracking-tight">P</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-teal-800 bg-clip-text text-transparent">
                  PrintoStyle
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-600/80 -mt-1">Store</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navLinks.map(link => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={`relative font-semibold text-sm transition-colors ${
                        isActive ? 'text-teal-600' : 'text-slate-500 hover:text-teal-600'
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="h-6 w-px bg-slate-200/80"></div>

              <div className="flex items-center gap-4">
                <Link 
                  href="/wishlist" 
                  className="relative p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link 
                  href="/cart" 
                  className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                  title="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white ring-2 ring-white">
                      {cart.length}
                    </span>
                  )}
                </Link>

                {isSignedIn ? (
                  <div className="flex items-center gap-3 pl-2 border-l border-slate-200/80">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full py-1 pl-1.5 pr-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-teal-800 text-white text-[10px] font-bold flex items-center justify-center shadow-sm uppercase">
                        {user?.name ? user.name.substring(0, 2) : 'US'}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{user?.name || 'User'}</span>
                    </div>
                    <button 
                      onClick={() => signOut()}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  <div className="pl-2 border-l border-slate-200/80">
                    {onSignInClick ? (
                      <button 
                        onClick={onSignInClick}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-slate-900/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
                      >
                        <User className="w-4 h-4 text-teal-400" />
                        Sign In
                      </button>
                    ) : (
                      <Link 
                        href="/products" 
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-slate-900/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
                      >
                        <User className="w-4 h-4 text-teal-400" />
                        Sign In
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 top-[72px] bg-white/95 backdrop-blur-xl">
          <div className="flex flex-col p-6 gap-6 h-full">
            <nav className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`text-lg font-bold p-3 rounded-xl ${
                    pathname === link.href ? 'bg-teal-50 text-teal-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-slate-200 my-2"></div>
              
              <Link 
                href="/wishlist" 
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between text-lg font-bold p-3 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Wishlist
                </div>
                {wishlist.length > 0 && (
                  <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/cart" 
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between text-lg font-bold p-3 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-teal-600" />
                  Cart
                </div>
                {cart.length > 0 && (
                  <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs">
                    {cart.length}
                  </span>
                )}
              </Link>
            </nav>

            <div className="mt-auto pb-8">
              {isSignedIn ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold uppercase">
                      {user?.name ? user.name.substring(0, 2) : 'US'}
                    </div>
                    <div className="font-bold text-slate-800">{user?.name || 'User'}</div>
                  </div>
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMobileOpen(false);
                    }}
                    className="p-2 text-rose-600 bg-rose-50 rounded-xl"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {onSignInClick ? (
                    <button 
                      onClick={() => {
                        onSignInClick();
                        setIsMobileOpen(false);
                      }}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Sign In
                    </button>
                  ) : (
                    <Link 
                      href="/products"
                      onClick={() => setIsMobileOpen(false)}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
