
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// POST /api/tenants/register
router.post('/register', async (req, res) => {
  const { shopifyDomain, accessToken } = req.body;

  if (!shopifyDomain || !accessToken) {
    return res.status(400).json({ error: 'shopifyDomain and accessToken are required' });
  }

  try {
    // Check if tenant already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { shopifyDomain },
    });

    if (existingTenant) {
      return res.status(409).json({ error: 'Tenant already registered' });
    }

    // Create new tenant
    const tenant = await prisma.tenant.create({
      data: {
        shopifyDomain,
        accessToken,
        name: shopifyDomain.split('.')[0], // e.g., "ac-va"
      },
    });

    res.status(201).json({
      message: 'Tenant registered successfully',
      tenant: {
        id: tenant.id,
        shopifyDomain: tenant.shopifyDomain,
      },
    });
  } catch (error) {
    console.error('Error registering tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;