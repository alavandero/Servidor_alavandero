import { Router } from 'express';
  import ProductManager from '../managers/ProductManager.js';
  import Product from '../models/Product.js';

  const router = Router();
  const productManager = new ProductManager();

  router.get('/test', async (req, res) => {
    try {
      const products = await Product.find().limit(10).lean();
      const total = await Product.countDocuments();
      console.log('Direct query result:', { productsFound: products.length, totalDocuments: total });
      res.json({ products, total });
    } catch (error) {
      console.error('Error in GET /api/products/test:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query, category, status } = req.query;
      console.log('GET /api/products query:', { limit, page, sort, query, category, status });
      const result = await productManager.getProducts({
        limit: Number(limit),
        page: Number(page),
        sort,
        query,
        category,
        status
      });
      console.log('GET /api/products result:', {
        payloadLength: result.payload.length,
        totalPages: result.totalPages
      });
      res.json({
        status: 'success',
        ...result
      });
    } catch (error) {
      console.error('Error in GET /api/products:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  router.get('/:pid', async (req, res) => {
    try {
      const product = await productManager.getProductById(req.params.pid);
      if (!product) throw new Error('Product not found');
      res.json(product);
    } catch (error) {
      console.error('Error in GET /api/products/:pid:', error);
      res.status(404).json({ status: 'error', message: error.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { title, description, code, price, stock, category, thumbnails, status } = req.body;
      if (!title || !description || !code || !price || !stock || !category) {
        throw new Error('Missing required fields');
      }
      const newProduct = await productManager.addProduct({
        title,
        description,
        code,
        price: Number(price),
        stock: Number(stock),
        category,
        thumbnails: thumbnails || [],
        status: status !== undefined ? Boolean(status) : true
      });
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error in POST /api/products:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  });

  router.put('/:pid', async (req, res) => {
    try {
      const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error in PUT /api/products/:pid:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      const result = await productManager.deleteProduct(req.params.pid);
      res.json(result);
    } catch (error) {
      console.error('Error in DELETE /api/products/:pid:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  });

  export default router;