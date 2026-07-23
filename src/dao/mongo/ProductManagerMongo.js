const ProductModel = require('../../models/product.model');

class ProductManagerMongo {
  async getProducts({ limit = 10, page = 1, query, sort }) {
    const filter = {};

    if (query) {
      if (query === 'available' || query === 'disponible') {
        filter.status = true;
      } else if (query === 'unavailable' || query === 'no-disponible') {
        filter.status = false;
      } else {
        // Filtro por categoría (case-insensitive)
        filter.category = { $regex: query, $options: 'i' };
      }
    }

    const options = {
      limit: Number(limit),
      page: Number(page),
      lean: true
    };

    if (sort === 'asc' || sort === 'desc') {
      options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    const result = await ProductModel.paginate(filter, options);
    return result;
  }

  async getProductById(pid) {
    return ProductModel.findById(pid).lean();
  }

  async addProduct(productData) {
    return ProductModel.create(productData);
  }

  async updateProduct(pid, updateData) {
    delete updateData._id;
    return ProductModel.findByIdAndUpdate(pid, updateData, { new: true });
  }

  async deleteProduct(pid) {
    return ProductModel.findByIdAndDelete(pid);
  }
}

module.exports = ProductManagerMongo;
