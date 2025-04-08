import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductById(Number(req.params.pid));
    res.json(product);
});

router.post('/', async (req, res) => {
    const newProduct = await productManager.addProduct(req.body);
    res.json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const updatedProduct = await productManager.updateProduct(Number(req.params.pid), req.body);
    res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
    const result = await productManager.deleteProduct(Number(req.params.pid));
    res.json(result);
});

export default router;