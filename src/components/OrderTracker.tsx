/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, User, Clock, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerProps {
  order: Order;
  onUpdateStatus?: (status: any) => void | Promise<any>;
  isAgentView?: boolean;
}

export default function OrderTracker({ order, onUpdateStatus, isAgentView = false }: OrderTrackerProps) {
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    switch (order.order_status) {
      case 'Pending': setProgress(15); break;
      case 'Confirmed': setProgress(35); break;
      case 'Preparing': setProgress(60); break;
      case 'Out for Delivery': setProgress(85); break;
      case 'Delivered': setProgress(100); break;
    }
  }, [order.order_status]);

  const steps: { label: Order['order_status']; desc: string }[] = [
    { label: 'Pending', desc: 'Awaiting restaurant approval' },
    { label: 'Confirmed', desc: 'Order confirmed by kitchen' },
    { label: 'Preparing', desc: 'Chef preparing fresh meal' },
    { label: 'Out for Delivery', desc: 'Rider on the way' },
    { label: 'Delivered', desc: 'Delivered to your door' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-zinc-400">ORDER ID: {order.order_id}</span>
          <h3 className="text-lg font-bold text-zinc-950 font-display mt-0.5">Tracking from {order.restaurant_name}</h3>
        </div>
        <div className="mt-3 md:mt-0 flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            order.order_status === 'Delivered' ? 'bg-emerald-550/10 text-emerald-600' :
            order.order_status === 'Preparing' ? 'bg-amber-500/10 text-amber-600' :
            'bg-orange-500/10 text-orange-600'
          }`}>
            ● {order.order_status}
          </span>
          <span className="text-sm font-medium text-zinc-500 flex items-center gap-1">
            <Clock className="w-4 h-4" /> {order.estimated_delivery_time}
          </span>
        </div>
      </div>

      {/* Interactive Visual Map Representation via SVG */}
      <div className="relative w-full h-48 bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden mb-6 flex items-center justify-center">
        {/* Simple beautiful stylized mockup vector map */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" width-height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E4E4E7" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Dubai streets paths */}
          <path d="M -10 40 C 150 50, 200 120, 500 150" fill="none" stroke="#D4D4D8" strokeWidth="6" strokeLinecap="round" />
          <path d="M 120 -10 C 150 110, 80 180, 200 250" fill="none" stroke="#D4D4D8" strokeWidth="5" strokeLinecap="round" />
          <path d="M 0 100 Q 200 40 450 120" fill="none" stroke="#D4D4D8" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* Dubai Marina / Jumeirah aesthetic locations */}
        <div className="absolute left-6 top-6 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-white/80 px-2 py-0.5 rounded-full border border-zinc-200/50">
          <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} /> Dubai Marina Waterway
        </div>

        {/* Anchor point 1: Restaurant */}
        <div className="absolute left-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md border-2 border-white">
            <span className="text-xs font-bold font-display">K</span>
          </div>
          <span className="text-[10px] font-semibold text-zinc-600 mt-1 bg-white px-2 py-0.5 rounded shadow-sm border border-zinc-100">
            {order.restaurant_name}
          </span>
        </div>

        {/* Anchor point 2: Customer House */}
        <div className="absolute right-1/4 bottom-1/4 transform translate-x-1/2 translate-y-1/2 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-md border-2 border-white">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-650 mt-1 bg-white px-2 py-0.5 rounded shadow-sm border border-zinc-100">
            You (Apartment 1402)
          </span>
        </div>

        {/* Delivery Rider Path Line & Flow indicator */}
        {order.order_status !== 'Delivered' && order.order_status !== 'Pending' && (
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/50 flex items-center gap-1.5 shadow-sm text-xs font-medium animate-bounce"
            style={{ left: `${30 + (progress * 0.4)}%`, top: `${35 + (progress * 0.25)}%` }}
          >
            🛵 Rider Approaching
          </div>
        )}

        {order.order_status === 'Delivered' && (
          <div className="absolute text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-md text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Order Handed Over
          </div>
        )}
      </div>

      {/* Progress timeline bars */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-2">
          <span>Active Delivery Stage</span>
          <span className="text-orange-600">{progress}% Completed</span>
        </div>
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div 
            className="brand-gradient h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Micro-milestone step descriptors */}
      <div className="grid grid-cols-5 gap-1 mb-6">
        {steps.map((st, idx) => {
          const isDone = progress >= ((idx + 1) * 20) || (idx === 0 && order.order_status !== 'Pending');
          const isActive = order.order_status === st.label;
          return (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isDone ? 'bg-orange-500 text-white' : 
                isActive ? 'bg-orange-100 text-orange-600 border border-orange-300' : 
                'bg-zinc-100 text-zinc-400'
              }`}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`text-[10px] font-bold mt-1.5 truncate w-full ${isActive ? 'text-orange-600' : 'text-zinc-500'}`}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* AI Delay Prediction and Driver Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 tracking-wide uppercase mb-1">
            <span className="animate-ping w-2 h-2 rounded-full bg-orange-500 mr-0.5" />
            SmartBite AI Operational Insight
          </div>
          <p className="text-xs text-orange-900 leading-relaxed font-sans">{order.delay_prediction}</p>
        </div>

        <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-zinc-400">ASSIGNED DELIVERER</p>
              <h4 className="text-sm font-bold text-zinc-900">{order.driver_name || 'Zayed Al Hashimi'}</h4>
              <p className="text-xs text-zinc-500">{order.driver_phone || '+971 52 444 8888'}</p>
            </div>
          </div>
          <a 
            href={`tel:${order.driver_phone || '+971524448888'}`}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-orange-500 hover:border-orange-200 transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Custom Simulation Toggles */}
      <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap gap-2 items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400">Simulate Delivery Partner Flow:</span>
        <div className="flex gap-1.5">
          {steps.map((st, idx) => (
            <button
              key={idx}
              id={`btn-simulate-${st.label}`}
              onClick={() => onUpdateStatus?.(st.label)}
              className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors ${
                order.order_status === st.label 
                  ? 'bg-zinc-950 text-white border-zinc-950' 
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
