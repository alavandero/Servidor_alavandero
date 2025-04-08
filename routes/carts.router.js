import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.json(newCart);
});

router.get('/:cid', async (req, res) => {
    const cart = await cartManager.getCartById(Number(req.params.cid));
    res.json(cart);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cart = await cartManager.addProductToCart(Number(req.params.cid), Number(req.params.pid));
    res.json(cart);
});

export default router;