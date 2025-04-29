import fs from 'fs/promises';

class ProductManager {
    constructor() {
        this.path = './products.json';
        this.init();
    }

    async init() {
        try {
            // Verificar si el archivo existe
            await fs.access(this.path);
        } catch (error) {
            // Si no existe, crear archivo con array vacío
            await fs.writeFile(this.path, JSON.stringify([]));
            console.log('Initialized products.json');
        }
    }

    async getProducts() {
        const data = await fs.readFile(this.path, 'utf-8');
        return JSON.parse(data);
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === id);
    }

    async addProduct(product) {
        const products = await this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { 
            id: newId, 
            ...product,
            status: product.status ?? true
        };
        products.push(newProduct);
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async updateProduct(id, updates) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Producto no encontrado');
        products[index] = { ...products[index], ...updates, id };
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const filteredProducts = products.filter(p => p.id !== id);
        await fs.writeFile(this.path, JSON.stringify(filteredProducts, null, 2));
        return filteredProducts;
    }
}

export default ProductManager;