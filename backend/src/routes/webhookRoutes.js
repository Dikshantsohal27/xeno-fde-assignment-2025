// backend/src/routes/webhookRoutes.js

const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// POST /api/webhooks/shopify
router.post('/shopify', express.raw({ type: 'application/json' }), async (req, res) => {
  const shopifyDomain = req.headers['x-shopify-shop-domain'];
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const topic = req.headers['x-shopify-topic'];

  if (!shopifyDomain || !hmac || !topic) {
    return res.status(400).send('Missing required headers');
  }

  // Verify HMAC signature
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET || 'your-webhook-secret')
    .update(req.body)
    .digest('base64');

  if (hash !== hmac) {
    console.error('❌ Webhook signature verification failed');
    return res.status(401).send('Invalid signature');
  }

  try {
    // Get tenant by shopifyDomain
    const tenant = await prisma.tenant.findUnique({
      where: { shopifyDomain },
    });

    if (!tenant) {
      console.error(`❌ Tenant not found for domain: ${shopifyDomain}`);
      return res.status(404).send('Tenant not found');
    }

    const payload = JSON.parse(req.body);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreate(payload, tenant.id);
        break;
      case 'customers/create':
        await handleCustomerCreate(payload, tenant.id);
        break;
      default:
        console.log(`ℹ️ Unhandled webhook topic: ${topic}`);
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).send('Internal server error');
  }
});

// Handle new order
async function handleOrderCreate(orderData, tenantId) {
  try {
    // Upsert customer first (if exists)
    let customerId = null;
    if (orderData.customer?.id) {
      const shopifyCustomerId = orderData.customer.id.toString();
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          shopifyCustomerId,
          tenantId,
        },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const newCustomer = await prisma.customer.create({
          data: {
            shopifyCustomerId,
            tenantId,
            email: orderData.customer.email || null,
            firstName: orderData.customer.first_name || null,
            lastName: orderData.customer.last_name || null,
            totalSpent: parseFloat(orderData.customer.total_spent || 0),
          },
        });
        customerId = newCustomer.id;
      }
    }

    // Create order
    await prisma.order.create({
      data: {
        shopifyOrderId: orderData.id.toString(),
        tenantId,
        customerId,
        totalPrice: parseFloat(orderData.total_price),
        currency: orderData.currency,
        createdAt: new Date(orderData.created_at),
      },
    });

    console.log(`✅ Order ${orderData.id} ingested for tenant ${tenantId}`);
  } catch (error) {
    console.error('❌ Error handling order create:', error);
    throw error;
  }
}

// Handle new customer
async function handleCustomerCreate(customerData, tenantId) {
  try {
    await prisma.customer.upsert({
      where: {
        shopifyCustomerId: customerData.id.toString(),
      },
      update: {
        email: customerData.email || null,
        firstName: customerData.first_name || null,
        lastName: customerData.last_name || null,
        totalSpent: parseFloat(customerData.total_spent || 0),
      },
      create: {
        shopifyCustomerId: customerData.id.toString(),
        tenantId,
        email: customerData.email || null,
        firstName: customerData.first_name || null,
        lastName: customerData.last_name || null,
        totalSpent: parseFloat(customerData.total_spent || 0),
      },
    });

    console.log(`✅ Customer ${customerData.id} ingested for tenant ${tenantId}`);
  } catch (error) {
    console.error('❌ Error handling customer create:', error);
    throw error;
  }
}

module.exports = router;