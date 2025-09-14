// frontend/src/utils/api.js

const API_BASE_URL = 'http://localhost:5000';

// Auth API
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
};

// Dashboard APIs
export const getSummary = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/data/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }
  return response.json();
};

export const getOrdersByDate = async (token, startDate, endDate) => {
  const response = await fetch(
    `${API_BASE_URL}/api/data/orders-by-date?start=${startDate}&end=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch orders by date');
  }
  return response.json();
};

export const getTopCustomers = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/data/top-customers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch top customers');
  }
  return response.json();
};