const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const depthLimit = require('graphql-depth-limit');
require('dotenv').config();

const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const authMiddleware = require('./middleware/auth');
const {connectDB} = require('./config/database');
const createDataLoaders = require('./loaders/dataLoaders');
const { formatError, DateType } = require('./utils/helpers');

async function startServer() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  });
  app.use('/graphql', limiter);

  // CORS
  app.use(cors());

  // Connect to database
  await connectDB();

  // Add Date scalar to resolvers
  resolvers.Date = DateType;

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const authData = await authMiddleware(req);
      const dataloaders = createDataLoaders();
      
      return {
        ...authData,
        dataloaders
      };
    },
    validationRules: [
      depthLimit(7), // Limit query depth to 7
    ],
    formatError,
    playground: process.env.NODE_ENV !== 'production',
    introspection: process.env.NODE_ENV !== 'production'
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`GraphQL Playground available in development mode`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
});