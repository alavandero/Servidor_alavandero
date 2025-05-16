import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) throw new Error('Cart not found');
    res.json(cart);
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) throw new Error('Products must be an array');
    const cart = await cartManager.updateCart(req.params.cid, products);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid quantity');
    const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

export default router;