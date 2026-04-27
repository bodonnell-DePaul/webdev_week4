/**
 * slow-queries.js — Intentionally Inefficient Database Patterns
 *
 * CSC 436 Week 4 Exercise — Part 4
 *
 * This file contains functions with performance problems.
 * Your task: identify each issue, explain WHY it's slow,
 * and write the corrected version.
 *
 * Run: node slow-queries.js
 * (Requires the database to be seeded first: npx prisma db seed)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] }); // Log all SQL queries

// ============================================================
// PROBLEM 1: Loading orders with user details
// How many database queries does this function make?
// ============================================================
async function getOrdersWithUsers() {
  console.log('\n--- Problem 1: getOrdersWithUsers ---');
  console.log('Watch the SQL queries logged below:\n');

  // Step 1: Get all orders
  const orders = await prisma.order.findMany();

  // Step 2: For each order, fetch the user separately
  const results = [];
  for (const order of orders) {
    const user = await prisma.user.findUnique({
      where: { id: order.userId }
    });
    results.push({ ...order, user });
  }

  console.log(`\nFetched ${results.length} orders`);
  // TODO: How many queries were made? What's the fix?
  return results;
}

// ============================================================
// PROBLEM 2: Getting product details for each order item
// This function has NESTED N+1 queries!
// ============================================================
async function getOrderDetails(orderId) {
  console.log('\n--- Problem 2: getOrderDetails ---');
  console.log('Watch the SQL queries logged below:\n');

  // Get the order
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  // Get order items one by one
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: order.id }
  });

  // For each order item, get the product
  for (const item of orderItems) {
    item.product = await prisma.product.findUnique({
      where: { id: item.productId }
    });

    // And for each product, get the category!
    item.product.category = await prisma.category.findUnique({
      where: { id: item.product.categoryId }
    });
  }

  order.items = orderItems;
  console.log(`\nFetched order #${orderId} with ${orderItems.length} items`);
  // TODO: How many queries for an order with 5 items? What's the fix?
  return order;
}

// ============================================================
// PROBLEM 3: Counting products per category
// This fetches ALL data just to count!
// ============================================================
async function getCategoryCounts() {
  console.log('\n--- Problem 3: getCategoryCounts ---');
  console.log('Watch the SQL queries logged below:\n');

  const categories = await prisma.category.findMany();
  const counts = [];

  for (const category of categories) {
    // Fetches ALL products just to count them
    const products = await prisma.product.findMany({
      where: { categoryId: category.id }
    });
    counts.push({
      category: category.name,
      productCount: products.length // Getting count by loading everything!
    });
  }

  console.log('\nCategory counts:', counts);
  // TODO: How can you get counts without loading all product data?
  return counts;
}

// ============================================================
// PROBLEM 4: Searching for products
// This loads ALL products then filters in JavaScript!
// ============================================================
async function searchProducts(searchTerm) {
  console.log(`\n--- Problem 4: searchProducts("${searchTerm}") ---`);
  console.log('Watch the SQL queries logged below:\n');

  // Load ALL products from the database
  const allProducts = await prisma.product.findMany({
    include: { category: true }
  });

  // Filter in JavaScript instead of in the database query
  const results = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(`\nFound ${results.length} products matching "${searchTerm}"`);
  console.log(`(Loaded ${allProducts.length} total products to find them)`);
  // TODO: Why is this inefficient? How should filtering be done?
  return results;
}

// ============================================================
// Run all problems
// ============================================================
async function main() {
  console.log('='.repeat(60));
  console.log('SLOW QUERIES ANALYSIS');
  console.log('Look at the SQL query logs to understand the problems.');
  console.log('='.repeat(60));

  try {
    await getOrdersWithUsers();
    await getOrderDetails(1);
    await getCategoryCounts();
    await searchProducts('laptop');
  } catch (error) {
    console.error('\nError running queries:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Run: npx prisma migrate dev --name init');
    console.log('2. Run: npx prisma db seed');
    console.log('3. Extended the schema with User and OrderItem models');
  } finally {
    await prisma.$disconnect();
  }
}

main();
