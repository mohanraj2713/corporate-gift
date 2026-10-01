'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/components/StoreProvider';
import StoreNavbar from '@/components/StoreNavbar';
import ProductCard from '@/components/ProductCard';
import { Check, Filter, Tags, DollarSign, X } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, signIn, signOut, wishlist, toggleWishlist, addRecentlyViewed, cart, toggleCart } = useStore();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'wishlist' | 'buy' | null>(null);
  const [pendingItemId, setPendingItemId] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortOption, setSortOption] = useState<string>('Featured');
  
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  
  const filteredProducts = products.filter(p => {
    const pPrice = Number(p.price || 49);
    if (pPrice > maxPrice) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === 'Price: Low to High') return Number(a.price || 49) - Number(b.price || 49);
    if (sortOption === 'Price: High to Low') return Number(b.price || 49) - Number(a.price || 49);
    return 0;
  });
  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/gifts').then(r => r.json()).then(data => setProducts(data)).catch(console.error);
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data)).catch(console.error);
  }, []);

  const handleWishlistClick = (itemId: string) => {
    if (!isSignedIn) {
      setPendingAction('wishlist');
      setPendingItemId(itemId);
      setShowSignInModal(true);
      return;
    }
    toggleWishlist(itemId);
  };

  const handleSignIn = async () => {
    setSignInError('');
    const success = await signIn(email, password);
    if (!success) {
      setSignInError('Invalid credentials');
      return;
    }
    
    setShowSignInModal(false);
    
    if (pendingAction === 'wishlist' && pendingItemId !== null) {
      toggleWishlist(pendingItemId);
    } else if (pendingAction === 'buy') {
      if (pendingItemId !== null && !cart.includes(pendingItemId)) {
        toggleCart(pendingItemId);
      }
      router.push('/cart');
    }
    setPendingAction(null);
    setPendingItemId(null);
    setEmail('');
    setPassword('');
  };

  const handleAddToCart = (itemId: string) => {
    if (!isSignedIn) {
      setPendingAction('buy');
      setPendingItemId(itemId);
      setShowSignInModal(true);
      return;
    }
    if (!cart.includes(itemId)) {
      toggleCart(itemId);
    }
    // Don't route to checkout, let them keep shopping
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans relative">
      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">Sign In Required</h2>
            <p className="text-slate-600 mb-6 text-center">Please sign in to add items to your wishlist or checkout.</p>
            
            <div className="space-y-4 mb-6">
              {signInError && <p className="text-rose-500 text-sm font-bold text-center">{signInError}</p>}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <button 
              onClick={handleSignIn}
              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      <StoreNavbar onSignInClick={() => setShowSignInModal(true)} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex gap-8">
        
        {/* Left Sidebar Filter */}
        <aside className="w-1/4 shrink-0 hidden md:block">
          <div className="sticky top-28 pr-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-600" />
                Filters
              </h3>
              {(selectedCategories.length > 0 || maxPrice < 1000) && (
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setMaxPrice(1000);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>
            
            {/* Categories Filter */}
            <div className="mb-8">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                <Tags className="w-4 h-4 text-slate-400" />
                Categories
              </h4>
              <div className="space-y-3">
                {(categories.length > 0 ? categories : [{name: 'T-Shirts'}, {name: 'Mugs'}]).map(catObj => {
                  const catName = typeof catObj === 'string' ? catObj : (catObj.name || 'Uncategorized');
                  const isSelected = selectedCategories.includes(catName);
                  return (
                    <label 
                      key={catName} 
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 border ${
                        isSelected 
                          ? 'bg-teal-600 border-teal-600 shadow-sm shadow-teal-500/30' 
                          : 'bg-slate-50 border-slate-200 group-hover:border-teal-400'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleCategory(catName)} 
                        className="hidden" 
                      />
                      <span className={`text-sm font-medium transition-colors ${
                        isSelected ? 'text-teal-800 font-bold' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {catName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-slate-400" />
                Price Range
              </h4>
              
              <div className="mb-6 relative pt-2">
                <input 
                  type="range" 
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 transition-all" 
                  min="0" 
                  max="1000" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-1 w-20">
                  <span className="text-slate-400 font-bold text-sm">$</span>
                  <span className="text-slate-700 font-bold text-sm">0</span>
                </div>
                <div className="text-slate-400 font-bold text-xs">to</div>
                <div className="bg-white border border-teal-200 ring-2 ring-teal-50 rounded-xl px-3 py-2 flex items-center gap-1 w-20 justify-end">
                  <span className="text-teal-600 font-bold text-sm">$</span>
                  <span className="text-teal-700 font-bold text-sm">{maxPrice}</span>
                </div>
              </div>
            </div>
            
          </div>
        </aside>

        {/* Right Side Products */}
        <div className="w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">All Products</h2>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border border-slate-300 rounded-lg px-4 py-2 text-slate-600 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredProducts.length > 0 ? filteredProducts : []).map(item => {
              const isWishlisted = wishlist.includes(item._id || item.id);
              return (
                <ProductCard
                  key={item._id || item.id}
                  item={item}
                  isWishlisted={isWishlisted}
                  isInCart={cart.includes(item._id || item.id)}
                  onWishlistClick={handleWishlistClick}
                  onCartClick={handleAddToCart}
                  onClick={addRecentlyViewed}
                />
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
