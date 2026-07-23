const fs = require('fs').promises;
const path = require('path');

const FILE_PATH = path.join(__dirname, '../../../data/products.json');

class ProductManagerFS {
  async #readFile() {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async #writeFile(products) {
    await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2));
  }

  #generateId(products) {
    return products.length > 0 ? products[products.length - 1].id + 1 : 1;
  }

  // Mantiene una interfaz similar a la versión Mongo (paginación básica en memoria)
  async getProducts({ limit = 10, page = 1, query, sort }) {
    let products = await this.#readFile();

    if (query) {
      if (query === 'available' || query === 'disponible') {
        products = products.filter((p) => p.status === true);
      } else if (query === 'unavailable' || query === 'no-disponible') {
        products = products.filter((p) => p.status === false);
      } else {
        products = products.filter((p) =>
          p.category?.toLowerCase().includes(query.toLowerCase())
        );
      }
    }

    if (sort === 'asc') products.sort((a, b) => a.price - b.price);
    if (sort === 'desc') products.sort((a, b) => b.price - a.price);

    const totalDocs = products.length;
    const totalPages = Math.ceil(totalDocs / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = products.slice(start, start + Number(limit));

    return {
      docs: paginated,
      totalPages,
      page: Number(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null
    };
  }

  async getProductById(pid) {
    const products = await this.#readFile();
    return products.find((p) => p.id === Number(pid)) || null;
  }

  async addProduct(productData) {
    const products = await this.#readFile();
    const newProduct = { id: this.#generateId(products), ...productData };
    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async updateProduct(pid, updateData) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === Number(pid));
    if (index === -1) return null;

    delete updateData.id;
    products[index] = { ...products[index], ...updateData };
    await this.#writeFile(products);
    return products[index];
  }

  async deleteProduct(pid) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === Number(pid));
    if (index === -1) return null;

    const [deleted] = products.splice(index, 1);
    await this.#writeFile(products);
    return deleted;
  }
}

module.exports = ProductManagerFS;
