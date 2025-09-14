
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const syncShopifyData = async (tenantId) => {
  try {
    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant with ID ${tenantId} not found`);
    }

    const { shopifyDomain, accessToken } = tenant;
    const headers = {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    };

    // 1. Fetch Customers
    console.log('🔄 Fetching customers...');
    const customersRes = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-04/customers.json`,
      { headers }
    );

    const customerData = customersRes.data.customers.map(c => ({
      shopifyCustomerId: c.id.toString(),
      tenantId,
      email: c.email || null,
      firstName: c.first_name || null,
      lastName: c.last_name || null,
      totalSpent: parseFloat(c.total_spent),
    }));

    await prisma.customer.createMany({
      data: customerData,
      skipDuplicates: true,
    });

    console.log(`✅ ${customerData.length} customers synced`);

    // 2. Fetch Products
    console.log('🔄 Fetching products...');
    const productsRes = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-04/products.json`,
      { headers }
    );

    const productData = productsRes.data.products.map(p => ({
      shopifyProductId: p.id.toString(),
      tenantId,
      title: p.title,
      price: parseFloat(p.variants[0]?.price || 0),
    }));

    await prisma.product.createMany({
      data: productData,
      skipDuplicates: true,
    });

    console.log(`✅ ${productData.length} products synced`);

    // 3. Fetch Orders
    console.log('🔄 Fetching orders...');

    // 👇 STEP: Create customer lookup map
    const existingCustomers = await prisma.customer.findMany({
      where: { tenantId },
      select: {
        id: true,
        shopifyCustomerId: true,
      },
    });

    const customerMap = {};
    existingCustomers.forEach(c => {
      customerMap[c.shopifyCustomerId] = c.id; // Map Shopify ID → Your internal ID
    });

    const ordersRes = await axios.get(
      `https://${shopifyDomain}/admin/api/2024-04/orders.json?status=any`,
      { headers }
    );

    const orderData = ordersRes.data.orders.map(o => {
      let internalCustomerId = null;
      if (o.customer?.id) {
        const shopifyCustomerId = o.customer.id.toString();
        internalCustomerId = customerMap[shopifyCustomerId] || null;
      }

      return {
        shopifyOrderId: o.id.toString(),
        tenantId,
        customerId: internalCustomerId, // ← Use internal ID, not Shopify ID
        totalPrice: parseFloat(o.total_price),
        currency: o.currency,
        createdAt: new Date(o.created_at),
      };
    });

    await prisma.order.createMany({
      data: orderData,
      skipDuplicates: true,
    });

    console.log(`✅ ${orderData.length} orders synced`);

    return {
      customers: customerData.length,
      products: productData.length,
      orders: orderData.length,
    };

  } catch (error) {
    console.error('❌ Error syncing Shopify data:', error.message);
    throw error;
  }
};

module.exports = { syncShopifyData };