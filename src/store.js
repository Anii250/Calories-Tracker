/* ============================================================
   CalorieAI — Data Store (localStorage-backed)
   ============================================================ */

const Store = (() => {
  const STORAGE_KEY = 'calorieai_data';

  // ---- Food Database (150+ items) ----
  const FOOD_DATABASE = [
    // Breakfast
    { name: 'Oatmeal', calories: 150, proteins: 5, fats: 2.5, carbs: 27, category: 'breakfast' },
    { name: 'Scrambled Eggs (2)', calories: 182, proteins: 12, fats: 13, carbs: 2, category: 'breakfast' },
    { name: 'Pancakes (3 pcs)', calories: 350, proteins: 8, fats: 10, carbs: 55, category: 'breakfast' },
    { name: 'Greek Yogurt', calories: 130, proteins: 12, fats: 4, carbs: 10, category: 'breakfast' },
    { name: 'Banana', calories: 105, proteins: 1.3, fats: 0.4, carbs: 27, category: 'fruit' },
    { name: 'Toast with Butter', calories: 170, proteins: 4, fats: 7, carbs: 22, category: 'breakfast' },
    { name: 'Cappuccino', calories: 90, proteins: 3.4, fats: 3.8, carbs: 9.5, category: 'drink' },
    { name: 'Orange Juice (250ml)', calories: 112, proteins: 1.7, fats: 0.5, carbs: 26, category: 'drink' },
    { name: 'Smoothie Bowl', calories: 280, proteins: 8, fats: 6, carbs: 48, category: 'breakfast' },
    { name: 'Croissant', calories: 231, proteins: 5, fats: 12, carbs: 26, category: 'breakfast' },
    { name: 'Granola Bar', calories: 190, proteins: 3, fats: 7, carbs: 29, category: 'snack' },
    { name: 'Cereal with Milk', calories: 220, proteins: 7, fats: 4, carbs: 38, category: 'breakfast' },
    { name: 'Avocado Toast', calories: 290, proteins: 7, fats: 16, carbs: 28, category: 'breakfast' },
    { name: 'Boiled Egg', calories: 78, proteins: 6, fats: 5, carbs: 0.6, category: 'breakfast' },
    { name: 'Muesli with Yogurt', calories: 240, proteins: 9, fats: 5, carbs: 40, category: 'breakfast' },
    // Lunch
    { name: 'Grilled Chicken Breast', calories: 165, proteins: 31, fats: 3.6, carbs: 0, category: 'protein' },
    { name: 'Caesar Salad', calories: 220, proteins: 12, fats: 14, carbs: 10, category: 'salad' },
    { name: 'Chicken Sandwich', calories: 380, proteins: 24, fats: 12, carbs: 40, category: 'lunch' },
    { name: 'Pasta Bolognese', calories: 490, proteins: 20, fats: 12, carbs: 68, category: 'lunch' },
    { name: 'Tuna Salad', calories: 280, proteins: 25, fats: 14, carbs: 12, category: 'salad' },
    { name: 'Grilled Chicken Salad', calories: 320, proteins: 28.5, fats: 5.2, carbs: 12, category: 'salad' },
    { name: 'Veggie Burger', calories: 350, proteins: 15, fats: 12, carbs: 42, category: 'lunch' },
    { name: 'Burrito Bowl', calories: 450, proteins: 22, fats: 14, carbs: 55, category: 'lunch' },
    { name: 'Tomato Soup', calories: 150, proteins: 4, fats: 5, carbs: 22, category: 'soup' },
    { name: 'Club Sandwich', calories: 420, proteins: 25, fats: 18, carbs: 38, category: 'lunch' },
    { name: 'Falafel Wrap', calories: 380, proteins: 13, fats: 18, carbs: 42, category: 'lunch' },
    { name: 'Fish Tacos (2)', calories: 340, proteins: 20, fats: 14, carbs: 32, category: 'lunch' },
    { name: 'Margherita Pizza (2 slices)', calories: 430, proteins: 16, fats: 14, carbs: 55, category: 'lunch' },
    { name: 'Lentil Soup', calories: 180, proteins: 12, fats: 3, carbs: 28, category: 'soup' },
    { name: 'Chicken Quesadilla', calories: 410, proteins: 22, fats: 20, carbs: 34, category: 'lunch' },
    // Dinner
    { name: 'Salmon Fillet', calories: 280, proteins: 30, fats: 16, carbs: 0, category: 'protein' },
    { name: 'Steak (200g)', calories: 460, proteins: 46, fats: 28, carbs: 0, category: 'protein' },
    { name: 'Salmon with Vegetables', calories: 212, proteins: 6.8, fats: 4.1, carbs: 15.6, category: 'dinner' },
    { name: 'Grilled Shrimp', calories: 200, proteins: 24, fats: 8, carbs: 2, category: 'dinner' },
    { name: 'Baked Chicken Thigh', calories: 230, proteins: 26, fats: 13, carbs: 0, category: 'dinner' },
    { name: 'Vegetable Stir Fry', calories: 180, proteins: 6, fats: 7, carbs: 24, category: 'dinner' },
    { name: 'Spaghetti Carbonara', calories: 520, proteins: 18, fats: 22, carbs: 60, category: 'dinner' },
    { name: 'Lamb Chops', calories: 380, proteins: 28, fats: 28, carbs: 0, category: 'dinner' },
    { name: 'Tofu Curry', calories: 250, proteins: 14, fats: 10, carbs: 28, category: 'dinner' },
    { name: 'Turkey Meatballs', calories: 220, proteins: 22, fats: 10, carbs: 8, category: 'dinner' },
    { name: 'Stuffed Bell Peppers', calories: 290, proteins: 14, fats: 10, carbs: 35, category: 'dinner' },
    { name: 'Mushroom Risotto', calories: 380, proteins: 8, fats: 12, carbs: 58, category: 'dinner' },
    // Rice & Grains
    { name: 'White Rice (1 cup)', calories: 206, proteins: 4.3, fats: 0.4, carbs: 45, category: 'grain' },
    { name: 'Brown Rice (1 cup)', calories: 216, proteins: 5, fats: 1.8, carbs: 45, category: 'grain' },
    { name: 'Quinoa (1 cup)', calories: 222, proteins: 8, fats: 3.5, carbs: 39, category: 'grain' },
    { name: 'Couscous (1 cup)', calories: 176, proteins: 6, fats: 0.3, carbs: 36, category: 'grain' },
    // Fruits
    { name: 'Apple', calories: 95, proteins: 0.5, fats: 0.3, carbs: 25, category: 'fruit' },
    { name: 'Orange', calories: 62, proteins: 1.2, fats: 0.2, carbs: 15, category: 'fruit' },
    { name: 'Strawberries (1 cup)', calories: 49, proteins: 1, fats: 0.5, carbs: 12, category: 'fruit' },
    { name: 'Blueberries (1 cup)', calories: 85, proteins: 1.1, fats: 0.5, carbs: 21, category: 'fruit' },
    { name: 'Mango', calories: 135, proteins: 1.1, fats: 0.6, carbs: 35, category: 'fruit' },
    { name: 'Grapes (1 cup)', calories: 104, proteins: 1.1, fats: 0.2, carbs: 27, category: 'fruit' },
    { name: 'Watermelon (2 cups)', calories: 92, proteins: 1.9, fats: 0.5, carbs: 23, category: 'fruit' },
    { name: 'Pineapple (1 cup)', calories: 82, proteins: 0.9, fats: 0.2, carbs: 22, category: 'fruit' },
    { name: 'Peach', calories: 59, proteins: 1.4, fats: 0.4, carbs: 14, category: 'fruit' },
    { name: 'Kiwi', calories: 42, proteins: 0.8, fats: 0.4, carbs: 10, category: 'fruit' },
    // Vegetables
    { name: 'Broccoli (1 cup)', calories: 55, proteins: 3.7, fats: 0.6, carbs: 11, category: 'vegetable' },
    { name: 'Spinach (1 cup)', calories: 7, proteins: 0.9, fats: 0.1, carbs: 1.1, category: 'vegetable' },
    { name: 'Sweet Potato', calories: 112, proteins: 2, fats: 0.1, carbs: 26, category: 'vegetable' },
    { name: 'Carrot', calories: 41, proteins: 0.9, fats: 0.2, carbs: 10, category: 'vegetable' },
    { name: 'Tomato', calories: 22, proteins: 1.1, fats: 0.2, carbs: 4.8, category: 'vegetable' },
    { name: 'Cucumber', calories: 16, proteins: 0.7, fats: 0.1, carbs: 3.6, category: 'vegetable' },
    { name: 'Bell Pepper', calories: 31, proteins: 1, fats: 0.3, carbs: 6, category: 'vegetable' },
    { name: 'Corn on the Cob', calories: 88, proteins: 3.3, fats: 1.4, carbs: 19, category: 'vegetable' },
    // Protein
    { name: 'Chicken Breast (100g)', calories: 165, proteins: 31, fats: 3.6, carbs: 0, category: 'protein' },
    { name: 'Tuna (canned, 100g)', calories: 116, proteins: 26, fats: 0.8, carbs: 0, category: 'protein' },
    { name: 'Cottage Cheese (1 cup)', calories: 206, proteins: 28, fats: 9, carbs: 6, category: 'dairy' },
    { name: 'Whey Protein Shake', calories: 120, proteins: 24, fats: 1, carbs: 3, category: 'supplement' },
    // Dairy
    { name: 'Whole Milk (250ml)', calories: 150, proteins: 8, fats: 8, carbs: 12, category: 'dairy' },
    { name: 'Skim Milk (250ml)', calories: 83, proteins: 8, fats: 0.2, carbs: 12, category: 'dairy' },
    { name: 'Cheese Slice', calories: 113, proteins: 7, fats: 9, carbs: 0.4, category: 'dairy' },
    { name: 'Butter (1 tbsp)', calories: 102, proteins: 0.1, fats: 12, carbs: 0, category: 'dairy' },
    // Snacks
    { name: 'Almonds (30g)', calories: 170, proteins: 6, fats: 15, carbs: 6, category: 'snack' },
    { name: 'Peanut Butter (2 tbsp)', calories: 190, proteins: 7, fats: 16, carbs: 7, category: 'snack' },
    { name: 'Dark Chocolate (30g)', calories: 170, proteins: 2, fats: 12, carbs: 13, category: 'snack' },
    { name: 'Popcorn (3 cups)', calories: 93, proteins: 3, fats: 1.1, carbs: 19, category: 'snack' },
    { name: 'Trail Mix (30g)', calories: 140, proteins: 4, fats: 9, carbs: 13, category: 'snack' },
    { name: 'Rice Cakes (2)', calories: 70, proteins: 1.4, fats: 0.4, carbs: 15, category: 'snack' },
    { name: 'Protein Bar', calories: 200, proteins: 20, fats: 7, carbs: 22, category: 'snack' },
    { name: 'Hummus (2 tbsp)', calories: 70, proteins: 2, fats: 5, carbs: 4, category: 'snack' },
    { name: 'Mixed Nuts (30g)', calories: 175, proteins: 5, fats: 16, carbs: 6, category: 'snack' },
    { name: 'Crackers (6 pcs)', calories: 120, proteins: 2, fats: 4, carbs: 20, category: 'snack' },
    // Drinks
    { name: 'Black Coffee', calories: 2, proteins: 0.3, fats: 0, carbs: 0, category: 'drink' },
    { name: 'Green Tea', calories: 0, proteins: 0, fats: 0, carbs: 0, category: 'drink' },
    { name: 'Latte', calories: 190, proteins: 10, fats: 7, carbs: 19, category: 'drink' },
    { name: 'Hot Chocolate', calories: 200, proteins: 8, fats: 6, carbs: 28, category: 'drink' },
    { name: 'Coca-Cola (330ml)', calories: 139, proteins: 0, fats: 0, carbs: 35, category: 'drink' },
    { name: 'Sparkling Water', calories: 0, proteins: 0, fats: 0, carbs: 0, category: 'drink' },
    { name: 'Protein Smoothie', calories: 250, proteins: 20, fats: 5, carbs: 30, category: 'drink' },
    { name: 'Coconut Water (250ml)', calories: 45, proteins: 1.7, fats: 0.5, carbs: 9, category: 'drink' },
    // Fast Food
    { name: 'Cheeseburger', calories: 530, proteins: 26, fats: 28, carbs: 42, category: 'fast_food' },
    { name: 'French Fries (medium)', calories: 365, proteins: 4, fats: 17, carbs: 48, category: 'fast_food' },
    { name: 'Chicken Nuggets (6)', calories: 280, proteins: 14, fats: 18, carbs: 16, category: 'fast_food' },
    { name: 'Hot Dog', calories: 290, proteins: 11, fats: 18, carbs: 22, category: 'fast_food' },
    { name: 'Fried Chicken (1 pc)', calories: 320, proteins: 22, fats: 20, carbs: 12, category: 'fast_food' },
    // Desserts
    { name: 'Ice Cream (1 scoop)', calories: 137, proteins: 2.3, fats: 7, carbs: 16, category: 'dessert' },
    { name: 'Chocolate Cake (slice)', calories: 350, proteins: 4, fats: 14, carbs: 50, category: 'dessert' },
    { name: 'Cookie (1 large)', calories: 220, proteins: 3, fats: 10, carbs: 30, category: 'dessert' },
    { name: 'Brownie', calories: 260, proteins: 3, fats: 13, carbs: 35, category: 'dessert' },
    { name: 'Donut', calories: 280, proteins: 4, fats: 14, carbs: 33, category: 'dessert' },
    { name: 'Cheesecake (slice)', calories: 400, proteins: 6, fats: 25, carbs: 38, category: 'dessert' },
    // Indian food
    { name: 'Dal (1 bowl)', calories: 180, proteins: 12, fats: 5, carbs: 22, category: 'lunch' },
    { name: 'Roti / Chapati', calories: 104, proteins: 3, fats: 3.7, carbs: 15, category: 'grain' },
    { name: 'Naan Bread', calories: 262, proteins: 9, fats: 5, carbs: 45, category: 'grain' },
    { name: 'Chicken Tikka (100g)', calories: 148, proteins: 22, fats: 5, carbs: 3, category: 'protein' },
    { name: 'Paneer Tikka (100g)', calories: 250, proteins: 18, fats: 18, carbs: 4, category: 'protein' },
    { name: 'Butter Chicken (1 bowl)', calories: 430, proteins: 28, fats: 24, carbs: 18, category: 'dinner' },
    { name: 'Biryani (1 plate)', calories: 490, proteins: 18, fats: 15, carbs: 70, category: 'lunch' },
    { name: 'Samosa (1 pc)', calories: 150, proteins: 3, fats: 8, carbs: 18, category: 'snack' },
    { name: 'Idli (2 pcs)', calories: 130, proteins: 4, fats: 0.4, carbs: 28, category: 'breakfast' },
    { name: 'Dosa', calories: 168, proteins: 4, fats: 3, carbs: 30, category: 'breakfast' },
    { name: 'Upma', calories: 200, proteins: 5, fats: 7, carbs: 30, category: 'breakfast' },
    { name: 'Poha', calories: 180, proteins: 3, fats: 5, carbs: 32, category: 'breakfast' },
    { name: 'Chole (1 bowl)', calories: 220, proteins: 10, fats: 8, carbs: 28, category: 'lunch' },
    { name: 'Raita (1 cup)', calories: 75, proteins: 4, fats: 3, carbs: 7, category: 'side' },
    // Asian
    { name: 'Sushi Roll (6 pcs)', calories: 250, proteins: 9, fats: 3, carbs: 46, category: 'lunch' },
    { name: 'Fried Rice (1 plate)', calories: 400, proteins: 10, fats: 14, carbs: 58, category: 'lunch' },
    { name: 'Ramen Bowl', calories: 450, proteins: 18, fats: 15, carbs: 60, category: 'dinner' },
    { name: 'Pad Thai', calories: 380, proteins: 14, fats: 12, carbs: 52, category: 'dinner' },
    { name: 'Spring Rolls (2)', calories: 130, proteins: 3, fats: 6, carbs: 16, category: 'snack' },
    // Misc
    { name: 'Egg Fried Rice', calories: 350, proteins: 12, fats: 10, carbs: 52, category: 'lunch' },
    { name: 'Wrap / Tortilla', calories: 120, proteins: 3, fats: 3, carbs: 20, category: 'grain' },
    { name: 'Pasta (plain, 1 cup)', calories: 220, proteins: 8, fats: 1.3, carbs: 43, category: 'grain' },
    { name: 'Bread (1 slice)', calories: 75, proteins: 2.6, fats: 1, carbs: 13, category: 'grain' },
    { name: 'Olive Oil (1 tbsp)', calories: 119, proteins: 0, fats: 14, carbs: 0, category: 'condiment' },
    { name: 'Honey (1 tbsp)', calories: 64, proteins: 0.1, fats: 0, carbs: 17, category: 'condiment' },
    { name: 'Peanuts (30g)', calories: 170, proteins: 7, fats: 14, carbs: 5, category: 'snack' },
    { name: 'Eggs Benedict', calories: 450, proteins: 22, fats: 28, carbs: 26, category: 'breakfast' }
  ];

  const defaultData = {
    profile: {
      gender: 'male',
      height: 167,
      weight: 70,
      goal: 'lose',
      activity: 'moderate'
    },
    dailyGoal: 1500,
    waterTarget: 8,
    today: getTodayKey(),
    meals: {},
    water: {},
    reminders: { breakfast: '08:00', lunch: '13:00', dinner: '19:00', enabled: false },
    hasOnboarded: false
  };

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.today !== getTodayKey()) {
          data.today = getTodayKey();
          data.meals[getTodayKey()] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
          save(data);
        }
        if (!data.meals[getTodayKey()]) {
          data.meals[getTodayKey()] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
          save(data);
        }
        // Ensure new fields
        if (!data.water) data.water = {};
        if (!data.reminders) data.reminders = defaultData.reminders;
        if (data.hasOnboarded === undefined) data.hasOnboarded = false;
        if (!data.waterTarget) data.waterTarget = 8;

        // MIGRATION: Clear fake data if it was accidentally saved
        const todayMeals = data.meals[getTodayKey()];
        if (todayMeals && todayMeals.breakfast && todayMeals.breakfast.some(m => m.id === 'b1' && m.name.includes('Pancakes'))) {
          data.meals[getTodayKey()] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
          save(data);
          if (typeof CloudSync !== 'undefined' && typeof auth !== 'undefined' && auth.currentUser) {
            CloudSync.saveMeals(getTodayKey(), data.meals[getTodayKey()]);
          }
        }

        return data;
      }
    } catch (e) { }
    const data = { ...defaultData };
    data.meals[getTodayKey()] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    save(data);
    return data;
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getState() { return load(); }

  function updateProfile(partial) {
    const data = load();
    Object.assign(data.profile, partial);
    save(data);
    return data;
  }

  function getTodayMeals() {
    const data = load();
    return data.meals[getTodayKey()] || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  }

  function addMeal(mealType, item) {
    const data = load();
    const key = getTodayKey();
    if (!data.meals[key]) data.meals[key] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    item.id = item.id || ('m' + Date.now());
    data.meals[key][mealType].push(item);
    save(data);
    return data;
  }

  function removeMeal(mealType, itemId) {
    const data = load();
    const key = getTodayKey();
    if (data.meals[key] && data.meals[key][mealType]) {
      data.meals[key][mealType] = data.meals[key][mealType].filter(m => m.id !== itemId);
      save(data);
    }
    return data;
  }

  function getTotals(dateKey) {
    const data = load();
    const meals = data.meals[dateKey || getTodayKey()] || { breakfast: [], lunch: [], dinner: [], snacks: [] };
    let cal = 0, proteins = 0, fats = 0, carbs = 0;
    for (const type of ['breakfast', 'lunch', 'dinner', 'snacks']) {
      for (const item of meals[type] || []) {
        cal += item.calories * item.qty;
        proteins += item.proteins * item.qty;
        fats += item.fats * item.qty;
        carbs += item.carbs * item.qty;
      }
    }
    return { cal: Math.round(cal), proteins: +proteins.toFixed(1), fats: +fats.toFixed(1), carbs: +carbs.toFixed(1) };
  }

  function getDailyGoal() { return load().dailyGoal; }

  function getFormattedToday() {
    const d = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  }

  // ---- Water Tracking ----
  function getWater() {
    const data = load();
    return data.water[getTodayKey()] || 0;
  }

  function setWater(glasses) {
    const data = load();
    if (!data.water) data.water = {};
    data.water[getTodayKey()] = Math.max(0, glasses);
    save(data);
    return data;
  }

  function getWaterTarget() {
    return load().waterTarget || 8;
  }

  // ---- Streak ----
  function getStreak() {
    const data = load();
    let streak = 0;
    const d = new Date();
    // Check today first
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      const meals = data.meals[key];
      if (meals) {
        const hasFood = ['breakfast', 'lunch', 'dinner', 'snacks'].some(t => (meals[t] || []).length > 0);
        if (hasFood) {
          streak++;
        } else if (i > 0) {
          break; // Skip today if no meals yet
        } else {
          break;
        }
      } else if (i > 0) {
        break;
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // ---- Weekly/Monthly Data for Charts ----
  function getWeeklyData() {
    const days = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(d);
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const totals = getTotals(key);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.push({
        label: dayNames[dt.getDay()],
        date: key,
        cal: totals.cal,
        proteins: totals.proteins,
        fats: totals.fats,
        carbs: totals.carbs
      });
    }
    return days;
  }

  function getMonthlyData() {
    const days = [];
    const d = new Date();
    for (let i = 29; i >= 0; i--) {
      const dt = new Date(d);
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const totals = getTotals(key);
      days.push({
        label: `${dt.getDate()}`,
        date: key,
        cal: totals.cal
      });
    }
    return days;
  }

  // ---- Reminders ----
  function getReminders() {
    const data = load();
    return data.reminders || defaultData.reminders;
  }

  function updateReminders(partial) {
    const data = load();
    if (!data.reminders) data.reminders = { ...defaultData.reminders };
    Object.assign(data.reminders, partial);
    save(data);
    return data;
  }

  // ---- Onboarding ----
  function hasOnboarded() {
    return load().hasOnboarded === true;
  }

  function completeOnboarding(profile) {
    const data = load();
    data.hasOnboarded = true;
    if (profile) Object.assign(data.profile, profile);
    save(data);
    return data;
  }

  // ---- Export CSV ----
  function exportCSV() {
    const data = load();
    const rows = [['Date', 'Meal', 'Food', 'Calories', 'Proteins', 'Fats', 'Carbs', 'Qty']];
    for (const [dateKey, dayMeals] of Object.entries(data.meals)) {
      for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks']) {
        for (const item of dayMeals[mealType] || []) {
          rows.push([dateKey, mealType, `"${item.name}"`, item.calories, item.proteins, item.fats, item.carbs, item.qty]);
        }
      }
    }
    return rows.map(r => r.join(',')).join('\n');
  }

  // ---- Food Search ----
  function searchFood(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q)).slice(0, 15);
  }

  function getFoodDatabase() { return FOOD_DATABASE; }

  // ---- Dark Mode ----
  function getDarkMode() {
    return localStorage.getItem('calorieai_darkmode') === 'true';
  }

  function setDarkMode(enabled) {
    localStorage.setItem('calorieai_darkmode', enabled ? 'true' : 'false');
    document.documentElement.setAttribute('data-theme', enabled ? 'dark' : 'light');
  }

  function initTheme() {
    const dark = getDarkMode();
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  // Cloud sync helpers
  function mergeCloudData(cloudData) {
    if (!cloudData) return;
    const data = load();
    if (cloudData.profile) data.profile = { ...data.profile, ...cloudData.profile };
    if (cloudData.dailyGoal) data.dailyGoal = cloudData.dailyGoal;
    if (cloudData.waterTarget) data.waterTarget = cloudData.waterTarget;
    if (cloudData.reminders) data.reminders = cloudData.reminders;
    if (typeof cloudData.hasOnboarded !== 'undefined') data.hasOnboarded = cloudData.hasOnboarded;
    save(data);
  }

  function syncToCloud() {
    if (typeof CloudSync !== 'undefined') {
      const data = load();
      CloudSync.saveToCloud(data);
    }
  }

  // Override save to also sync to cloud
  const origUpdateProfile = updateProfile;
  updateProfile = function (updates) {
    origUpdateProfile(updates);
    syncToCloud();
  };

  initTheme();

  return {
    getState, updateProfile, getTodayMeals, addMeal, removeMeal,
    getTotals, getDailyGoal, getFormattedToday,
    getWater, setWater, getWaterTarget,
    getStreak,
    getWeeklyData, getMonthlyData,
    getReminders, updateReminders,
    hasOnboarded, completeOnboarding,
    exportCSV, searchFood, getFoodDatabase,
    getDarkMode, setDarkMode, initTheme,
    mergeCloudData, syncToCloud
  };
})();

