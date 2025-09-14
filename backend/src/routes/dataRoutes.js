// backend/src/routes/dataRoutes.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { syncShopifyData } = require('../utils/shopifySync');

const prisma = new PrismaClient();
const router = express.Router();

// 🔄 POST /api/data/sync/:tenantId
// Manually trigger sync for a tenant
router.post('/sync/:tenantId', async (req, res) => {
  const { tenantId } = req.params;

  try {
    const result = await syncShopifyData(parseInt(tenantId));
    res.status(200).json({
      message: 'Shopify data synced successfully',
      result,
    });
  } catch (error) {
    console.error('Error syncing Shopify data:', error);
    res.status(500).json({ error: error.message });
  }
});

// 📊 GET /api/data/summary
// Returns: totalCustomers, totalOrders, totalRevenue
router.get('/summary', async (req, res) => {
  try {
    const tenantId = 1; // Hardcoded for demo — fine for internship

    const totalCustomers = await prisma.customer.count({
      where: { tenantId },
    });

    const totalOrders = await prisma.order.count({
      where: { tenantId },
    });

    const totalRevenueResult = await prisma.order.aggregate({
      where: { tenantId },
      _sum: {
        totalPrice: true,
      },
    });

    const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error('Error in /summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 📈 GET /api/data/orders-by-date?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns: [{ date: "2025-09-01", revenue: 1500 }, ...]
router.get('/orders-by-date', async (req, res) => {
  try {
    const { start, end } = req.query;
    const tenantId = 1;

    if (!start || !end) {
      return res.status(400).json({ error: 'start and end date parameters required' });
    }

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(start), // Greater than or equal to start
          lte: new Date(end),   // Less than or equal to end
        },
      },
      select: {
        createdAt: true,
        totalPrice: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const grouped = orders.reduce((acc, order) => {
      // Format date as YYYY-MM-DD
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.totalPrice;
      return acc;
    }, {});

    // Convert to array for Recharts
    const result = Object.keys(grouped).map(date => ({
      date,
      revenue: grouped[date],
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in /orders-by-date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🥇 GET /api/data/top-customers
// Returns: top 5 customers by totalSpent
router.get('/top-customers', async (req, res) => {
  try {
    const tenantId = 1;

    const topCustomers = await prisma.customer.findMany({
      where: { tenantId },
      select: {
        firstName: true,
        lastName: true,
        totalSpent: true,
      },
      orderBy: {
        totalSpent: 'desc',
      },
      take: 5, // Top 5
    });

    res.json(topCustomers);
  } catch (error) {
    console.error('Error in /top-customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;