// menuData.js

export const menuItems = [
  {
    id: 1,
    name: "Butter Chicken",
    description: "Tender chicken in creamy tomato sauce",
    price: 12.99,
    imageSrc: "/Images/biryani-rice-dish.jpg", // Replace with your actual image path/URL
    category: "Indian",
    customizations: [], // No customizations for Butter Chicken for now
    addons: []          
  },
  {
    id: 2,
    name: "Hyderabadi Biryani",
    description: "Fragrant rice with spiced meat",
    price: 11.99,
    imageSrc: "/Images/butter-chicken-curry.png", // Replace with your actual image path/URL
    category: "Indian",
    customizations: [
      {
        id: "biryani_choice",
        name: "Protein Choice",
        type: "radio", // or "select" for dropdown
        options: [
          { value: "chicken", label: "Chicken", price_impact: 0 },
          { value: "mutton", label: "Mutton", price_impact: 2.00 }, // Example: Mutton costs $2 more
          { value: "vegetarian", label: "Vegetarian", price_impact: -1.00 }, // Example: Vegetarian costs $1 less
        ],
        required: true,
      },
    ],
    addons: [
      { id: "raita", name: "Raita", price: 1.99 },
      { id: "pickle", name: "Pickle", price: 0.99 },
      { id: "coke", name: "Coca-Cola", price: 2.50 }, // Example addon
    ],
  },
  {
    id: 3,
    name: "Samosa (3 pcs)",
    description: "Crispy pastry with spiced filling",
    price: 4.99,
    imageSrc: "/Images/cappuccino-coffee.png", // Replace with your actual image path/URL
    category: "Indian",
    customizations: [],
    addons: []
  },
  {
    id: 4,
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with spices",
    price: 9.99,
    imageSrc: "/Images/samosa-fried-pastry.jpg", // Replace with your actual image path/URL
    category: "Indian",
    customizations: [],
    addons: []
  },
  {
    id: 5,
    name: "Garlic Naan",
    description: "Soft flatbread with garlic butter",
    price: 3.99,
    imageSrc: "/Images/steamed-dumplings.jpg", // Replace with your actual image path/URL
    category: "Chinese",
    customizations: [],
    addons: []
  },
  // Add more items here for other categories (Italian, Chinese, etc.)
];