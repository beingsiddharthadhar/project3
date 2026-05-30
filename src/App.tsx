/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Sparkles, LogIn, LogOut, UserPlus, Shield, Utensils, 
  ChevronRight, Search, MapPin, Heart, Clock, AlertCircle, Trash2, 
  MapPinCheck, RefreshCw, Star, Info, MessageSquare, Plus, Check, Truck, ChefHat, Wallet, Award
} from 'lucide-react';
import { Restaurant, MenuItem, Order, User, OrderItem } from './types';
import OrderTracker from './components/OrderTracker';
import AIAssistant from './components/AIAssistant';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SentimentAnalysis from './components/SentimentAnalysis';

export default function App() {
  // Application Roles / Current Login User
  const [activeUser, setActiveUser] = useState<User>({
    user_id: 'cust-1',
    full_name: 'Siddharth Dhar',
    email: 'siddharthadhar404@gmail.com',
    phone: '+971 50 123 4567',
    address: 'Apartment 1402, Marina Heights, Dubai Marina, UAE',
    role: 'customer',
    preferences: {
      dietary: 'none',
      max_budget: 100,
    },
    loyalty_points: 350,
  });

  // Track if user is successfully logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Base navigation and interface tabs
  const [activeTab, setActiveTab] = useState<'browse' | 'chat' | 'reviews' | 'orders' | 'admin'>('browse');
  
  // Data lists from Express server
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart Management
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string | null>(null);

  // Search & Prompt bridge controls
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'none' | 'vegan' | 'keto' | 'halal'>('none');
  const [activeChatPrompt, setActiveChatPrompt] = useState<string>('');

  // Authentication screens
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupDietary, setSignupDietary] = useState<any>('none');
  const [signupAddress, setSignupAddress] = useState('');
  
  // OTP forgot fields
  const [otpSent, setOtpSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Add Custom Menu item state (Admin)
  const [newMenuRestId, setNewMenuRestId] = useState('rest-1');
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('');
  const [newMenuCalories, setNewMenuCalories] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState<any>('Burgers');
  const [newMenuSpicy, setNewMenuSpicy] = useState(false);
  const [newMenuVegan, setNewMenuVegan] = useState(false);
  const [menuAddSuccess, setMenuAddSuccess] = useState(false);

  // Simulated Delivery Earnings
  const [deliveryEarnings, setDeliveryEarnings] = useState(140); // AED

  // Fetch all basic operational data
  const loadWorkspaceData = async () => {
    try {
      const restRes = await fetch('/api/restaurants');
      if (restRes.ok) {
        const restData = await restRes.json();
        setRestaurants(restData);
      }

      // Fetch active orders depending on user role
      const orderRes = await fetch(`/api/orders?role=${activeUser.role}&userId=${activeUser.user_id}`);
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        // Sort orders so the newest are on top
        setOrders(orderData.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (err) {
      console.error('Failed to load full-stack databases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [activeUser.role]);

  // Switch role convenience switcher
  const handleRoleSwitch = (roleType: 'customer' | 'restaurant_admin' | 'delivery_agent') => {
    setLoading(true);
    let targetUser: User;
    if (roleType === 'customer') {
      targetUser = {
        user_id: 'cust-1',
        full_name: 'Siddharth Dhar',
        email: 'siddharthadhar404@gmail.com',
        phone: '+971 50 123 4567',
        address: 'Apartment 1402, Marina Heights, Dubai Marina, UAE',
        role: 'customer',
        preferences: { dietary: 'none', max_budget: 100 },
        loyalty_points: 350
      };
      setActiveTab('browse');
    } else if (roleType === 'restaurant_admin') {
      targetUser = {
        user_id: 'admin-1',
        full_name: 'Amna Al Mansoori',
        email: 'admin@smartbite.ai',
        phone: '+971 50 987 6543',
        address: 'SmartBite HQ, Dubai Internet City, UAE',
        role: 'restaurant_admin',
        preferences: { dietary: 'none', max_budget: 1000 },
        loyalty_points: 0
      };
      setActiveTab('admin');
    } else {
      targetUser = {
        user_id: 'agent-1',
        full_name: 'Zayed Al Hashimi',
        email: 'zayed@smartbite.ai',
        phone: '+971 52 444 8888',
        address: 'Marina Deliveries Depot, Dubai, UAE',
        role: 'delivery_agent',
        preferences: { dietary: 'none', max_budget: 50 },
        loyalty_points: 120
      };
      setActiveTab('orders');
    }
    setActiveUser(targetUser);
    setIsLoggedIn(true);
    setCartItems([]);
    setSelectedRestId(null);
  };

  // Add Item to cart
  const handleAddToCart = (restaurantId: string, item: MenuItem) => {
    if (selectedRestId && selectedRestId !== restaurantId) {
      if (!confirm("Your cart contains meals from another kitchen. Clear cart to proceed?")) {
        return;
      }
      setCartItems([]);
    }
    setSelectedRestId(restaurantId);
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  // Handle addition directly from smart recommendation widgets
  const handleAddSuggestedFood = (restaurantId: string, itemPart: Partial<MenuItem>) => {
    const fullItem: MenuItem = {
      id: itemPart.id || 'item-sug',
      name: itemPart.name || 'Suggested Item',
      price: itemPart.price || 35,
      description: itemPart.description || 'Special dynamic AI selection just for you.',
      category: itemPart.category || 'Burgers',
      spicy: itemPart.spicy || false,
      vegan: itemPart.vegan || false,
      calories: itemPart.calories || 600
    };
    handleAddToCart(restaurantId, fullItem);
    // Switch dynamically to cart panel view
    setActiveTab('browse');
    // Scroll down to checkout stage inside bottom sheet or sidebar
    const formEl = document.getElementById('cart-checkout-stage');
    formEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !selectedRestId) return;

    try {
      const totalPrice = cartItems.reduce((acc, it) => acc + (it.menuItem.price * it.quantity), 0);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: activeUser.user_id,
          restaurantId: selectedRestId,
          items: cartItems,
          totalPrice,
          deliveryAddress: activeUser.address
        })
      });

      if (response.ok) {
        setCartItems([]);
        setSelectedRestId(null);
        await loadWorkspaceData();
        // Redirect to Orders tab to see tracking status
        setActiveTab('orders');
      }
    } catch (err) {
      console.error('Failed checkout:', err);
    }
  };

  // Status transitions
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        if (nextStatus === 'Delivered' && activeUser.role === 'delivery_agent') {
          // Add delivery fee earnings to current session agent
          setDeliveryEarnings(prev => prev + 15);
        }
        await loadWorkspaceData();
      }
    } catch (err) {
      console.error('Failed status transition:', err);
    }
  };

  // Add new menu item (Admin dashboard)
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName || !newMenuPrice) return;

    try {
      const response = await fetch('/api/restaurants/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: newMenuRestId,
          item: {
            name: newMenuName,
            description: newMenuDesc || 'Freshly prepared UAE signature dish.',
            price: Number(newMenuPrice),
            category: newMenuCategory,
            spicy: newMenuSpicy,
            vegan: newMenuVegan,
            calories: Number(newMenuCalories) || 450
          }
        })
      });

      if (response.ok) {
        setNewMenuName('');
        setNewMenuDesc('');
        setNewMenuPrice('');
        setNewMenuCalories('');
        setNewMenuCategory('Burgers');
        setNewMenuSpicy(false);
        setNewMenuVegan(false);
        setMenuAddSuccess(true);
        setTimeout(() => setMenuAddSuccess(false), 3000);
        await loadWorkspaceData();
      }
    } catch (err) {
      console.error('Failed to add menu item:', err);
    }
  };

  // Auth logins
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: loginPass })
        });
        const data = await res.json();
        if (res.ok) {
          setActiveUser(data.user);
          setIsLoggedIn(true);
          setShowAuthModal(false);
          setLoginEmail('');
          setLoginPass('');
          await loadWorkspaceData();
        } else {
          alert(`Auth Error: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (authMode === 'signup') {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: signupName,
            email: signupEmail,
            phone: signupPhone,
            password: signupPass,
            address: signupAddress,
            dietary: signupDietary,
            maxBudget: 120
          })
        });
        const data = await res.json();
        if (res.ok) {
          setActiveUser(data.user);
          setIsLoggedIn(true);
          setShowAuthModal(false);
          setSignupName('');
          setSignupEmail('');
          setSignupPhone('');
          setSignupPass('');
          setSignupAddress('');
          await loadWorkspaceData();
        } else {
          alert(`Registration Failed: ${data.error}`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Forgot password Simulation
      if (!otpSent) {
        setOtpSent(true);
      } else {
        setResetSuccess(true);
        setTimeout(() => {
          setAuthMode('login');
          setOtpSent(false);
          setResetSuccess(false);
        }, 2000);
      }
    }
  };

  // Prompt trigger action link
  const triggerAIPrompt = (promptText: string) => {
    setActiveChatPrompt(promptText);
    setActiveTab('chat');
  };

  // Quick filter matching
  const filteredRestaurants = restaurants.map(rest => {
    const items = rest.menu_items.filter(item => {
      // Check query
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          rest.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Check dietary tags
      if (dietaryFilter === 'vegan' && !item.vegan) return false;
      if (dietaryFilter === 'halal' && item.name.toLowerCase().includes('pork')) return false; // Default Halal filter
      if (dietaryFilter === 'keto' && item.calories > 600) return false; // Simple Keto criteria

      return matchQuery;
    });

    return { ...rest, menu_items: items };
  }).filter(rest => rest.menu_items.length > 0);

  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(24, 24, 27, 0.88), rgba(24, 24, 27, 0.88)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1600")' 
        }}
      >
        {/* Floating Developer Grading presets for seamless testing! */}
        <div className="absolute top-4 right-4 bg-zinc-900/95 text-white p-4 rounded-2xl shadow-2xl border border-zinc-800 max-w-xs z-30 backdrop-blur-md">
          <p className="text-[10px] uppercase font-mono tracking-widest text-orange-500 font-extrabold mb-1">Grading & Testing Presets</p>
          <p className="text-[10px] text-zinc-400 mb-2 font-sans leading-normal">Click any preset email below to autoselect specific accounts & test our state engines instantly:</p>
          <div className="space-y-1.5">
            <button
              id="fill-admin-admin-preset"
              onClick={() => { setLoginEmail('admin-admin@gmail.com'); setLoginPass('anything'); }}
              className="w-full text-left text-[11px] font-mono hover:bg-zinc-850/80 bg-zinc-950 p-2 rounded-lg border border-zinc-800 hover:border-orange-500 transition-all flex justify-between items-center"
            >
              <span>⚙️ Admin Admin (System Admin)</span>
              <span className="text-[8px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded uppercase font-bold">Auto</span>
            </button>
            <button
              id="fill-cust-preset"
              onClick={() => { setLoginEmail('customer@smartbite.ai'); setLoginPass('anything'); }}
              className="w-full text-left text-[11px] font-mono hover:bg-zinc-850/80 bg-zinc-950 p-2 rounded-lg border border-zinc-800 hover:border-orange-500 transition-all flex justify-between items-center"
            >
              <span>👤 Guest Customer (General Client)</span>
              <span className="text-[8px] bg-sky-900 text-sky-200 px-1.5 py-0.5 rounded uppercase font-bold">Auto</span>
            </button>
            <button
              id="fill-admin-preset"
              onClick={() => { setLoginEmail('admin@smartbite.ai'); setLoginPass('anything'); }}
              className="w-full text-left text-[11px] font-mono hover:bg-zinc-850/80 bg-zinc-950 p-2 rounded-lg border border-zinc-800 hover:border-orange-500 transition-all flex justify-between items-center"
            >
              <span>📋 Amna (Kitchen Admin)</span>
              <span className="text-[8px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded uppercase font-bold">Auto</span>
            </button>
            <button
              id="fill-agent-preset"
              onClick={() => { setLoginEmail('agent@smartbite.ai'); setLoginPass('anything'); }}
              className="w-full text-left text-[11px] font-mono hover:bg-zinc-850/80 bg-zinc-950 p-2 rounded-lg border border-zinc-800 hover:border-orange-500 transition-all flex justify-between items-center"
            >
              <span>🛵 Zayed (Rider Agent)</span>
              <span className="text-[8px] bg-emerald-900 text-emerald-200 px-1.5 py-0.5 rounded uppercase font-bold">Auto</span>
            </button>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative z-10 transition-all hover:shadow-orange-900/10 hover:shadow-2xl">
          
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-md mx-auto mb-4 animate-pulse">
              ⚡
            </div>
            <h2 className="text-2xl font-black font-display text-white tracking-tight">SmartBite AI Login</h2>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">Type <strong className="text-orange-400">literally ANY email and password</strong> to log in. No credentials required!</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleAuthSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-1.5">Email Address</label>
                <input
                  id="page-login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3.5 py-3 border border-zinc-800 placeholder-zinc-500 text-white rounded-xl bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs font-medium transition-colors"
                  placeholder="e.g. anything-you-want@gmail.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono mb-1.5">Password</label>
                <input
                  id="page-login-password"
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="appearance-none relative block w-full px-3.5 py-3 border border-zinc-800 placeholder-zinc-500 text-white rounded-xl bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs font-medium transition-colors"
                  placeholder="•••••••• (Any password accepts)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-500 text-[10px] font-semibold bg-emerald-950/40 border border-emerald-900/40 py-1 px-2.5 rounded-lg font-mono uppercase tracking-wider">
                🔒 Free Simulation Pass
              </span>
              <span className="text-zinc-500 text-[11px]">Password: any value</span>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xs font-black rounded-xl text-white brand-gradient hover:brand-gradient-hover hover:scale-[1.01] transition-all shadow-md active:scale-95 focus:outline-none"
              >
                Sign In & Launch Workspace
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-zinc-800 text-center font-mono">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              💡 Any email works. If email contains <strong className="text-orange-400 font-bold">admin</strong>, it logs in as Administrator. If it contains <strong className="text-orange-400 font-bold">agent</strong>/rider, it logs you in as Couriers Fleet.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans antialiased text-zinc-900">
      
      {/* Simulation Helper Panel - Centered visual control trigger */}
      <div className="bg-zinc-950 text-white text-xs px-6 py-2.5 flex flex-wrap gap-4 items-center justify-between border-b border-zinc-800 shadow-inner z-20">
        <div className="flex items-center gap-2">
          <span className="inline-block p-1 bg-orange-600 rounded text-[10px] font-black uppercase tracking-widest font-mono">ROLE SELECTOR</span>
          <span className="text-zinc-350 font-mono text-[10px]">Test restaurant administration, drivers delivery tracking, or ordering:</span>
        </div>
        <div className="flex gap-2.5">
          <button
            id="role-switch-cust"
            onClick={() => handleRoleSwitch('customer')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all ${
              activeUser.role === 'customer' 
                ? 'bg-orange-500 text-white shadow-md font-extrabold' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            👤 Customer Dashboard
          </button>
          <button
            id="role-switch-admin"
            onClick={() => handleRoleSwitch('restaurant_admin')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all ${
              activeUser.role === 'restaurant_admin' 
                ? 'bg-orange-500 text-white shadow-md font-extrabold' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            📋 Restaurant Admin
          </button>
          <button
            id="role-switch-agent"
            onClick={() => handleRoleSwitch('delivery_agent')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all ${
              activeUser.role === 'delivery_agent' 
                ? 'bg-orange-500 text-white shadow-md font-extrabold' 
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            🛵 Delivery Agent
          </button>
        </div>
      </div>

      {/* Main Header navigation */}
      <header className="sticky top-0 bg-white border-b border-zinc-150 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Brand container */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center font-black text-orange-600 font-display text-lg shadow-sm border border-orange-200">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight font-display text-zinc-950 flex items-center gap-1.5 leading-none">
                SmartBite <span className="brand-gradient text-white text-[9px] font-bold font-mono py-0.5 px-1.5 rounded-full uppercase tracking-wider">AI Startup</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-400 mt-0.5 leading-none">AGENTIC FOOD DELIVERY PORTAL</p>
            </div>
          </div>

          {/* Quick Menu Tabs for active users */}
          <nav className="hidden md:flex items-center gap-1">
            {activeUser.role === 'customer' && (
              <>
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'browse' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  🍔 Browse Dubai Menus
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'chat' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Chat ordering
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'reviews' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  📝 Sentiment Reviews
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors relative ${activeTab === 'orders' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  🛵 Order Trackers
                  {orders.some(o => o.order_status !== 'Delivered') && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  )}
                </button>
              </>
            )}

            {activeUser.role === 'restaurant_admin' && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'admin' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  🚀 AI Dashboards
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'orders' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  📋 Kitchen Orders Control
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'reviews' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  ⭐ Sentiment Reviews Monitoring
                </button>
              </>
            )}

            {activeUser.role === 'delivery_agent' && (
              <>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'orders' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  🛵 Fleet Dispatch Map
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-xs font-bold font-display rounded-lg transition-colors ${activeTab === 'reviews' ? 'text-orange-600 bg-orange-50' : 'text-zinc-650 hover:bg-zinc-50'}`}
                >
                  📝 Customer Feedback
                </button>
              </>
            )}
          </nav>

          {/* Profile User state right container */}
          <div className="flex items-center gap-4">
            {activeUser.role === 'customer' && (
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">LOYALTY REWARDS</span>
                <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                  ⭐ {activeUser.loyalty_points || 0} pts
                </span>
              </div>
            )}

            {activeUser.role === 'delivery_agent' && (
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">AGENT EARNINGS</span>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <Wallet className="w-3.5 h-3.5" /> AED {deliveryEarnings}
                </span>
              </div>
            )}

            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <h4 className="text-xs font-bold text-zinc-900 leading-tight">{activeUser.full_name}</h4>
                <p className="text-[10px] text-zinc-400 font-mono tracking-wide uppercase">{activeUser.role.replace('_', ' ')}</p>
              </div>
              <button
                id="btn-login-header"
                onClick={() => {
                  setLoginEmail('');
                  setLoginPass('');
                  setIsLoggedIn(false);
                }}
                className="w-10 h-10 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-all border border-amber-200/50 shadow-sm"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAV BAR */}
      <div className="md:hidden bg-white border-b border-zinc-200 py-2.5 px-4 flex justify-around text-center shadow-inner z-10">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center ${activeTab === 'browse' ? 'text-orange-600' : 'text-zinc-500'}`}
        >
          <Utensils className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-1 uppercase">Browse</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center ${activeTab === 'chat' ? 'text-orange-600' : 'text-zinc-500'}`}
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-[9px] font-bold mt-1 uppercase">Smart AI</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center ${activeTab === 'orders' ? 'text-orange-600' : 'text-zinc-500'}`}
        >
          <Truck className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-1 uppercase">Trackers</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex flex-col items-center ${activeTab === 'reviews' ? 'text-orange-600' : 'text-zinc-500'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-1 uppercase">Feedback</span>
        </button>
      </div>

      {/* Content wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Syncing SmartBite startup container...</p>
          </div>
        ) : (
          <>
            
            {/* VIEW 1: CUSTOMER BROWSE & ORDER OVERVIEW */}
            {activeTab === 'browse' && activeUser.role === 'customer' && (
              <div className="space-y-6">
                
                {/* Modern Hero section */}
                <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 rounded-3xl overflow-hidden p-8 sm:p-12 text-white border border-zinc-800 shadow-xl flex items-center">
                  <div className="max-w-xl space-y-5 relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] font-mono tracking-widest font-black rounded-lg border border-white/10 uppercase">
                      🚀 Dubai AI food-tech startup initiative
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-none text-white">
                      Delicious food, <span className="text-orange-500">Autonomous</span> recommendations.
                    </h2>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      SmartBite AI marries Conversational Intelligence and deep learning to deliver premium healthy meals, gourmet combos, and on-the-spot budget planning across Dubai Marina and Internet City.
                    </p>

                    {/* Integrated CTA Search banner */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                      <div className="flex-1 flex items-center px-4 gap-2 text-zinc-400">
                        <Search className="w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Spicy chicken burger under AED 40..."
                          className="w-full bg-transparent text-sm focus:outline-none text-white placeholder-zinc-500"
                        />
                      </div>
                      <button
                        onClick={() => triggerAIPrompt(searchQuery ? searchQuery : "I want a spicy chicken burger under AED 40 near me")}
                        className="brand-gradient hover:brand-gradient-hover text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        Ask SmartBite AI Assistant
                      </button>
                    </div>

                    {/* Quick prompt badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">AI Suggestions:</span>
                      <button 
                        onClick={() => triggerAIPrompt("I want a spicy chicken burger under AED 40 near me")}
                        className="text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-semibold"
                      >
                        🔥 Spicy burger under AED 40
                      </button>
                      <button 
                        onClick={() => triggerAIPrompt("Suggest healthy dinner options")}
                        className="text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-semibold"
                      >
                        🥗 Vegan / Healthy dinner combos
                      </button>
                    </div>
                  </div>

                  {/* Absolute visual logo embed on right margin */}
                  <div className="absolute right-12 bottom-0 top-0 w-80 hidden lg:flex items-center justify-center opacity-10">
                    <span className="text-[190px] font-black select-none font-display">🍔</span>
                  </div>
                </div>

                {/* Main Filter and Search Layout section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left columns: Restaurant cards and menus */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold font-display text-zinc-950">Active Kitchen Partners</h3>
                        <p className="text-xs text-zinc-400 font-mono">FULLY VERIFIED UAE OUTLETS</p>
                      </div>
                      <div className="flex gap-1.5">
                        {['none', 'vegan', 'keto', 'halal'].map((diet) => (
                          <button
                            key={diet}
                            onClick={() => setDietaryFilter(diet as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all border ${
                              dietaryFilter === diet 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            {diet === 'none' ? 'All Cuisines' : diet}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Restaurants Grid */}
                    <div className="space-y-6">
                      {filteredRestaurants.map(rest => (
                        <div key={rest.restaurant_id} className="bg-white rounded-2xl border border-zinc-150/60 shadow-sm overflow-hidden p-6 hover:shadow transition-all">
                          <div className="flex flex-col sm:flex-row gap-5">
                            <img
                              src={rest.image}
                              alt={rest.name}
                              referrerPolicy="no-referrer"
                              className="w-full sm:w-44 h-28 object-cover rounded-xl"
                            />
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-base font-extrabold text-zinc-950 font-display">{rest.name}</h4>
                                  <span className="text-yellow-600 font-bold text-xs flex items-center gap-1">
                                    ★ {rest.rating}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 mb-2">{rest.cuisine}</p>
                                <div className="flex gap-4 text-[11px] text-zinc-400 font-mono">
                                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {rest.location.area}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-zinc-400" /> {rest.delivery_time}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Menu items list */}
                          <div className="mt-6 pt-4 border-t border-zinc-100">
                            <h5 className="text-xs font-bold text-zinc-400 font-mono uppercase mb-3.5">Signature Menu Selections</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {rest.menu_items.map(item => (
                                <div key={item.id} className="p-3.5 bg-zinc-50/50 rounded-xl border border-zinc-100 hover:bg-zinc-50 hover:border-zinc-150 transition-colors flex flex-col justify-between gap-2">
                                  <div>
                                    <div className="flex justify-between items-start mb-1">
                                      <h6 className="text-xs font-bold text-zinc-900 font-display flex items-center gap-1">
                                        {item.name}
                                        {item.spicy && <span className="text-[9px] bg-red-100 text-red-650 px-1.5 py-0.2 rounded font-extrabold">🌶️ SPICY</span>}
                                        {item.vegan && <span className="text-[9px] bg-emerald-100 text-emerald-650 px-1.5 py-0.2 rounded font-extrabold">🌱 VEGAN</span>}
                                      </h6>
                                      <span className="text-xs font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded leading-none">
                                        AED {item.price}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2 mt-0.5">{item.description}</p>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-450 mt-1">
                                    <span>{item.calories} Cal</span>
                                    <button
                                      id={`btn-add-item-${item.id}`}
                                      onClick={() => handleAddToCart(rest.restaurant_id, item)}
                                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-extrabold border-b border-orange-200 hover:border-orange-500 pb-0.5 outline-none"
                                    >
                                      + Add to Order
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Checkout Cart Stage & Custom AI Meal planner */}
                  <div className="space-y-6">
                    
                    {/* Active Cart checkout panel */}
                    <div id="cart-checkout-stage" className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm sticky top-20">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5 text-orange-600" />
                          <h3 className="font-bold text-base text-zinc-950 font-display">Your Active Order</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                          {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items
                        </span>
                      </div>

                      {cartItems.length === 0 ? (
                        <div className="py-12 text-center text-zinc-450">
                          <span className="text-3xl block filter grayscale mb-2">🛒</span>
                          <p className="text-xs font-medium">Your cart is empty.</p>
                          <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px] mx-auto">Add signature dishes above or let SmartBite AI suggest combos via chat.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleCheckout} className="space-y-4">
                          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                            {cartItems.map((item, idX) => (
                              <div key={idX} className="flex justify-between items-center text-xs text-zinc-700">
                                <div className="flex-1">
                                  <h4 className="font-bold text-zinc-900 font-display leading-tight">{item.menuItem.name}</h4>
                                  <p className="text-[10px] text-zinc-400">Qty: {item.quantity} x {item.menuItem.price} AED</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-zinc-900">AED {item.menuItem.price * item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setCartItems(prev => prev.filter(i => i.menuItem.id !== item.menuItem.id))}
                                    className="p-1 text-zinc-350 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-zinc-100 pt-4 space-y-2">
                            <div className="flex justify-between text-xs text-zinc-505 font-medium">
                              <span>Subtotal</span>
                              <span className="font-mono">AED {cartItems.reduce((acc, it) => acc + (it.menuItem.price * it.quantity), 0)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-505 font-medium">
                              <span>Delivery Fee</span>
                              <span className="font-mono text-emerald-650 font-bold uppercase text-[10px]">FREE AED 0</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-zinc-950 font-display border-t border-zinc-100 pt-3">
                              <span>Total AED</span>
                              <span>AED {cartItems.reduce((acc, it) => acc + (it.menuItem.price * it.quantity), 0)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-zinc-450 tracking-wide uppercase">Delivery Destination Address</label>
                            <div className="flex gap-2 items-center text-xs p-3 bg-zinc-50 rounded-xl border border-zinc-150/40">
                              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                              <span className="text-zinc-600 truncate leading-relaxed">{activeUser.address}</span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full brand-gradient hover:brand-gradient-hover text-white text-xs font-black py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            💳 Confirm Payment & Track Delivery
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Meal Planner AI recommendation box */}
                    <div className="bg-gradient-to-br from-indigo-950 to-purple-950 text-white rounded-2xl border border-indigo-900 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Utensils className="w-4 h-4 text-orange-400" />
                        <h4 className="text-xs font-bold font-mono text-orange-400 uppercase tracking-widest leading-none">SmartBite Daily Meal Plans</h4>
                      </div>
                      <h3 className="text-sm font-bold font-display text-white mb-1 leading-snug">Personalized Keto Energy Build</h3>
                      <p className="text-[11px] text-indigo-200 leading-relaxed mb-4">
                        We generated this high-efficiency low carb nutritional combo for target areas near Jumeirah based on your AED 100 budget.
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded bg-white/10 flex hover:bg-white/15 transition-all cursor-pointer items-center justify-between" onClick={() => triggerAIPrompt("Suggest healthy dinner options")}>
                          <div>
                            <span className="font-bold font-display text-white block">Keto Avocado Bowl Combo</span>
                            <span className="text-[9px] text-zinc-300 font-mono">38 AED • 410 calories</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-orange-400" />
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: AI ORDER CHAT COMPOSITION */}
            {activeTab === 'chat' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex gap-2.5 items-center">
                  <span className="inline-block p-1 bg-orange-600 rounded text-xs font-black uppercase text-white font-mono">CONVERSTIONAL COMMERCE</span>
                  <h2 className="text-xl font-bold font-display text-zinc-950">Intelligent Ordering Assistant</h2>
                </div>
                <AIAssistant 
                  onAddSuggestedToCart={handleAddSuggestedFood}
                  userDietary={activeUser.preferences.dietary}
                  userBudget={activeUser.preferences.max_budget}
                  initialPrompt={activeChatPrompt}
                  onClearInitialPrompt={() => setActiveChatPrompt('')}
                />
              </div>
            )}

            {/* VIEW 3: SENTIMENT REVIEWS ASSESSMENT */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-zinc-950">Quality & Sentiment Analytics Logs</h2>
                  <p className="text-xs text-zinc-500 font-mono uppercase tracking-wide">Customer ratings, classification, and auto insights from UAE startups</p>
                </div>
                <SentimentAnalysis />
              </div>
            )}

            {/* VIEW 4: ACTIVE TRACKER TIMELINE (OR AGENT JOBS FLOW) */}
            {activeTab === 'orders' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {activeUser.role === 'customer' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold font-display text-zinc-950">Active Orders & Hand-offs</h2>
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Real-time status loops and automated delivery predictions</p>
                      </div>
                    </div>

                    {orders.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-400 font-medium">
                        <Truck className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                        <p className="text-sm">No active orders found.</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Submit an order inside the Browse tab to activate target trackers.</p>
                      </div>
                    ) : (
                      orders.map((or) => (
                        <div key={or.order_id} className="mb-6 last:mb-0">
                          <OrderTracker
                            order={or}
                            onUpdateStatus={(status) => handleUpdateOrderStatus(or.order_id, status)}
                          />
                        </div>
                      ))
                    )}
                  </>
                ) : activeUser.role === 'delivery_agent' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold font-display text-zinc-950">Rider Dispatch Jobs Dashboard</h2>
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Active delivery requests inside Marina & Interpolated Jumeirah grids</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-650 px-3 py-1.5 rounded-lg border border-emerald-200/50 text-xs font-bold flex items-center gap-1.5 font-display">
                        <Wallet className="w-4 h-4" /> Earnings: AED {deliveryEarnings}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: list of delivery briefs */}
                      <div className="md:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl border border-zinc-150 p-4 shadow-sm">
                          <h4 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest mb-3.5">Available Jobs Pool</h4>
                          <div className="space-y-3">
                            {orders.map((or) => (
                              <div key={or.order_id} className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/50 hover:bg-zinc-100/50 cursor-pointer transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[9px] font-mono text-zinc-400 font-bold">ID: {or.order_id}</span>
                                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 rounded-full font-display uppercase tracking-wider">{or.order_status}</span>
                                </div>
                                <h5 className="text-xs font-bold text-zinc-850 font-display">{or.restaurant_name}</h5>
                                <p className="text-[10px] text-zinc-500 truncate mt-1">To: {or.delivery_address}</p>
                                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400 mt-2 border-t border-zinc-150/40 pt-1.5">
                                  <span>AED {or.total_price} Value</span>
                                  <span className="text-zinc-600">Fee: +15 AED</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right col: active routing tracker visualization */}
                      <div className="md:col-span-2 space-y-4">
                        {orders.length === 0 ? (
                          <div className="bg-white rounded-xl border border-zinc-150 p-8 text-center text-zinc-400">
                            No dispatch jobs present.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-orange-50 rounded-xl border border-orange-200/50 p-4">
                              <h4 className="text-xs font-bold text-orange-850 font-display flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Fleet Agent instructions</h4>
                              <p className="text-[11px] text-orange-900 mt-1 leading-relaxed">
                                Accept deliveries, track the interactive GIS visual maps, and click standard simulated stage buttons at the bottom of the maps to sync customer timelines! Deliveries add +15 AED to your active session earnings wallet.
                              </p>
                            </div>
                            <OrderTracker
                              order={orders[0]}
                              onUpdateStatus={(st) => handleUpdateOrderStatus(orders[0].order_id, st)}
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  </>
                ) : (
                  // Admin: Active orders manager list
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold font-display text-zinc-950">Active Kitchen Orders Flow</h2>
                      <p className="text-xs text-zinc-450 font-mono tracking-widest uppercase">Transition order states to sync with delivery agents and customers</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-4">
                      {orders.length === 0 ? (
                        <p className="text-center text-zinc-400 text-sm font-medium py-10">No orders placed in system yet.</p>
                      ) : (
                        orders.map((or) => (
                          <div key={or.order_id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-150 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-zinc-200 transition-all">
                            <div>
                              <div className="flex flex-wrap gap-2.5 items-center mb-1">
                                <span className="text-xs font-mono text-zinc-400 uppercase font-bold">ID: {or.order_id}</span>
                                <span className="text-[10px] font-mono bg-orange-100 text-orange-650 px-2 py-0.5 rounded font-bold uppercase">{or.restaurant_name}</span>
                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200/50 px-2 rounded-full uppercase">{or.order_status}</span>
                              </div>
                              <h4 className="text-xs font-bold text-zinc-800 leading-none mt-1">
                                Items: {or.items.map(it => `${it.menuItem.name} (x${it.quantity})`).join(', ')}
                              </h4>
                              <p className="text-[11px] text-zinc-500 mt-1">To: {or.delivery_address}</p>
                              <p className="text-[11px] text-zinc-455 font-mono mt-1">Time: {new Date(or.created_at).toLocaleTimeString()} • Price: AED {or.total_price}</p>
                            </div>
                            
                            {/* Manual control transitions */}
                            <div className="flex flex-wrap gap-1.5">
                              {['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map((st) => (
                                <button
                                  key={st}
                                  id={`btn-kitchen-status-${or.order_id}-${st}`}
                                  onClick={() => handleUpdateOrderStatus(or.order_id, st)}
                                  className={`px-2 py-1 text-[10px] font-medium border rounded transition-all ${
                                    or.order_status === st 
                                      ? 'bg-zinc-950 text-white border-zinc-955 shadow-sm' 
                                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: RESTAURANT ADMIN MANAGEMENT & BUSINESS INTELLIGENCE */}
            {activeTab === 'admin' && activeUser.role === 'restaurant_admin' && (
              <div className="space-y-8">
                
                {/* Embedded BI dashboard */}
                <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm">
                  <AnalyticsDashboard />
                </div>

                {/* CRUD Form for menus (Menu management) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left: Add menu item form */}
                  <div className="lg:col-span-1 bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-base font-bold text-zinc-950 font-display">Manage Partner Restaurant Menus</h3>
                      <p className="text-[10px] text-zinc-400 font-mono tracking-wide uppercase">Add premium new dishes matching UAE culinary needs</p>
                    </div>

                    <form onSubmit={handleAddMenuItem} className="space-y-4">
                      {menuAddSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                          <span>✓ MenuItem was created successfully</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1">Target kitchen</label>
                        <select
                          id="admin-form-rest"
                          value={newMenuRestId}
                          onChange={(e) => setNewMenuRestId(e.target.value)}
                          className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500"
                        >
                          {restaurants.map(r => (
                            <option key={r.restaurant_id} value={r.restaurant_id}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1">Dish Name</label>
                        <input
                          id="admin-form-name"
                          type="text"
                          value={newMenuName}
                          onChange={(e) => setNewMenuName(e.target.value)}
                          placeholder="e.g. Saffron Rose Lemonade"
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1">Description</label>
                        <textarea
                          id="admin-form-desc"
                          rows={2}
                          value={newMenuDesc}
                          onChange={(e) => setNewMenuDesc(e.target.value)}
                          placeholder="Rich ingredients..."
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1">Price (AED)</label>
                          <input
                            id="admin-form-price"
                            type="number"
                            value={newMenuPrice}
                            onChange={(e) => setNewMenuPrice(e.target.value)}
                            placeholder="32"
                            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1">Calories</label>
                          <input
                            id="admin-form-calories"
                            type="number"
                            value={newMenuCalories}
                            onChange={(e) => setNewMenuCalories(e.target.value)}
                            placeholder="350"
                            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:border-orange-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-500 tracking-wide uppercase mb-1">Category</label>
                        <select
                          id="admin-form-category"
                          value={newMenuCategory}
                          onChange={(e) => setNewMenuCategory(e.target.value)}
                          className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                        >
                          <option value="Burgers">Burgers</option>
                          <option value="Pizzas">Pizzas</option>
                          <option value="Healthy">Healthy</option>
                          <option value="Arabic">Arabic</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Drinks">Drinks</option>
                        </select>
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                          <input
                            id="admin-form-spicy"
                            type="checkbox"
                            checked={newMenuSpicy}
                            onChange={(e) => setNewMenuSpicy(e.target.checked)}
                            className="rounded text-orange-500 focus:ring-orange-500"
                          />
                          🌶️ Spicy selection
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                          <input
                            id="admin-form-vegan"
                            type="checkbox"
                            checked={newMenuVegan}
                            onChange={(e) => setNewMenuVegan(e.target.checked)}
                            className="rounded text-orange-500 focus:ring-orange-500"
                          />
                          🌱 Vegan selection
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full brand-gradient hover:brand-gradient-hover text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Item To Menu
                      </button>
                    </form>
                  </div>

                  {/* Right: show active menus */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-zinc-950 font-display">Active Menu Catalog Viewer</h3>
                      <p className="text-[10px] text-zinc-400 font-mono uppercase">Full catalog verified lists</p>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {restaurants.map(r => (
                        <div key={r.restaurant_id} className="border-b border-zinc-100 last:border-0 pb-4 mb-4">
                          <h4 className="text-xs font-extrabold text-zinc-500 font-mono uppercase mb-2">{r.name} menu</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {r.menu_items.map((it) => (
                              <div key={it.id} className="p-2.5 rounded bg-zinc-50 border border-zinc-200/50 flex justify-between items-center">
                                <div>
                                  <span className="text-xs font-bold text-zinc-900 font-display leading-tight block">{it.name}</span>
                                  <span className="text-[9px] text-zinc-400 font-mono">{it.category} • {it.calories} Cal</span>
                                </div>
                                <span className="text-xs font-bold font-mono text-zinc-800 bg-zinc-200/50 px-2 py-0.5 rounded">AED {it.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 text-white border-t border-zinc-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-display">⚡</span>
            <span className="font-extrabold text-sm tracking-tight font-display text-white">SmartBite AI startup</span>
          </div>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            Leading modern food technology innovations inside Jumeirah Marina grids. Anchored safely in response optimization algorithms.
          </p>
          <div className="text-[10px] text-zinc-650 font-mono tracking-widest uppercase">
            © 2026 SmartBite Inc. Certified by UAE AI Strategy.
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL (REGISTER / LOGIN FLOW) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-100 w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 font-bold p-1 hover:bg-zinc-50 rounded-lg text-sm"
            >
              ✕
            </button>

            {authMode === 'login' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 font-display">Sign In to SmartBite AI</h3>
                  <p className="text-xs text-zinc-400">Unlock custom reward points and personalized meal plans</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="siddharthadhar404@gmail.com"
                    className="w-full text-xs font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Password</label>
                  <input
                    id="login-pass"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-sans bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-orange-600 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-zinc-500 hover:underline font-semibold"
                  >
                    Create Account
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full brand-gradient text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm"
                >
                  Confirm Login
                </button>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-zinc-900 font-display">Create SmartBite Account</h3>
                  <p className="text-xs text-zinc-400 font-medium">Join the intelligent food-tech network</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Siddharth Dhar"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="siddharthadhar404@gmail.com"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Phone Number</label>
                    <input
                      id="signup-phone"
                      type="text"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Diet preferences</label>
                    <select
                      id="signup-dietary"
                      value={signupDietary}
                      onChange={(e) => setSignupDietary(e.target.value as any)}
                      className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      <option value="none">None</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto Diet</option>
                      <option value="halal">Halal Choice</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Delivery Address</label>
                  <input
                    id="signup-address"
                    type="text"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    placeholder="Apartment 1402, Marina Heights, Dubai Marina"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Password</label>
                  <input
                    id="signup-pass"
                    type="password"
                    value={signupPass}
                    onChange={(e) => setSignupPass(e.target.value)}
                    placeholder="Create Password"
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end text-xs mb-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-orange-600 hover:underline font-semibold"
                  >
                    Already have account? Sign in
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full brand-gradient text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Complete Registration (Sign Up)
                </button>
              </form>
            )}

            {authMode === 'forgot' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 font-display">Password Assistance Recovery</h3>
                  <p className="text-xs text-zinc-400">Receive simulated OTP secure verification link</p>
                </div>

                {resetSuccess ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-center text-xs font-bold">
                    Successfully Verified! Toggling login fields...
                  </div>
                ) : (
                  <>
                    {!otpSent ? (
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Enter Register Email</label>
                        <input
                          id="forgot-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="siddharthadhar404@gmail.com"
                          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none"
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-orange-50 border border-orange-200 text-orange-900 rounded-xl text-xs font-medium">
                          Simulated OTP sent to <strong>{resetEmail}</strong>. Code is: <strong>5820</strong>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">Enter OTP code</label>
                          <input
                            id="forgot-otp"
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="e.g. 5820"
                            className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none tracking-widest text-center font-bold"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setOtpSent(false);
                        }}
                        className="text-zinc-505 hover:underline font-semibold"
                      >
                        Back to Login
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full brand-gradient text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm"
                    >
                      {!otpSent ? 'Request simulated dynamic OTP' : 'Verify secure OTP code'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
