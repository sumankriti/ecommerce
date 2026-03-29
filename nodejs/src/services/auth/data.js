'use strict';

const USERS = [
  {
    id: 'usr_001',
    email: 'admin@nexus.com',
    password: 'password1',
    name: 'Alice Admin',
    roles: ['ADMIN'],
  },
  {
    id: 'usr_002',
    email: 'user@nexus.com',
    password: 'password1',
    name: 'Bob User',
    roles: ['USER'],
  },
  {
    id: 'usr_003',
    email: 'super@nexus.com',
    password: 'password1',
    name: 'Carol Super',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

const refreshTokenStore = new Map();

module.exports = {
  USERS,
  refreshTokenStore,
};
