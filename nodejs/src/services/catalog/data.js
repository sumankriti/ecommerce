'use strict';

const CATEGORIES = [
  { id: 'cat_001', name: 'Electronics' },
  { id: 'cat_002', name: 'Fashion' },
  { id: 'cat_003', name: 'Home' },
];

const PRODUCTS = [
  {
    id: 'prd_001',
    name: 'Noise Cancelling Headphones',
    price: 199.99,
    currency: 'USD',
    inventory: 24,
    categoryId: 'cat_001',
  },
  {
    id: 'prd_002',
    name: 'Minimal Sneaker',
    price: 89.0,
    currency: 'USD',
    inventory: 53,
    categoryId: 'cat_002',
  },
  {
    id: 'prd_003',
    name: 'Ceramic Table Lamp',
    price: 64.5,
    currency: 'USD',
    inventory: 18,
    categoryId: 'cat_003',
  },
];

module.exports = {
  CATEGORIES,
  PRODUCTS,
};
