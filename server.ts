/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { Restaurant, MenuItem, Order, User, CustomerReview, OrderStatus, BusinessAnalytics } from './src/types';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI SDK
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      console.warn("WARNING: GEMINI_API_KEY is not configured or is a placeholder.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Memory-resident Data Store for SmartBite AI
let users: User[] = [
  {
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
  },
  {
    user_id: 'admin-1',
    full_name: 'Amna Al Mansoori',
    email: 'admin@smartbite.ai',
    phone: '+971 50 987 6543',
    address: 'HQ Office, Dubai Internet City, UAE',
    role: 'restaurant_admin',
    preferences: {
      dietary: 'none',
      max_budget: 1000,
    },
    loyalty_points: 0,
  },
  {
    user_id: 'agent-1',
    full_name: 'Zayed Al Hashimi',
    email: 'zayed@smartbite.ai',
    phone: '+971 52 444 8888',
    address: 'Marina Deliveries Depot, Dubai, UAE',
    role: 'delivery_agent',
    preferences: {
      dietary: 'none',
      max_budget: 50,
    },
    loyalty_points: 120,
  }
];

const mockMenu: { [restaurantId: string]: MenuItem[] } = {
  'rest-1': [
    { id: 'item-101', name: 'Spicy Falcon Fire Burger', description: 'Gourmet spicy crisped chicken breast, premium brioche bun, pepper jack cheese, and hot Harissa sauce.', price: 35, category: 'Burgers', spicy: true, vegan: false, calories: 650 },
    { id: 'item-102', name: 'SmartBite Classic Beef Combo', description: 'Angus beef patty, cheddar, signature garlic mayo, hand-cut fries, and organic soft drink.', price: 38, category: 'Burgers', spicy: false, vegan: false, calories: 850 },
    { id: 'item-103', name: 'Avocado Crunch Slider', description: 'Mini breaded chicken slider with local hand-picked avocados, spicy light mayo, and organic pickles.', price: 29, category: 'Burgers', spicy: false, vegan: false, calories: 450 }
  ],
  'rest-2': [
    { id: 'item-201', name: 'Falafel Mezza Feast', description: 'Crispy herb-infused organic falafel, served with house-made tahini dip, local vegetables, and hot Lebanese flatbread.', price: 28, category: 'Arabic', spicy: false, vegan: true, calories: 380 },
    { id: 'item-202', name: 'Vegan Tabouli Combo', description: 'Fresh chopped flat parsley, local mint, organic tomatoes, green onions, and whole cracked bulgur with lemon salad, paired with stuffed organic grape leaves.', price: 22, category: 'Arabic', spicy: false, vegan: true, calories: 290 },
    { id: 'item-203', name: 'Halloumi & Pomegranate Flatbread', description: 'Warm open flatbread topped with local grilled Halloumi cheese, freshly crushed mint leaves, and sweet pomegranate seeds.', price: 32, category: 'Arabic', spicy: false, vegan: false, calories: 490 }
  ],
  'rest-3': [
    { id: 'item-301', name: 'Spicy Diavola Pizza', description: 'Artisanal sourdough base, spicy halal pepperoni sausage, hot chili oil, organic buffalo mozzarella, and fresh red chilies.', price: 48, category: 'Pizzas', spicy: true, vegan: false, calories: 920 },
    { id: 'item-302', name: 'UAE Truffle & Wild Mushroom flat', description: 'Wood-fired crispy thin pizza topped with creamed wild mushrooms, local organic white truffle oil, and local rocket greens.', price: 55, category: 'Pizzas', spicy: false, vegan: false, calories: 880 }
  ],
  'rest-4': [
    { id: 'item-401', name: 'Keto Avocado Chicken Bowl', description: 'Perfect low-carb blend of shredded premium chicken breast, local avocados, wild cucumber slices, high-protein baby spinach, poached organic egg, and garlic lemon olive vinaigrette.', price: 38, category: 'Healthy', spicy: false, vegan: false, calories: 410 },
    { id: 'item-402', name: 'Superfoods Quinoa Salad', description: 'Golden puffed organic quinoa, superfood kale, fresh blueberries, pumpkin seeds, tossed in cold-pressed extra virgin olive oil.', price: 34, category: 'Healthy', spicy: false, vegan: true, calories: 320 }
  ]
};

let restaurants: Restaurant[] = [
  {
    restaurant_id: 'rest-1',
    name: 'Burger House',
    cuisine: 'Gourmet Burgers & Fries',
    rating: 4.8,
    delivery_time: '25 mins',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    location: { lat: 25.0792, lng: 55.1403, area: 'Dubai Marina' },
    menu_items: mockMenu['rest-1']
  },
  {
    restaurant_id: 'rest-2',
    name: 'Zaatar & Zeytouna',
    cuisine: 'Healthy Clean Arabic Mezze',
    rating: 4.7,
    delivery_time: '20 mins',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600',
    location: { lat: 25.0935, lng: 55.1558, area: 'Dubai Internet City' },
    menu_items: mockMenu['rest-2']
  },
  {
    restaurant_id: 'rest-3',
    name: 'Pizzeria Bella',
    cuisine: 'Artisanal Sourdough Pizzas',
    rating: 4.6,
    delivery_time: '30 mins',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    location: { lat: 25.0805, lng: 55.1438, area: 'JBR Walk' },
    menu_items: mockMenu['rest-3']
  },
  {
    restaurant_id: 'rest-4',
    name: 'The Green Bowl',
    cuisine: 'Premium Organic Bowls & Keto Salads',
    rating: 4.9,
    delivery_time: '22 mins',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    location: { lat: 25.0844, lng: 55.1381, area: 'Dubai Marina West' },
    menu_items: mockMenu['rest-4']
  }
];

let orders: Order[] = [
  {
    order_id: 'order-101',
    user_id: 'cust-1',
    restaurant_id: 'rest-1',
    restaurant_name: 'Burger House',
    items: [
      { menuItem: mockMenu['rest-1'][0], quantity: 1 } // Spicy Falcon Fire Burger (AED 35)
    ],
    total_price: 35,
    order_status: 'Delivered',
    created_at: new Date(Date.now() - 4 * 3600_000).toISOString(),
    delivery_address: 'Apartment 1402, Marina Heights, Dubai Marina, UAE',
    delivery_lat: 25.0841,
    delivery_lng: 55.1396,
    driver_name: 'Zayed Al Hashimi',
    driver_phone: '+971 52 444 8888',
    estimated_delivery_time: 'Completed',
    delay_prediction: 'Minimial delays predicted, completed on-time.'
  },
  {
    order_id: 'order-102',
    user_id: 'cust-1',
    restaurant_id: 'rest-4',
    restaurant_name: 'The Green Bowl',
    items: [
      { menuItem: mockMenu['rest-4'][0], quantity: 1 }, // Keto Avocado Chicken Bowl (AED 38)
      { menuItem: mockMenu['rest-4'][1], quantity: 1 }  // Superfoods Quinoa Salad (AED 34)
    ],
    total_price: 72,
    order_status: 'Preparing',
    created_at: new Date().toISOString(),
    delivery_address: 'Apartment 1402, Marina Heights, Dubai Marina, UAE',
    delivery_lat: 25.0841,
    delivery_lng: 55.1396,
    driver_name: 'Zayed Al Hashimi',
    driver_phone: '+971 52 444 8888',
    estimated_delivery_time: '22 mins',
    delay_prediction: 'Weather and traffic look normal in Dubai Marina. Smooth delivery estimated.'
  }
];

let reviews: CustomerReview[] = [
  {
    review_id: 'rev-1',
    customer_name: 'Fatima Al Suwaidi',
    restaurant_name: 'Burger House',
    rating: 5,
    comment: 'The Spicy Falcon Fire Burger is the absolute best in Dubai! It is under AED 40 and packed with so much rich flavor. Fast delivery too!',
    sentiment: 'Positive',
    ai_insight: 'Outstanding feedback. Send a voucher to encourage repeat loyal breakfast and dinner orders.',
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString()
  },
  {
    review_id: 'rev-2',
    customer_name: 'John Miller',
    restaurant_name: 'Pizzeria Bella',
    rating: 2,
    comment: 'Disappointed today. The Wild Mushroom flatbread was cold when it arrived and it took over 50 minutes to get to JBR Towers.',
    sentiment: 'Negative',
    ai_insight: 'Action required: Optimize hot-box bag containment for pizzas and extend a 20 AED apology discount.',
    created_at: new Date(Date.now() - 48 * 3600_000).toISOString()
  },
  {
    review_id: 'rev-3',
    customer_name: 'Layla Jamil',
    restaurant_name: 'Zaatar & Zeytouna',
    rating: 4,
    comment: 'The halloumi flatbread was very soft and tasty. But could have added a bit more salad. Still a great healthy lunch under AED 35!',
    sentiment: 'Neutral',
    ai_insight: 'Operational adjustment: Slightly increase salad portions or prompt with complementary side combinations.',
    created_at: new Date(Date.now() - 12 * 3600_000).toISOString()
  }
];

// AUTHENTICATION ENDPOINTS
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, phone, password, address, dietary, maxBudget } = req.body;
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser: User = {
    user_id: `cust-${Date.now()}`,
    full_name: fullName,
    email: email,
    phone: phone,
    address: address || 'Dubai Marina, UAE',
    role: 'customer',
    preferences: {
      dietary: dietary || 'none',
      max_budget: Number(maxBudget) || 120,
    },
    loyalty_points: 50, // Welcome points
  };

  users.push(newUser);
  res.status(201).json({
    message: 'Registered successfully',
    user: newUser,
    token: `simulated-jwt-${newUser.user_id}`
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please supply email and password' });
  }

  // Find user by email
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Dynamically register the user so literally ANY email and password works!
    const isSpecialAdmin = email.toLowerCase().includes('admin');
    const isSpecialAgent = email.toLowerCase().includes('agent') || email.toLowerCase().includes('driver') || email.toLowerCase().includes('rider');
    const role: 'customer' | 'restaurant_admin' | 'delivery_agent' = isSpecialAdmin ? 'restaurant_admin' : (isSpecialAgent ? 'delivery_agent' : 'customer');
    
    // Create friendly name from email prefix (e.g. siddharth.dhar@gmail.com -> Siddharth Dhar)
    const emailPrefix = email.split('@')[0];
    const full_name = emailPrefix
      .split(/[\._\-+]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Instant Customer';

    user = {
      user_id: `${role === 'restaurant_admin' ? 'admin' : (role === 'delivery_agent' ? 'agent' : 'cust')}-${Date.now()}`,
      full_name,
      email: email.toLowerCase(),
      phone: '+971 50 ' + Math.floor(1000000 + Math.random() * 9000000),
      address: role === 'restaurant_admin' ? 'SmartBite HQ, Dubai Internet City, UAE' : (role === 'delivery_agent' ? 'Marina Deliveries Depot, Dubai, UAE' : 'Apartment 1402, Marina Heights, Dubai Marina, UAE'),
      role,
      preferences: {
        dietary: 'none',
        max_budget: role === 'restaurant_admin' ? 1000 : 120,
      },
      loyalty_points: role === 'customer' ? 150 : 0
    };
    users.push(user);
  }

  // Password matches everything since this is simulated
  res.json({
    message: 'Login successful',
    user,
    token: `simulated-jwt-${user.user_id}`
  });
});

