import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Check, Image as ImageIcon } from 'lucide-react';

interface ProductCardProps {
  item: any;
  isWishlisted: boolean;
  isInCart: boolean;
  onWishlistClick: (id: string) => void;
  onCartClick: (id: string) => void;
  onClick: (id: string) => void;
}

export default function ProductCard({
  item,
  isWishlisted,
  isInCart,
  onWishlistClick,
  onCartClick,
  onClick,
}: ProductCardProps) {
  const itemId = item._id || item.id;
  
  return (
    <Link 
      href={`/products/${itemId}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 cursor-pointer h-full"
      onClick={() => onClick(itemId)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br', 'from-slate-100', 'to-slate-200');
              const fallback = document.createElement('div');
              fallback.className = 'text-slate-400 flex flex-col items-center gap-2 font-medium';
              fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span>No Image</span>';
              e.currentTarget.parentElement?.appendChild(fallback);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100 font-medium">
            <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        {/* Wishlist Button - Always visible on mobile, visible on hover for desktop */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistClick(itemId);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm z-10 
            ${isWishlisted 
              ? 'bg-rose-500/90 text-white shadow-rose-500/25 hover:bg-rose-600' 
              : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white md:opacity-0 md:-translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
            }
          `}
        >
          <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10 hidden md:block">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCartClick(itemId);
            }}
            className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-colors ${
              isInCart 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-white/95 backdrop-blur-md text-teal-700 hover:bg-teal-600 hover:text-white'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        <h3 className="font-bold text-slate-800 text-base leading-tight mb-2 group-hover:text-teal-700 transition-colors line-clamp-2 flex-1">
          {item.name}
        </h3>
        
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {item.oldPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ${Number(item.oldPrice).toFixed(2)}
              </span>
            )}
            <span className="text-teal-600 font-black text-lg">
              ${Number(item.price || 49).toFixed(2)}
            </span>
          </div>

          {/* Mobile Add to cart (visible only on small screens) */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCartClick(itemId);
            }}
            className={`md:hidden p-2.5 rounded-xl flex items-center justify-center transition-colors ${
              isInCart 
                ? 'bg-slate-900 text-white' 
                : 'bg-teal-50 text-teal-700'
            }`}
          >
            {isInCart ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </Link>
  );
}
