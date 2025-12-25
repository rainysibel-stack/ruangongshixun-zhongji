const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const shoppingItemRoutes = require('./routes/shoppingItemRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRecipeRoutes = require('./routes/userRecipeRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Compress all responses
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/fridges', fridgeRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shoppingitems', shoppingItemRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/user-recipes', userRecipeRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Database Connection and Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database (be careful with force: true in production)
    await sequelize.sync({ alter: true }); 
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
