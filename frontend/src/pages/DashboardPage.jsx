// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSummary, getOrdersByDate, getTopCustomers } from '../utils/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { subDays, format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [summary, setSummary] = useState({ totalCustomers: 0, totalOrders: 0, totalRevenue: 0 });
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadOrdersByDate();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
const summaryData = await getSummary(token);
const topCustomersData = await getTopCustomers(token);
      setSummary(summaryData);
      setTopCustomers(topCustomersData);
      loadOrdersByDate();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadOrdersByDate = async () => {
    if (!startDate || !endDate) return;
    try {
      const token = localStorage.getItem('token');
    const data = await getOrdersByDate(
  token,
  format(startDate, 'yyyy-MM-dd'),
  format(endDate, 'yyyy-MM-dd')
);
      setOrdersByDate(data);
    } catch (error) {
      console.error('Error loading orders by date:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
    <h1 className="text-3xl font-bold text-blue-500">DashBoard!</h1>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

     {/* KPI Cards */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
  <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <h3 style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
      Total Customers
    </h3>
    <h2 style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>
      {summary.totalCustomers.toLocaleString()}
    </h2>
  </div>
  <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <h3 style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
      Total Orders
    </h3>
    <h2 style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>
      {summary.totalOrders.toLocaleString()}
    </h2>
  </div>
  <div style={{ padding: '20px', backgroundColor: '#1e293b', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <h3 style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
      Total Revenue
    </h3>
    <h2 style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: '700' }}>
      ₹{summary.totalRevenue.toLocaleString()}
    </h2>
  </div>
</div>

    {/* Date Range Filter */}
<div className="filter-section">
  <h3 className="filter-title">Filter by Date Range</h3>
  <div className="date-picker-group">
    <DatePicker
      selected={startDate}
      onChange={(update) => {
        setDateRange([update, endDate]);
      }}
      selectsStart
      startDate={startDate}
      endDate={endDate}
      dateFormat="yyyy-MM-dd"
      placeholderText="Start Date"
      className="date-picker"
    />
    <span style={{ color: '#cbd5e1', alignSelf: 'center' }}>to</span>
    <DatePicker
      selected={endDate}
      onChange={(update) => {
        setDateRange([startDate, update]);
      }}
      selectsEnd
      startDate={startDate}
      endDate={endDate}
      minDate={startDate}
      dateFormat="yyyy-MM-dd"
      placeholderText="End Date"
      className="date-picker"
    />
  </div>
</div>
      {/* Line Chart: Orders by Date */}
      <div style={{ marginBottom: '40px' }}>
        <h2>📈 Revenue Over Time</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ordersByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Top 5 Customers */}
      <div>
        <h2>🥇 Top 5 Customers by Spend</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(item) => `${item.firstName} ${item.lastName}`} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="totalSpent" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}