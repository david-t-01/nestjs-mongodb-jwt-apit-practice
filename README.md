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

## Configuration

### Step 1. Get the connection string of your MongoDB server

In the case of MongoDB Atlas, it should be a string like this:

```shell
mongodb+srv://<username>:<password>@my-project-abc123.mongodb.net/test?retryWrites=true&w=majority
```

For more details, follow this [MongoDB Guide](https://docs.mongodb.com/guides/server/drivers/) on how to connect to MongoDB.

### Step 2. Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):

```bash
cp .env.local.example .env.local
```

Then set each variable on `.env.local`:

- `MONGODB_URI` should be the MongoDB connection string you got from step 1.

### Step 3. Run Next.js in development mode

```bash
npm install
npm run dev
# or
yarn install
yarn dev
# or
pnpm install
pnpm dev
```

Your app should be up and running on [http://localhost:3000](http://localhost:3000)!
