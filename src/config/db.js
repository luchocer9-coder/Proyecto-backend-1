const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ecommerce';

  try {
    await mongoose.connect(mongoUrl);
    console.log(`✅ Conectado a MongoDB -> base de datos: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
