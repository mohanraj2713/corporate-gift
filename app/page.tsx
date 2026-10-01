'use client';

import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';
import StoreNavbar from '@/components/StoreNavbar';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect } from 'react';

export default function PublicDashboardPage() {
  const { isSignedIn, signOut, wishlist, recentlyViewed, addRecentlyViewed, cart, toggleWishlist, toggleCart } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/gifts').then(r => r.json()).then(data => setProducts(data)).catch(console.error);
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <StoreNavbar />

      <main className="pb-16">
        {/* Banner Area */}
        <section className="bg-teal-700 text-white py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Premium Custom Printing & Gifting</h1>
            <p className="text-teal-100 text-lg mb-8">Design and print stunning T-Shirts, Mugs, Business Cards, and Corporate Gifts.</p>
            <Link href="/products" className="bg-white text-teal-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-teal-50 transition-colors text-lg">
              Shop Now
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Shop by Category</h2>
          <div className="flex flex-wrap gap-8 justify-center">
            {(categories.length > 0 ? categories : [{name: 'Apparel'}, {name: 'Accessories'}]).map((catObj, i) => {
              const catName = typeof catObj === 'string' ? catObj : (catObj.name || 'Uncategorized');
              return (
              <Link href={`/products?category=${catName}`} key={catName} className="group flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-slate-100 shadow-sm group-hover:border-teal-500 group-hover:shadow-md transition-all flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                </div>
                <h3 className="font-bold text-slate-700 text-sm text-center max-w-[120px] leading-tight group-hover:text-teal-700 transition-colors">{catName}</h3>
              </Link>
            ) })}
          </div>
        </section>

        {/* Your Wishlist Section */}
        {isSignedIn && wishlist.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">From Your Wishlist</h2>
              <Link href="/wishlist" className="text-teal-600 font-bold hover:underline">View All</Link>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {wishlist.map(itemId => {
                const item = products.find(p => (p._id || p.id) === itemId) || { name: 'Premium Item ' + itemId, price: 49.00 };
                return (
                  <div key={itemId} className="shrink-0 w-64 snap-start">
                  <ProductCard
                    item={item}
                    isWishlisted={wishlist.includes(itemId)}
                    isInCart={cart.includes(itemId)}
                    onWishlistClick={toggleWishlist}
                    onCartClick={toggleCart}
                    onClick={addRecentlyViewed}
                  />
                </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recently Checked Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Recently Viewed</h2>
            <Link href="/products" className="text-teal-600 font-bold hover:underline">View All</Link>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {(recentlyViewed.length > 0 ? recentlyViewed : []).map(itemId => {
              const item = products.find(p => (p._id || p.id) === itemId) || { _id: itemId, name: 'Product ' + itemId, price: 49 };
              return (
                <div key={item._id || item.id} className="shrink-0 w-64 snap-start">
                <ProductCard
                  item={item}
                  isWishlisted={wishlist.includes(item._id || item.id)}
                  isInCart={cart.includes(item._id || item.id)}
                  onWishlistClick={toggleWishlist}
                  onCartClick={toggleCart}
                  onClick={addRecentlyViewed}
                />
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 font-medium">
          &copy; 2026 PrintoStyle Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
