import Product from '../models/Product.js';

  class ProductManager {
    async getProducts({ limit = 10, page = 1, sort, category, status, query }) {
      try {
        let filter = {};
        if (category) filter.category = category;
        if (status === 'true' || status === 'false') filter.status = status === 'true';
        if (query) filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];

        console.log('getProducts filter:', filter);
        console.log('getProducts params:', { limit, page, sort, category, status, query });

        const sortOptions = sort ? { price: sort === 'asc' ? 1 : -1 } : {};
        const skip = (page - 1) * limit;

        console.log('Executing Product.find with filter:', filter);
        const productsQuery = Product.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(Number(limit))
          .lean();
        const totalQuery = Product.countDocuments(filter);

        const [products, total] = await Promise.all([productsQuery, totalQuery]);

        console.log('getProducts result:', { productsFound: products.length, totalDocuments: total });
        console.log('Sample product:', products[0] || 'No products found');

        const totalPages = Math.ceil(total / limit) || 1;
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? Number(page) - 1 : null;
        const nextPage = hasNextPage ? Number(page) + 1 : null;

        const queryString = (params) => new URLSearchParams({
          limit: limit.toString(),
          page: (params.page || page).toString(),
          sort: sort || '',
          query: query || '',
          category: category || '',
          status: status || ''
        }).toString();

        return {
          payload: products,
          totalPages,
          prevPage,
          nextPage,
          page: Number(page),
          hasPrevPage,
          hasNextPage,
          prevLink: hasPrevPage ? `/products?${queryString({ page: prevPage })}` : null,
          nextLink: hasNextPage ? `/products?${queryString({ page: nextPage })}` : null
        };
      } catch (error) {
        console.error('Error in getProducts:', error);
        throw error;
      }
    }

    async getProductById(id) {
      try {
        const product = await Product.findById(id).lean();
        if (!product) throw new Error('Product not found');
        return product;
      } catch (error) {
        console.error('Error in getProductById:', error);
        throw error;
      }
    }

    async addProduct(product) {
      try {
        const newProduct = await Product.create(product);
        return newProduct.toObject();
      } catch (error) {
        console.error('Error in addProduct:', error);
        throw error;
      }
    }

    async updateProduct(id, updates) {
      try {
        const product = await Product.findById(id);
        if (!product) throw new Error('Product not found');
        Object.assign(product, updates);
        await product.save();
        return product.toObject();
      } catch (error) {
        console.error('Error in updateProduct:', error);
        throw error;
      }
    }

    async deleteProduct(id) {
      try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) throw new Error('Product not found');
        return { message: 'Product deleted' };
      } catch (error) {
        console.error('Error in deleteProduct:', error);
        throw error;
      }
    }
  }

  export default ProductManager;