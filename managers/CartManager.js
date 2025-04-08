import fs from 'fs/promises';

class CartManager {
    constructor() {
        this.path = './carts.json';
        this.init();
    }

    async init() {
        try {
            await fs.writeFile(this.path, JSON.stringify([]));
        } catch (error) {
            console.log('Initialized carts.json');
        }
    }

    async getCarts() {
        const data = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(c => c.id === id);
    }

    async createCart() {
        const carts = await this.getCarts();
        const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
        const newCart = { id: newId, products: [] };
        carts.push(newCart);
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        const productIndex = carts[cartIndex].products.findIndex(p => p.product === productId);
        
        if (productIndex === -1) {
            carts[cartIndex].products.push({ product: productId, quantity: 1 });
        } else {
            carts[cartIndex].products[productIndex].quantity++;
        }
        
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }
}

export default CartManager;