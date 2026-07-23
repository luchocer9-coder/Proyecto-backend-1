require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');

const connectDB = require('./config/db');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');
const { productManager } = require('./dao/factory');

const PORT = process.env.PORT || 8080;
const PERSISTENCE = process.env.PERSISTENCE || 'mongo';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Guardamos io para poder emitir eventos desde los routers
app.set('io', io);

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// WebSockets
io.on('connection', async (socket) => {
  console.log('🔌 Cliente conectado por WebSocket:', socket.id);

  try {
    const result = await productManager.getProducts({ limit: 100, page: 1 });
    socket.emit('updateProducts', result.docs);
  } catch (error) {
    console.error('Error enviando productos iniciales por socket:', error.message);
  }

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Manejo básico de errores (middleware final)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
});

const startServer = async () => {
  if (PERSISTENCE === 'mongo') {
    await connectDB();
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
