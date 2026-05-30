/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in AED
  category: 'Burgers' | 'Pizzas' | 'Healthy' | 'Arabic' | 'Desserts' | 'Drinks';
  spicy: boolean;
  vegan: boolean;
  calories: number;
}

export interface Restaurant {
  restaurant_id: string;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time: string; // e.g. "25 mins"
  image: string;
  menu_items: MenuItem[];
  location: {
    lat: number;
    lng: number;
    area: string;
  };
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  order_id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: OrderItem[];
  total_price: number;
  order_status: OrderStatus;
  created_at: string;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  driver_name?: string;
  driver_phone?: string;
  estimated_delivery_time?: string;
  delay_prediction?: string; // AI generated
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'restaurant_admin' | 'delivery_agent';
  preferences: {
    dietary: string; // 'none' | 'vegan' | 'keto' | 'halal'
    max_budget: number;
  };
  loyalty_points: number;
}

export interface CustomerReview {
  review_id: string;
  customer_name: string;
  restaurant_name: string;
  rating: number;
  comment: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  ai_insight?: string; // AI generated corrective action
  created_at: string;
}

export interface BusinessAnalytics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  customer_growth_rate: number; // percentage
  delivery_success_rate: number; // percentage
  top_selling_items: { name: string; sales: number; revenue: number }[];
  revenue_by_month: { name: string; revenue: number; orders: number }[];
  ai_demand_forecast: { day: string; predicted_orders: number; reason: string }[];
  sentiment_distribution: { name: string; value: number; color: string }[];
  ai_summary: string;
}
