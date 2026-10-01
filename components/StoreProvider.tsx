'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type StoreContextType = {
  isSignedIn: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  cart: string[];
  toggleCart: (id: string) => void;
  clearCart: () => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  requireSignIn: (action: () => void) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Global Sign In Modal State
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  const requireSignIn = (action: () => void) => {
    if (isSignedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setShowSignInModal(true);
    }
  };

  const handleGlobalSignIn = async () => {
    setSignInError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSignedIn(true);
        setUser(data.user);
        localStorage.setItem('printo_user', JSON.stringify(data.user));
        
        setShowSignInModal(false);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        
        // Fetch fresh data
        fetch(`/api/wishlist?userId=${data.user._id}`).then(r => r.json()).then(d => setWishlist(d.items || []));
        fetch(`/api/cart?userId=${data.user._id}`).then(r => r.json()).then(d => setCart(d.items || []));
        fetch(`/api/recently-viewed?userId=${data.user._id}`).then(r => r.json()).then(d => setRecentlyViewed(d.items || []));
      } else {
        setSignInError('Invalid credentials');
      }
    } catch(e) {
      setSignInError('Invalid credentials');
    }
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('printo_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsSignedIn(true);
        // Fetch from MongoDB
        fetch(`/api/wishlist?userId=${parsedUser._id}`)
          .then(res => res.json())
          .then(data => setWishlist(data.items || []));
        fetch(`/api/cart?userId=${parsedUser._id}`)
          .then(res => res.json())
          .then(data => setCart(data.items || []));
        fetch(`/api/recently-viewed?userId=${parsedUser._id}`)
          .then(res => res.json())
          .then(data => setRecentlyViewed(data.items || []));
      } catch (e) {}
    } else {
      // Load from local storage for anonymous users
      const savedWishlist = localStorage.getItem('printo_wishlist');
      if (savedWishlist) {
        try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
      }
      const savedCart = localStorage.getItem('printo_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) {}
      }
      const savedRecent = localStorage.getItem('printo_recent');
      if (savedRecent) {
        try { setRecentlyViewed(JSON.parse(savedRecent)); } catch (e) {}
      }
    }
    setIsInitialized(true);
  }, []);

  // Save anonymous state to localStorage
  useEffect(() => {
    if (!isInitialized || isSignedIn) return; // DB handles signed-in state
    localStorage.setItem('printo_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('printo_cart', JSON.stringify(cart));
    localStorage.setItem('printo_recent', JSON.stringify(recentlyViewed));
  }, [wishlist, cart, recentlyViewed, isSignedIn, isInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsSignedIn(true);
        localStorage.setItem('printo_user', JSON.stringify(data.user));
        
        // Fetch their lists
        fetch(`/api/wishlist?userId=${data.user._id}`)
          .then(r => r.json())
          .then(d => setWishlist(d.items || []));
        fetch(`/api/cart?userId=${data.user._id}`)
          .then(r => r.json())
          .then(d => setCart(d.items || []));
        fetch(`/api/recently-viewed?userId=${data.user._id}`)
          .then(r => r.json())
          .then(d => setRecentlyViewed(d.items || []));
        return true;
      }
      return false;
    } catch(e) {
      return false;
    }
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUser(null);
    localStorage.removeItem('printo_user');
    setWishlist([]);
    setCart([]);
    setRecentlyViewed([]);
  };

  const toggleWishlist = (id: string) => {
    const isAdding = !wishlist.includes(id);
    setWishlist(prev => 
      isAdding ? [...prev, id] : prev.filter(item => item !== id)
    );

    if (isSignedIn && user) {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, itemId: id, action: isAdding ? 'add' : 'remove' })
      }).catch(console.error);
    }
  };

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item !== id);
      const updated = [id, ...filtered].slice(0, 5);
      return updated;
    });

    if (isSignedIn && user) {
      fetch('/api/recently-viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, itemId: id })
      }).catch(console.error);
    }
  };

  const toggleCart = (id: string) => {
    requireSignIn(() => {
      const isAdding = !cart.includes(id);
    setCart(prev => 
      isAdding ? [...prev, id] : prev.filter(item => item !== id)
    );

    if (isSignedIn && user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, itemId: id, action: isAdding ? 'add' : 'remove' })
      }).catch(console.error);
    }
    });
  };

  const clearCart = () => {
    setCart([]);
    if (isSignedIn && user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, itemId: 'all', action: 'clear' })
      }).catch(console.error);
    }
  };

  return (
    <StoreContext.Provider value={{ isSignedIn, user, signIn, signOut, wishlist, toggleWishlist, cart, toggleCart, clearCart, recentlyViewed, addRecentlyViewed, requireSignIn }}>
      {children}
      
      {/* Global Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => { setShowSignInModal(false); setPendingAction(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">Sign In Required</h2>
            <p className="text-slate-600 mb-6 text-center">Please sign in to add items to your cart or checkout.</p>
            
            <div className="space-y-4 mb-6">
              {signInError && <p className="text-rose-500 text-sm font-bold text-center">{signInError}</p>}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <button 
              onClick={handleGlobalSignIn}
              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
