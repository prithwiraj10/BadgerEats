/**
 * Campus Food Alerts Backend - UW-Madison Edition
 * Node.js/Express server with Twilio integration, Nutrislice API, scheduling, and AI summarization
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const cron = require('node-cron');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const PORT = process.env.PORT || 5000;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Initialize Twilio
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Initialize Claude AI
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

// Initialize SQLite Database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './food_alerts.db',
  logging: false
});

// UW-Madison Nutrislice Configuration
const NUTRISLICE_BASE_URL = 'https://wisc-housingdining.api.nutrislice.com/menu/api/weeks/school';

const DINING_HALLS = {
  dejope: 'dejope-residence-hall',
  gordon: 'gordon-avenue-market',
  carson: 'carson-gulley-commons',
  rheta: 'rhetas-market',
  lizzie: 'lizzie-waters-residence-hall',
  newell: 'newell-murray-house',
  four_lakes: 'four-lakes-market'
};

// Database Models
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  freeEventFood: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  diningHallMenus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  specialEvents: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  preferredDiningHalls: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('preferredDiningHalls');
      return JSON.parse(value || '[]');
    },
    set(value) {
      this.setDataValue('preferredDiningHalls', JSON.stringify(value));
    }
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const FoodUpdate = sequelize.define('FoodUpdate', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: DataTypes.STRING,
  date: DataTypes.STRING,
  description: DataTypes.TEXT,
  diningHall: DataTypes.STRING,
  mealPeriod: DataTypes.STRING,
  rawData: DataTypes.TEXT,
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const MessageLog = sequelize.define('MessageLog', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  foodUpdateId: {
    type: DataTypes.INTEGER,
    references: {
      model: FoodUpdate,
      key: 'id'
    }
  },
  messageSid: DataTypes.STRING,
  status: DataTypes.STRING
});

// Nutrislice API Functions
async function fetchDiningHallMenu(diningHallKey, date = new Date()) {
  const hallSlug = DINING_HALLS[diningHallKey];
  if (!hallSlug) {
    console.log(`Unknown dining hall: ${diningHallKey}`);
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const url = `${NUTRISLICE_BASE_URL}/${hallSlug}/menu-type/lunch/${year}/${month}/${day}/`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu for ${diningHallKey}:`, error.message);
    return null;
  }
}

function parseMenuItems(menuData, targetDate = null) {
  if (!menuData || !menuData.days) {
    return {};
  }

  if (!targetDate) {
    const date = new Date();
    targetDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  const meals = {
    breakfast: [],
    lunch: [],
    dinner: [],
    late_night: []
  };

  for (const day of menuData.days) {
    if (day.date !== targetDate) continue;

    const menuItems = day.menu_items || [];
    let currentMeal = null;

    for (const item of menuItems) {
      if (item.is_section_title) {
        const sectionName = (item.text || '').toLowerCase();
        if (sectionName.includes('breakfast')) {
          currentMeal = 'breakfast';
        } else if (sectionName.includes('lunch')) {
          currentMeal = 'lunch';
        } else if (sectionName.includes('dinner')) {
          currentMeal = 'dinner';
        } else if (sectionName.includes('late')) {
          currentMeal = 'late_night';
        }
      } else if (currentMeal && item.food) {
        const food = item.food;
        if (food.name) {
          meals[currentMeal].push({
            name: food.name,
            description: food.description || '',
            category: food.food_category || ''
          });
        }
      }
    }
  }

  return meals;
}

async function summarizeMenuWithAI(diningHall, mealPeriod, menuItems) {
  if (!menuItems || menuItems.length === 0) {
    return `No ${mealPeriod} menu available for ${diningHall} today.`;
  }

  const foodNames = menuItems.slice(0, 10).map(item => item.name);
  const foodList = foodNames.join(', ');

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Create a brief, engaging text message (max 140 chars) about today's ${mealPeriod} at ${diningHall}:

Menu items: ${foodList}

Make it casual and appetizing. Start with an emoji. Highlight 2-3 best items.`
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error with AI summarization:', error.message);
    const topItems = foodNames.slice(0, 3);
    return `🍽️ ${diningHall} ${mealPeriod}: ${topItems.join(', ')}`;
  }
}

// API Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { name, phone, preferences, dining_halls } = req.body;

    let user = await User.findOne({ where: { phone } });

    if (user) {
      user.name = name;
      user.freeEventFood = preferences?.freeEventFood || false;
      user.diningHallMenus = preferences?.diningHallMenus || false;
      user.specialEvents = preferences?.specialEvents || false;
      user.preferredDiningHalls = dining_halls || [];
      user.active = true;
      await user.save();

      return res.json({
        success: true,
        message: 'Preferences updated successfully',
        user: user.toJSON()
      });
    }

    user = await User.create({
      name,
      phone,
      freeEventFood: preferences?.freeEventFood || false,
      diningHallMenus: preferences?.diningHallMenus || false,
      specialEvents: preferences?.specialEvents || false,
      preferredDiningHalls: dining_halls || []
    });

    await sendWelcomeMessage(user);

    res.status(201).json({
      success: true,
      message: 'Successfully signed up for food alerts',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/dining-halls', (req, res) => {
  const halls = Object.entries(DINING_HALLS).map(([key, value]) => ({
    key,
    name: value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  res.json({
    success: true,
    dining_halls: halls
  });
});

app.get('/api/menu/:diningHall', async (req, res) => {
  try {
    const { diningHall } = req.params;
    const dateStr = req.query.date;
    const date = dateStr ? new Date(dateStr) : new Date();

    const menuData = await fetchDiningHallMenu(diningHall, date);
    if (!menuData) {
      return res.status(404).json({ success: false, error: 'Could not fetch menu' });
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const targetDate = `${year}-${month}-${day}`;

    const meals = parseMenuItems(menuData, targetDate);

    res.json({
      success: true,
      dining_hall: diningHall,
      date: targetDate,
      meals
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/food-updates', async (req, res) => {
  try {
    const updates = await FoodUpdate.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      updates
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/food-updates', async (req, res) => {
  try {
    const { type, title, location, time, date, description, dining_hall, meal_period, raw_data } = req.body;

    const update = await FoodUpdate.create({
      type,
      title,
      location,
      time: time || '',
      date: date || '',
      description: description || '',
      diningHall: dining_hall,
      mealPeriod: meal_period,
      rawData: JSON.stringify(raw_data || {})
    });

    await sendFoodUpdateNotifications(update);

    res.status(201).json({
      success: true,
      update
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({ where: { active: true } });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/webhooks/twilio', async (req, res) => {
  try {
    const incomingMsg = (req.body.Body || '').trim().toUpperCase();
    const fromNumber = req.body.From || '';

    const twiml = new twilio.twiml.MessagingResponse();

    if (incomingMsg === 'STOP') {
      const user = await User.findOne({ where: { phone: fromNumber } });
      if (user) {
        user.active = false;
        await user.save();
        twiml.message("You've been unsubscribed from Campus Food Alerts. Text START to resubscribe.");
      } else {
        twiml.message("Phone number not found in our system.");
      }
    } else if (incomingMsg === 'START') {
      const user = await User.findOne({ where: { phone: fromNumber } });
      if (user) {
        user.active = true;
        await user.save();
        twiml.message("Welcome back! You're now subscribed to Campus Food Alerts.");
      } else {
        twiml.message("Please sign up at our website first.");
      }
    } else {
      twiml.message("Reply STOP to unsubscribe or START to resubscribe.");
    }

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error in Twilio webhook:', error);
    res.type('text/xml');
    res.send(new twilio.twiml.MessagingResponse().toString());
  }
});

// Twilio Functions
async function sendWelcomeMessage(user) {
  try {
    let message = `Hi ${user.name}! Welcome to UW-Madison Food Alerts 🍕\n\nYou'll receive texts about:\n`;
    
    if (user.freeEventFood) {
      message += '- Free event food\n';
    }
    if (user.diningHallMenus) {
      const diningHalls = user.preferredDiningHalls;
      if (diningHalls.length > 0) {
        const hallsStr = diningHalls.slice(0, 3).map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(', ');
        message += `- Dining menus (${hallsStr})\n`;
      } else {
        message += '- Dining hall menus\n';
      }
    }
    if (user.specialEvents) {
      message += '- Special events\n';
    }
    message += '\nReply STOP anytime to unsubscribe.';

    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: user.phone
    });
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

async function sendFoodUpdateNotifications(foodUpdate) {
  try {
    let users = await User.findAll({ where: { active: true } });

    if (foodUpdate.type === 'event') {
      users = users.filter(u => u.freeEventFood);
    } else if (foodUpdate.type === 'dining') {
      users = users.filter(u => u.diningHallMenus);
      if (foodUpdate.diningHall) {
        users = users.filter(u => u.preferredDiningHalls.includes(foodUpdate.diningHall));
      }
    } else {
      users = users.filter(u => u.specialEvents);
    }

    const message = await formatFoodAlert(foodUpdate);

    for (const user of users) {
      try {
        const msg = await twilioClient.messages.create({
          body: message,
          from: TWILIO_PHONE_NUMBER,
          to: user.phone
        });

        await MessageLog.create({
          userId: user.id,
          foodUpdateId: foodUpdate.id,
          messageSid: msg.sid,
          status: msg.status
        });
      } catch (error) {
        console.error(`Error sending to ${user.phone}:`, error);
      }
    }

    foodUpdate.sent = true;
    await foodUpdate.save();
  } catch (error) {
    console.error('Error in sendFoodUpdateNotifications:', error);
  }
}

async function formatFoodAlert(foodUpdate) {
  try {
    let prompt;
    if (foodUpdate.type === 'dining') {
      prompt = `Create a brief text message (max 160 chars) for this dining hall menu:

Hall: ${foodUpdate.diningHall}
Meal: ${foodUpdate.mealPeriod}
Items: ${foodUpdate.description}

Make it casual and appetizing with an emoji.`;
    } else {
      prompt = `Create a brief text message (max 160 chars) for this free food event:

Title: ${foodUpdate.title}
Location: ${foodUpdate.location}
Time: ${foodUpdate.time}
Description: ${foodUpdate.description}

Make it exciting and casual with an emoji.`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error formatting with AI:', error);
    const emoji = foodUpdate.type === 'event' ? '🍕' : '🍽️';
    return `${emoji} ${foodUpdate.title}\n📍 ${foodUpdate.location}\n⏰ ${foodUpdate.time}`;
  }
}

// Scheduler Functions
async function checkDiningHallMenus() {
  console.log(`[${new Date().toISOString()}] Checking dining hall menus...`);

  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    for (const hallKey of Object.keys(DINING_HALLS)) {
      const menuData = await fetchDiningHallMenu(hallKey, today);
      if (!menuData) continue;

      const meals = parseMenuItems(menuData, dateStr);

      for (const mealPeriod of ['lunch', 'dinner']) {
        if (!meals[mealPeriod] || meals[mealPeriod].length === 0) continue;

        const existing = await FoodUpdate.findOne({
          where: {
            diningHall: hallKey,
            mealPeriod,
            date: dateStr
          }
        });

        if (existing) continue;

        const summary = await summarizeMenuWithAI(hallKey, mealPeriod, meals[mealPeriod]);

        const update = await FoodUpdate.create({
          type: 'dining',
          title: `${hallKey.charAt(0).toUpperCase() + hallKey.slice(1)} ${mealPeriod.charAt(0).toUpperCase() + mealPeriod.slice(1)}`,
          location: DINING_HALLS[hallKey].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          time: getMealTime(mealPeriod),
          date: dateStr,
          description: summary,
          diningHall: hallKey,
          mealPeriod,
          rawData: JSON.stringify(meals[mealPeriod])
        });

        await sendFoodUpdateNotifications(update);
        console.log(`Sent ${mealPeriod} update for ${hallKey}`);
      }
    }
  } catch (error) {
    console.error('Error checking dining hall menus:', error);
  }
}

function getMealTime(mealPeriod) {
  const times = {
    breakfast: '7:00 AM - 10:00 AM',
    lunch: '11:00 AM - 2:00 PM',
    dinner: '5:00 PM - 8:00 PM',
    late_night: '8:00 PM - 11:00 PM'
  };
  return times[mealPeriod] || '';
}

async function checkForFoodEvents() {
  console.log(`[${new Date().toISOString()}] Checking for food events...`);
  // Implement your event scraping logic here
}

// Schedule jobs
// Check dining menus at 10 AM and 4 PM daily
cron.schedule('0 10,16 * * *', checkDiningHallMenus);

// Check for food events every 3 hours
cron.schedule('0 */3 * * *', checkForFoodEvents);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Scheduler jobs initialized');
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();