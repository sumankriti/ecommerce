'use strict';

const ORDERS = [
  {
    id: 'ord_001',
    userId: 'usr_001',
    status: 'PROCESSING',
    items: [
      { productId: 'prd_001', quantity: 1, unitPrice: 199.99 },
      { productId: 'prd_003', quantity: 2, unitPrice: 64.5 },
    ],
    total: 328.99,
  },
];

module.exports = {
  ORDERS,
};
