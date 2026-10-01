'use client';

import Link from 'next/link';
import { useStore } from '@/components/StoreProvider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import StoreNavbar from '@/components/StoreNavbar';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, cart, toggleCart, isSignedIn, signOut } = useStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/gifts').then(r => r.json()).then(data => setProducts(data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <StoreNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Your Wishlist</h1>
          <Link href="/products" className="text-teal-600 font-bold hover:underline">
            Continue Shopping
          </Link>
        </div>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your wishlist is empty</h2>
            <Link href="/products" className="text-teal-600 font-bold hover:underline">
              Start adding some products!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map(itemId => {
              const item = products.find(p => (p._id || p.id) === itemId) || { _id: itemId, name: 'Premium Item', price: 49 };
              return (
                <ProductCard
                key={itemId}
                item={item}
                isWishlisted={true}
                isInCart={cart.includes(itemId)}
                onWishlistClick={toggleWishlist}
                onCartClick={(id) => {
                  if (!cart.includes(id)) toggleCart(id);
                  toggleWishlist(id);
                  router.push('/cart');
                }}
                onClick={(id) => router.push(`/products/${id}`)}
              />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
