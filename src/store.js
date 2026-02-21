/* ============================================================
   CalorieAI — Data Store (localStorage-backed)
   ============================================================ */

const Store = (() => {
  const STORAGE_KEY = 'calorieai_data';

  const defaultData = {
    profile: {
      gender: 'male',
      height: 167,
      weight: 70,
      goal: 'lose',        // lose | keep | gain
      activity: 'moderate' // sedentary | light | moderate | active | very_active
    },
    dailyGoal: 1500,
    today: getTodayKey(),
    meals: {}
  };

  // Seed data for demo
  function seedMeals() {
    return {
      breakfast: [
        {
          id: 'b1',
          name: 'Pancakes with caramel, strawberries and nuts',
          calories: 568,
          proteins: 6.6,
          fats: 5.1,
          carbs: 40,
          qty: 1
        },
        {
          id: 'b2',
          name: 'Cappuccino',
          calories: 90,
          proteins: 3.4,
          fats: 3.8,
          carbs: 9.5,
          qty: 1
        }
      ],
      lunch: [
        {
          id: 'l1',
          name: 'Grilled chicken salad',
          calories: 320,
          proteins: 28.5,
          fats: 5.2,
          carbs: 12.0,
          qty: 1
        }
      ],
      dinner: [
        {
          id: 'd1',
          name: 'Salmon with vegetables',
          calories: 212,
          proteins: 6.8,
          fats: 4.1,
          carbs: 15.6,
          qty: 1
        }
      ],
      snacks: []
    };
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // If stored date is not today, reset meals
        if (data.today !== getTodayKey()) {
          data.today = getTodayKey();
          data.meals[getTodayKey()] = seedMeals();
          save(data);
        }
        // Ensure current day has meals
        if (!data.meals[getTodayKey()]) {
          data.meals[getTodayKey()] = seedMeals();
          save(data);
        }
        return data;
      }
    } catch (e) { }
    // First launch — seed
    const data = { ...defaultData };
    data.meals[getTodayKey()] = seedMeals();
    save(data);
    return data;
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getState() {
    return load();
  }

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

  function getTotals() {
    const meals = getTodayMeals();
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

  function getMealTotal(mealType) {
    const meals = getTodayMeals();
    let total = 0;
    for (const item of meals[mealType] || []) {
      total += item.calories * item.qty;
    }
    return Math.round(total);
  }

  function getDailyGoal() {
    return load().dailyGoal;
  }

  function getFormattedToday() {
    const d = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  }

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

  // Apply theme immediately on script load
  initTheme();

  return {
    getState,
    updateProfile,
    getTodayMeals,
    addMeal,
    removeMeal,
    getTotals,
    getMealTotal,
    getDailyGoal,
    getFormattedToday,
    getDarkMode,
    setDarkMode,
    initTheme
  };
})();