// RESTAURANT ENDPOINTS
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

app.post('/api/restaurants/menu', (req, res) => {
  const { restaurantId, item } = req.body;
  const rest = restaurants.find(r => r.restaurant_id === restaurantId);
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });

  const newItem: MenuItem = {
    id: `item-${Date.now()}`,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    category: item.category || 'Burgers',
    spicy: !!item.spicy,
    vegan: !!item.vegan,
    calories: Number(item.calories) || 500
  };

  rest.menu_items.push(newItem);
  res.status(201).json({ message: 'Menu item added successfully', restaurant: rest });
});

// ORDERS ENDPOINTS
app.get('/api/orders', (req, res) => {
  const { role, userId } = req.query;

  if (role === 'restaurant_admin') {
    // Return all orders (simulating admin view)
    return res.json(orders);
  } else if (role === 'delivery_agent') {
    // Return all orders that are preparing, out for delivery or delivered
    return res.json(orders);
  } else {
    // Filter by customer id or default to all
    const custId = userId || 'cust-1';
    const filtered = orders.filter(o => o.user_id === custId);
    return res.json(filtered);
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, restaurantId, items, totalPrice, deliveryAddress } = req.body;

  const rest = restaurants.find(r => r.restaurant_id === restaurantId);
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });

  // Fallback prediction
  let delayPrediction = 'Traffic looks smooth in this area. No major delays forecasted.';

  try {
    const ai = getAi();
    const prompt = `Assess the delivery path coordinates for Jumeirah/Marina area. Determine potential delay or speed optimization for food delivered from ${rest.name} to ${deliveryAddress || 'Dubai Marina'}. Total price was AED ${totalPrice}. Provide a single comforting sentence forecasting estimated arrival and road conditions. Keep it under 25 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    if (response.text) {
      delayPrediction = response.text.trim();
    }
  } catch (error) {
    console.error('Gemini delay prediction exception:', error);
  }

  const newOrder: Order = {
    order_id: `order-${Date.now()}`,
    user_id: userId || 'cust-1',
    restaurant_id: restaurantId,
    restaurant_name: rest.name,
    items,
    total_price: totalPrice,
    order_status: 'Pending',
    created_at: new Date().toISOString(),
    delivery_address: deliveryAddress || 'Apartment 1402, Marina Heights, Dubai Marina, UAE',
    delivery_lat: 25.0841 + (Math.random() - 0.5) * 0.005,
    delivery_lng: 55.1396 + (Math.random() - 0.5) * 0.005,
    driver_name: 'Zayed Al Hashimi',
    driver_phone: '+971 52 444 8888',
    estimated_delivery_time: rest.delivery_time,
    delay_prediction: delayPrediction
  };

  orders.push(newOrder);

  // Credit user loyalty points
  const user = users.find(u => u.user_id === (userId || 'cust-1'));
  if (user) {
    user.loyalty_points += Math.round(totalPrice * 0.5); // 0.5 points per AED
  }

  res.status(201).json({ message: 'Order submitted successfully', order: newOrder });
});

app.post('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.order_id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.order_status = status as OrderStatus;
  if (status === 'Delivered') {
    order.estimated_delivery_time = 'Completed';
  }

  res.json({ message: 'Order status updated', order });
});

// REVIEWS & SENTIMENT ANALYTICS
app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
  const { customerName, restaurantName, rating, comment } = req.body;
  
  let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
  let aiInsight = 'Satisfied check-in.';

  try {
    const ai = getAi();
    const prompt = `Grade this customer comment: "${comment}". Rate must be exactly one of: Positive, Neutral, Negative. Under it, provide a short 5-10 word business recovery action for the restaurant admin. Respond in structured JSON only, strictly matching this structure:
    { "sentiment": "Positive" | "Neutral" | "Negative", "action": "string" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
            action: { type: Type.STRING }
          },
          required: ['sentiment', 'action']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      sentiment = data.sentiment;
      aiInsight = data.action;
    }
  } catch (err) {
    console.error('Sentiment analytics failed:', err);
    // Simple regex fallback
    const l = comment.toLowerCase();
    if (l.includes('bad') || l.includes('disappointed') || l.includes('cold') || l.includes('slow')) {
      sentiment = 'Negative';
      aiInsight = 'Urgent manager check-in required.';
    } else if (l.includes('good') || l.includes('great') || l.includes('best') || l.includes('delicious')) {
      sentiment = 'Positive';
      aiInsight = 'Praise chef team and secure loyalty campaign.';
    }
  }

  const newReview: CustomerReview = {
    review_id: `rev-${Date.now()}`,
    customer_name: customerName || 'Valued SmartBite Customer',
    restaurant_name: restaurantName || 'Burger House',
    rating: Number(rating) || 5,
    comment,
    sentiment,
    ai_insight: aiInsight,
    created_at: new Date().toISOString()
  };

  reviews.unshift(newReview);
  res.status(201).json({ message: 'Review added successfully', review: newReview });
});

