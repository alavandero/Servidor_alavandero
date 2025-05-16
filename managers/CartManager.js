import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

class CartManager {
  async getCarts() {
    return await Cart.find().lean();
  }

  async getCartById(id) {
    return await Cart.findById(id).populate('products.product').lean();
  }

  async createCart() {
    return await Cart.create({ products: [] });
  }

  async addProductToCart(cartId, productId) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex === -1) {
      cart.products.push({ product: productId, quantity: 1 });
    } else {
      cart.products[productIndex].quantity++;
    }

    await cart.save();
    return await this.getCartById(cartId);
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();
    return await this.getCartById(cartId);
  }

  async updateCart(cartId, products) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity
    }));
    await cart.save();
    return await this.getCartById(cartId);
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
    if (productIndex === -1) throw new Error('Product not in cart');

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    return await this.getCartById(cartId);
  }

  async clearCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.products = [];
    await cart.save();
    return await this.getCartById(cartId);
  }
}

export default CartManager;