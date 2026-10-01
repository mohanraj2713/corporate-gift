'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';
import StoreNavbar from '@/components/StoreNavbar';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { cart, toggleCart, wishlist, toggleWishlist, recentlyViewed, addRecentlyViewed } = useStore();
  
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch('/api/gifts')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        const p = data.find((item: any) => (item._id || item.id) === id);
        if (p) {
          setProduct(p);
          addRecentlyViewed(id);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <StoreNavbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Product Not Found</h1>
          <p className="text-slate-500 mb-8">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push('/products')} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isInCart = cart.includes(id);
  const isWishlisted = wishlist.includes(id);

  // Generate a mock array of images for the gallery since our DB likely only has one.
  const galleryImages = [
    product.imageUrl,
    product.imageUrl, // In a real app, these would be different URLs
    product.imageUrl,
    product.imageUrl,
  ];

  // Recently viewed products to display
  const recentProducts = recentlyViewed
    .filter(recentId => recentId !== id) // Exclude current product
    .map(recentId => allProducts.find(p => (p._id || p.id) === recentId))
    .filter(Boolean); // Remove undefined

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <StoreNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Product Top Section */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            
            {/* Main Image */}
            <div className="w-full aspect-square relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-soft-sm group">
              {galleryImages[activeImage] ? (
                <img 
                  src={galleryImages[activeImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">No Image Available</div>
              )}
            </div>

            {/* Thumbnail Scroll (Below Main Image) */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {galleryImages.map((imgUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 aspect-square shrink-0 rounded-2xl overflow-hidden transition-all ${
                    activeImage === idx 
                      ? 'ring-2 ring-teal-500 ring-offset-2 opacity-100' 
                      : 'border border-slate-200 opacity-60 hover:opacity-100 hover:border-teal-300'
                  }`}
                >
                  {imgUrl ? (
                    <img src={imgUrl} alt={`${product.name} thumbnail ${idx+1}`} className="w-full h-full object-cover bg-white" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">No Img</div>
                  )}
                </button>
              ))}
            </div>
            
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 flex flex-col py-2 lg:py-6">
            <div className="mb-2">
              <span className="text-teal-600 font-bold text-sm tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full">
                {product.category || 'Premium Gift'}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                ${Number(product.price || 49).toFixed(2)}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-slate-400 line-through font-medium mb-1.5">
                  ${Number(product.oldPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="prose prose-slate prose-lg mb-10">
              <p className="text-slate-600 leading-relaxed">
                {product.description || "Elevate your gifting experience with this premium product. Designed with attention to detail and crafted from high-quality materials, this item makes a perfect corporate gift or personal reward."}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (!isInCart) toggleCart(id);
                    router.push('/cart');
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 transition-all duration-300 bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/40 hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {isInCart ? 'Continue to Checkout' : 'Add to Cart'}
                </button>
                <button 
                  onClick={() => toggleWishlist(id)}
                  className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 hover:-translate-y-0.5 ${
                    isWishlisted 
                      ? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/25' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-lg'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-7 h-7 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                <div className="flex flex-col items-center text-center gap-3 text-slate-600 group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 text-slate-600 group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">1 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 text-slate-600 group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">30-Day Returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Below: Recent History / Suggestions */}
        {recentProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Recently Viewed</h2>
              <button onClick={() => router.push('/products')} className="text-teal-600 font-bold hover:underline">
                View All Products
              </button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
              {recentProducts.map((item: any) => (
                <div key={item._id || item.id} className="shrink-0 w-64 snap-start h-full">
                  <ProductCard
                    item={item}
                    isWishlisted={wishlist.includes(item._id || item.id)}
                    isInCart={cart.includes(item._id || item.id)}
                    onWishlistClick={toggleWishlist}
                    onCartClick={toggleCart}
                    onClick={(pid) => router.push(`/products/${pid}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
