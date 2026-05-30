/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, ShieldCheck, RefreshCw, BarChart2, Star, Eye } from 'lucide-react';
import { BusinessAnalytics } from '../types';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/ai/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to grab live BI analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold font-mono text-zinc-500">Retrieving SmartBite Business Intelligence Insights...</p>
      </div>
    );
  }

  // Base Fallback static parameters
  const stats = [
    { label: 'Total Orders Pool', value: analytics?.total_orders || 482, icon: ShoppingCart, change: '+18.4% WoW', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Cumulative Revenue', value: `AED ${(analytics?.total_revenue || 14885).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, change: '+22.1% YoY', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { label: 'Average Order Value', value: `AED ${analytics?.average_order_value || 31.5}`, icon: TrendingUp, change: 'Stable', color: 'bg-blue-50 text-blue-600 border-blue-150' },
    { label: 'Delivery Hand-off Rate', value: `${analytics?.delivery_success_rate || 98.2}%`, icon: ShieldCheck, change: '+0.5% optimization', color: 'bg-violet-50 text-violet-600 border-violet-100' }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-zinc-950">Business Intelligence & Analytics Panel</h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wide">REAL-TIME FORECASTS & DEMAND PREDICTION ENGINE</p>
        </div>
        <button
          id="btn-refresh-analytics"
          onClick={handleRefresh}
          className={`px-4 py-2 border border-zinc-200 hover:border-orange-200 hover:text-orange-600 bg-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${refreshing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Update Real-time Predictions
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-zinc-150/60 p-5 shadow-sm flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${st.color}`}>
              <st.icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-400 font-medium font-sans">{st.label}</span>
              <h3 className="text-xl font-extrabold font-display text-zinc-900 mt-1">{st.value}</h3>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-550 mt-1.5 inline-block">
                {st.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Executive summary banner powered by Gemini */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl border border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          <h4 className="text-xs font-bold font-mono text-orange-400 uppercase tracking-widest">SmartBite AI Strategic Report</h4>
        </div>
        <p className="text-sm font-sans font-light leading-relaxed mb-4 text-zinc-350">
          "{analytics?.ai_summary}"
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 border-t border-zinc-800/80 pt-4">
          <div className="text-xs">
            <span className="text-zinc-500 font-mono">CHURN STATUS:</span>
            <span className="text-emerald-400 ml-1.5 font-bold font-display">Minimal Risk (1.2%)</span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-500 font-mono">PEAK HOURS:</span>
            <span className="text-orange-400 ml-1.5 font-bold font-display">19:00 - 21:30 GST</span>
          </div>
          <div className="text-xs">
            <span className="text-zinc-500 font-mono">MARKETING METRIC:</span>
            <span className="text-violet-400 ml-1.5 font-bold font-display">2.8x conversion</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue month trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 font-display">Monthly Revenue Progression</h3>
              <p className="text-[10px] text-zinc-400 font-mono">TREND SINCE LAUNCH IN JAN</p>
            </div>
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-bold">AED</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenue_by_month} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => [`AED ${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#EA580C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Pie */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-zinc-900 font-display">Active Customer Sentiment Share</h3>
              <p className="text-[10px] text-zinc-400 font-mono">BASED ON SYSTEM CLASSIFICATIONS</p>
            </div>
            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.sentiment_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {analytics?.sentiment_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered summary counter */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-zinc-850 font-display">82%</span>
                <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase">POSITIVE INDEX</span>
              </div>
            </div>
          </div>
          {/* Legend indicator list */}
          <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 text-center">
            {analytics?.sentiment_distribution.map((entry, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs font-bold text-zinc-900">{entry.value}%</span>
                <span className="text-[10px] font-medium text-zinc-500 font-sans flex items-center gap-1 mt-0.5 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demand Predictions and Forecasts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-950 font-display">Predictive AI: UAE Consumer Demand Forecasts</h3>
            <p className="text-[10px] text-zinc-400 font-mono uppercase">Operational adjustments based on machine learning forecasts</p>
          </div>
          <div className="space-y-4">
            {analytics?.ai_demand_forecast.map((fc, fcIdx) => (
              <div key={fcIdx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100/50 flex gap-4 items-center">
                <div className="w-16 text-center">
                  <span className="text-xs font-bold text-zinc-400 font-sans block uppercase">{fc.day.slice(0,3)}</span>
                  <span className="text-base font-extrabold text-orange-600 font-display block">{fc.predicted_orders}</span>
                  <span className="text-[9px] text-zinc-400 font-mono uppercase font-bold">orders</span>
                </div>
                <div className="flex-1 border-l border-zinc-200 pl-4">
                  <h4 className="text-xs font-semibold text-zinc-850 font-sans mb-0.5">Predicted Sales Level</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">{fc.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Selling items table */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-zinc-950 font-display">Popular Dishes Leaderboard</h3>
              <p className="text-[10px] text-zinc-400 font-mono">MOST REPEATED COMBOS & ITEMS</p>
            </div>
            <div className="space-y-3.5">
              {analytics?.top_selling_items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between items-center bg-zinc-50/50 p-3 rounded-lg border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-300 font-bold text-sm w-4">#{itemIdx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-850 font-display">{item.name}</h4>
                      <p className="text-[10px] text-zinc-400">{item.sales} orders registered</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-zinc-900 bg-zinc-100 border border-zinc-200/50 px-2.5 py-1 rounded">
                    AED {item.revenue}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-zinc-405 font-medium font-sans text-center mt-4">
            💡 Note: High weekend spikes (approx 25%) are typically recorded for items matching 'Gourmet Spicy Burgers'.
          </p>
        </div>
      </div>
    </div>
  );
}
