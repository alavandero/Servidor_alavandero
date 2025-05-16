import express from 'express';
  import { createServer } from 'http';
  import { Server } from 'socket.io';
  import { engine } from 'express-handlebars';
  import path from 'path';
  import { fileURLToPath } from 'url';
  import mongoose from 'mongoose';
  import productsRouter from './routes/products.router.js';
  import cartsRouter from './routes/carts.router.js';
  import dotenv from 'dotenv';

  dotenv.config();

  // Crear servidor Express y HTTP
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  // Obtener __dirname en módulos ES
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Conectar a MongoDB
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

  // Configurar Handlebars
  app.engine('handlebars', engine({
    defaultLayout: false
  }));
  app.set('view engine', 'handlebars');
  app.set('views', path.join(__dirname, 'views'));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Rutas de vistas
  app.get('/', async (req, res) => {
    res.redirect('/products');
  });

  app.get('/products', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query, category, status } = req.query;
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);
      if (page) queryParams.append('page', page);
      if (sort) queryParams.append('sort', sort);
      if (query) queryParams.append('query', query);
      if (category) queryParams.append('category', category);
      if (status === 'true' || status === 'false') queryParams.append('status', status);
  
      const response = await fetch(`http://localhost:${process.env.PORT || 8080}/api/products?${queryParams}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log('API response:', data);
      res.render('index', data);
    } catch (error) {
      console.error('Error in /products:', error);
      res.status(500).send('Error loading products');
    }
  });
  
  app.get('/products/:pid', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 8080}/api/products/${req.params.pid}`);
      const product = await response.json();
      if (!product) throw new Error('Product not found');
      res.render('productDetail', { product });
    } catch (error) {
      res.status(404).send('Product not found');
    }
  });

  app.get('/carts/:cid', async (req, res) => {
    try {
      const response = await fetch(`http://localhost:${process.env.PORT || 8080}/api/carts/${req.params.cid}`);
      const cart = await response.json();
      if (!cart) throw new Error('Cart not found');
      res.render('cart', { cart });
    } catch (error) {
      res.status(404).send('Cart not found');
    }
  });

  app.get('/realtimeproducts', async (req, res) => {
    const response = await fetch(`http://localhost:${process.env.PORT || 8080}/api/products`);
    const products = await response.json();
    res.render('realTimeProducts', { products: products.payload });
  });

  // Rutas API
  app.use('/api/products', productsRouter);
  app.use('/api/carts', cartsRouter);

  // WebSocket
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('addProduct', async (product) => {
      try {
        const response = await fetch(`http://localhost:${process.env.PORT || 8080}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
        const newProduct = await response.json();
        const productsResponse = await fetch(`http://localhost:${process.env.PORT || 8080}/api/products`);
        const products = await productsResponse.json();
        io.emit('updateProducts', products.payload);
      } catch (error) {
        socket.emit('error', 'Error al agregar producto');
      }
    });

    socket.on('deleteProduct', async (id) => {
      try {
        await fetch(`http://localhost:${process.env.PORT || 8080}/api/products/${id}`, { method: 'DELETE' });
        const response = await fetch(`http://localhost:${process.env.PORT || 8080}/api/products`);
        const products = await response.json();
        io.emit('updateProducts', products.payload);
      } catch (error) {
        socket.emit('error', 'Error al eliminar producto');
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });