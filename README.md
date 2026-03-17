# NestJS API

## Objective

Develop a Node.js API using NestJS, connected to MongoDB with @nestjs/mongoose, and implement JWT for authentication.

## Requirements

Create data Models

1. Product: must include name, SKU, picture (file upload), and price.
2. Order: must include an identifier, client name, total, and the list of products.

Endpoints

1. `/products`
   1. Create a product.
   2. Retrieve a product by its identifier.
   3. Search products with support for:
      1. Pagination
      2. Sorting
      3. Exact match filtering
      4. Criteria-based search
2. `/orders`
   1. Create an order.
   2. Update an order.
   3. Get the total sold price within the last month.
   4. Get the order with the highest total amount.

Authentication

Implement JWT as the authentication strategy.

Project dockerized contains a MongoDB instance and the Node.js API.
