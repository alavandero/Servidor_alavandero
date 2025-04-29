import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import ProductManager from './managers/ProductManager.js';

// Crear servidor Express y HTTP
const app = express();
const server = createServer(app);
const io = new Server(server);

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar Handlebars
app.engine('handlebars', engine({
  defaultLayout: false // Deshabilitar layout por defecto
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Instanciar ProductManager
const productManager = new ProductManager();

// Rutas de vistas
app.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', { products });
});

app.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('realTimeProducts', { products });
});

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Manejar creación de producto
  socket.on('addProduct', async (product) => {
    try {
      const newProduct = await productManager.addProduct(product);
      const products = await productManager.getProducts();
      io.emit('updateProducts', products); // Emitir a todos los clientes
    } catch (error) {
      socket.emit('error', 'Error al agregar producto');
    }
  });

  // Manejar eliminación de producto
  socket.on('deleteProduct', async (id) => {
    try {
      await productManager.deleteProduct(Number(id));
      const products = await productManager.getProducts();
      io.emit('updateProducts', products); // Emitir a todos los clientes
    } catch (error) {
      socket.emit('error', 'Error al eliminar producto');
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar servidor
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});