// BUSINESS INTELLIGENCE ANALYTICS
app.get('/api/ai/analytics', async (req, res) => {
  // Aggregate data in memory
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.total_price, 0);
  const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(1)) : 0;
  
  // Calculate Sentiment percentages
  const totalSentiment = reviews.length;
  const positiveCount = reviews.filter(r => r.sentiment === 'Positive').length;
  const neutralCount = reviews.filter(r => r.sentiment === 'Neutral').length;
  const negativeCount = reviews.filter(r => r.sentiment === 'Negative').length;

  const sentiment_distribution = [
    { name: 'Positive', value: totalSentiment > 0 ? Math.round((positiveCount / totalSentiment) * 100) : 60, color: '#10B981' },
    { name: 'Neutral', value: totalSentiment > 0 ? Math.round((neutralCount / totalSentiment) * 100) : 30, color: '#F59E0B' },
    { name: 'Negative', value: totalSentiment > 0 ? Math.round((negativeCount / totalSentiment) * 100) : 10, color: '#EF4444' }
  ];

  // Top Selling Items aggregation
  const itemsMap: { [name: string]: { sales: number; revenue: number } } = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      const name = it.menuItem.name;
      if (!itemsMap[name]) {
        itemsMap[name] = { sales: 0, revenue: 0 };
      }
      itemsMap[name].sales += it.quantity;
      itemsMap[name].revenue += it.menuItem.price * it.quantity;
    });
  });

  const top_selling_items = Object.keys(itemsMap).map(k => ({
    name: k,
    sales: itemsMap[k].sales,
    revenue: itemsMap[k].revenue
  })).sort((a,b) => b.sales - a.sales).slice(0, 5);

  // If empty, supply nice baseline data
  if (top_selling_items.length === 0) {
    top_selling_items.push(
      { name: 'Spicy Falcon Fire Burger', sales: 15, revenue: 525 },
      { name: 'Falafel Mezza Feast', sales: 12, revenue: 336 },
      { name: 'Keto Avocado Chicken Bowl', sales: 10, revenue: 380 }
    );
  }

  const revenue_by_month = [
    { name: 'Jan', revenue: 4500, orders: 120 },
    { name: 'Feb', revenue: 5800, orders: 145 },
    { name: 'Mar', revenue: 6200, orders: 160 },
    { name: 'Apr', revenue: 7900, orders: 195 },
    { name: 'May', revenue: totalRevenue + 8400, orders: totalOrders + 210 }
  ];

  // Call Gemini to generate forecast and startup executive summary
  let ai_summary = 'Sales are exhibiting steady double-digit week-on-week growth, centered in Dubai Marina. Gourmet spicy burgers continue to dominate orders.';
  let ai_demand_forecast = [
    { day: 'Friday', predicted_orders: 85, reason: 'High weekend demand for spicy food combos & late night snacks.' },
    { day: 'Saturday', predicted_orders: 95, reason: 'Peak family deals demand, sports events drive ordering spikes.' },
    { day: 'Sunday', predicted_orders: 70, reason: 'Shift to light Middle Eastern mezze combos as workweek resumes.' },
    { day: 'Monday', predicted_orders: 50, reason: 'High demand for Green Bowl keto lunch bowls in Dubai Internet City.' }
  ];

  try {
    const ai = getAi();
    const systemPrompt = `You are the Business Intelligence system of SmartBite AI, a food tech startup in the UAE.
    Here is our operational data:
    - Total Orders: ${totalOrders}
    - Total Revenue: AED ${totalRevenue}
    - Top Items Sold: ${JSON.stringify(top_selling_items)}
    - Customer Sentiment: ${positiveCount} Positive, ${neutralCount} Neutral, ${negativeCount} Negative.

    Generate a highly strategic, professional data science analysis for the startup founders. Provide the response as a JSON matching this exact typescript model:
    {
       "ai_summary": "3-sentence executive business growth insights",
       "forecast": [
          { "day": "Friday", "predicted_orders": number, "reason": "UAE consumer peak behavior forecast reason" },
          { "day": "Saturday", "predicted_orders": number, "reason": "forecast reason" },
          { "day": "Sunday", "predicted_orders": number, "reason": "forecast reason" },
          { "day": "Monday", "predicted_orders": number, "reason": "forecast reason" }
       ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ai_summary: { type: Type.STRING },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  predicted_orders: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ['day', 'predicted_orders', 'reason']
              }
            }
          },
          required: ['ai_summary', 'forecast']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      ai_summary = data.ai_summary;
      if (Array.isArray(data.forecast) && data.forecast.length > 0) {
        ai_demand_forecast = data.forecast;
      }
    }
  } catch (err) {
    console.error('Business intelligence Gemini forecast generation failed:', err);
  }

  const finalAnalytics: BusinessAnalytics = {
    total_orders: totalOrders + 480, // Inject baseline offset for beautiful dashboard display
    total_revenue: totalRevenue + 14850,
    average_order_value: averageOrderValue > 0 ? averageOrderValue : 31.5,
    customer_growth_rate: 18.4,
    delivery_success_rate: 98.2,
    top_selling_items,
    revenue_by_month,
    ai_demand_forecast,
    sentiment_distribution,
    ai_summary
  };

  res.json(finalAnalytics);
});

// AGENTIC CHATBOT ENDPOINT
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, userPreferences } = req.body;

  // Compile menu items into simplified context for Gemini to recommend from
  const menuSummary = restaurants.map(r => {
    return {
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      items: r.menu_items.map(m => ({
        id: m.id,
        name: m.name,
        price: m.price,
        description: m.description,
        isSpicy: m.spicy,
        isVegan: m.vegan,
        calories: m.calories
      }))
    };
  });

  const basePrompt = `You are 'SmartBite AI', an elite, fully autonomous Agentic AI Food Delivery Assistant designed for the UAE ecosystem (Dubai, Abu Dhabi, Jumeirah, Marina).
  We support food ordering, recommendation, and operational support.
  
  Available Restaurants and Menu:
  ${JSON.stringify(menuSummary)}

  User Profile context:
  - Selected Diet preference: ${userPreferences?.dietary || 'none'}
  - Max budget: AED ${userPreferences?.max_budget || 100}

  Your response must be JSON containing:
  1. "textMessage": A friendly, helpful, human-like voice response. Maximize UAE hospitality. Chat naturally of course! Speak of actual options in the menu. Mention specific items (e.g. if they want spicy under AED 40, explicitly recommend the 'Spicy Falcon Fire Burger' for AED 35 from 'Burger House').
  2. "recommendedItems": List of objects representing menu items that perfectly match their sentiment or filter intent. Each item MUST have restaurantId, restaurantName, itemId, itemName, price, and reason (why you recommended it). Leave empty [] if they are just greeting or talking generally.
  3. "suggestedAction": Exactly one of: 'none', 'add_to_cart', 'view_restaurants', 'track_order'. Use 'add_to_cart' if the user explicitly asked to order, buy, try, or get a recommendation that they can directly add to their checkout.

  IMPORTANT RULES:
  - If the user says: "I want a spicy chicken burger under AED 40 near me" or mentions spicy chicken under AED 40, select rest-1 ('Burger House') and item-101 ('Spicy Falcon Fire Burger') at AED 35. State that it is a masterpiece with Harissa sauce!
  - If they ask for healthy or vegetarian/vegan options, suggest "Falafel Mezza Feast" (AED 28) or "Superfoods Quinoa Salad" (AED 34).
  - Always respond with extremely pristine JSON conforming exactly to the responseSchema model.

  Conversational history for multi-turn coherence:
  ${JSON.stringify(history || [])}
  
  User Prompt: "${message}"`;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: basePrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            textMessage: { type: Type.STRING },
            recommendedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  restaurantId: { type: Type.STRING },
                  restaurantName: { type: Type.STRING },
                  itemId: { type: Type.STRING },
                  itemName: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ['restaurantId', 'restaurantName', 'itemId', 'itemName', 'price', 'reason']
              }
            },
            suggestedAction: { type: Type.STRING, enum: ['none', 'add_to_cart', 'view_restaurants', 'track_order'] }
          },
          required: ['textMessage', 'recommendedItems', 'suggestedAction']
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      res.json(data);
    } else {
      res.status(500).json({ error: 'Failed to generate speech text response from Gemini.' });
    }
  } catch (error) {
    console.error('Gemini Conversational ordering failed:', error);
    // Dynamic Fallback response for offline resilience
    let sentimentSuggest: any[] = [];
    let act: string = 'none';
    let reply = "Hello! I am SmartBite AI. I can guide you through our select gourmet menus in Dubai. Let me know what you crave!";
    
    const msg = message.toLowerCase();
    if (msg.includes('burger') || msg.includes('spicy') || msg.includes('under 40')) {
      reply = "Here is our top suggestion! The **Spicy Falcon Fire Burger** from *Burger House* is AED 35. It features spicy premium crisped chicken and hot Harissa sauce!";
      sentimentSuggest = [{
        restaurantId: 'rest-1',
        restaurantName: 'Burger House',
        itemId: 'item-101',
        itemName: 'Spicy Falcon Fire Burger',
        price: 35,
        reason: 'Matches your craving for standard-setting spicy gourmet burgers for under AED 40.'
      }];
      act = 'add_to_cart';
    } else if (msg.includes('healthy') || msg.includes('veget') || msg.includes('vegan')) {
      reply = "I recommend Zaatar & Zeytouna's authentic **Falafel Mezza Feast** for AED 28 (Vegan) or The Green Bowl's **Keto Avocado Chicken Bowl** for AED 38!";
      sentimentSuggest = [{
        restaurantId: 'rest-2',
        restaurantName: 'Zaatar & Zeytouna',
        itemId: 'item-201',
        itemName: 'Falafel Mezza Feast',
        price: 28,
        reason: 'Vibrant, hand-made vegan herb chickpea flatbread platter.'
      }];
      act = 'add_to_cart';
    }

    res.json({
      textMessage: reply,
      recommendedItems: sentimentSuggest,
      suggestedAction: act
    });
  }
});

// START EXPRESS/VITE HOT-PLUG RENDER SYSTEM
async function startServer() {
  // Vite middleware setup
  const isProduction = process.env.NODE_ENV === 'production' || !process.argv.some(arg => arg.includes('server.ts'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartBite AI Full-Stack Server hosting on http://0.0.0.0:${PORT}`);
  });
}

startServer();
