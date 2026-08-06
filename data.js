// Shared menu data — single source of truth for every page.
// Prices are in Leones (Le), stored as [min, max] per original site content.
const MENU_ITEMS = [
  {
    id: "grilled-chicken",
    name: "Grilled Half Chicken",
    category: "grills",
    desc: "Seasoned with tradition, and grilled to perfection over open flame.",
    price: [150,200],
    image: "images/Grilled Half Chickens.jfif",
    icon: "fa-drumstick-bite",
    rating: 5,
    badge: "Popular"
  },
{
  id: "goat-meat",
  name: "Goat Meat",
  category: "grills",
  desc: "Slow-grilled goat meat, smoky and tender, cut fresh to order.",
  price: [100 , 120],
  image: "images/goat.jpg.jfif.jfif",
  icon: "fa-fire",
  rating: 4,
  badge: "Popular"
}, 
  {
    id: "shawarma",
    name: "Chicken Shawarma",
    category: "wraps",
    desc: "Slow-roasted chicken wrapped up with creamy garlic sauce.",
    price: [80, 100],
    image: "images/Chicken Shawarma with Creamy Garlic Sauce.jfif",
    icon: "fa-pepper-hot",
    rating: 4,
    badge: "Popular"
  },
  {
    id: "fried-chicken-meal",
    name: "Fried Chicken Meal",
    category: "grills",
    desc: "Crispy fried chicken with french fries and nuggets on the side.",
    price: [150, 200],
    image: "images/Fried chicken with french fries and nuggets meal.jfif",
    icon: "fa-drumstick-bite",
    rating: 4,
    badge: "Best Seller"
  },
  {
    id: "meat-pie",
    name: "Meat-Pie",
    category: "snacks",
    desc: "Flaky pastry packed with seasoned minced meat, baked fresh daily.",
    price: [35, 50],
    image:  "images/meatpie.jfif",
    icon: "fa-cookie",
    rating: 4
  },
  {
    id: "egg-roll",
    name: "Egg Roll",
    category: "snacks",
    desc: "Crisp golden pastry wrapped around a boiled egg centre.",
    price: [30, 35],
    image: "images/Egg roll.jfif",
    icon: "fa-egg",
    rating: 4
  },
 {
  id: "cold-drinks",
  name: "Cold Drinks",
  category: "drinks",
  desc: "A chilled lineup of soft drinks, juices and bottled water.",
  price: [20, 30],
  image: "images/cold drinks.jpg.jfif.jfif",
  icon: "fa-glass-water",
  rating: 4
},
];

const CATEGORIES = [
  { id: "grills", label: "Grills", icon: "fa-fire" },
  { id: "wraps", label: "Wraps", icon: "fa-pepper-hot" },
  { id: "snacks", label: "Snacks", icon: "fa-cookie" },
  { id: "drinks", label: "Drinks", icon: "fa-glass-water" }
];