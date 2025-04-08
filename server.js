import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Ruta raíz opcional
server.get('/', (req, res) => {
    res.send('API funcionando. Usa /api/products o /api/carts');
});

server.use('/api/products', productsRouter);
server.use('/api/carts', cartsRouter);

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});