const fs = require('fs').promises;
const path = require('path');

const FILE_PATH = path.join(__dirname, '../../../data/carts.json');

class CartManagerFS {
  async #readFile() {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async #writeFile(carts) {
    await fs.writeFile(FILE_PATH, JSON.stringify(carts, null, 2));
  }

  #generateId(carts) {
    return carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
  }

  async createCart() {
    const carts = await this.#readFile();
    const newCart = { id: this.#generateId(carts), products: [] };
    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  async getCartById(cid) {
    const carts = await this.#readFile();
    return carts.find((c) => c.id === Number(cid)) || null;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === Number(cid));
    if (!cart) return null;

    const existing = cart.products.find((p) => p.product === Number(pid));
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: Number(pid), quantity: 1 });
    }

    await this.#writeFile(carts);
    return cart;
  }

  async removeProductFromCart(cid, pid) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === Number(cid));
    if (!cart) return null;

    cart.products = cart.products.filter((p) => p.product !== Number(pid));
    await this.#writeFile(carts);
    return cart;
  }

  async updateCart(cid, products) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === Number(cid));
    if (!cart) return null;

    cart.products = products;
    await this.#writeFile(carts);
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === Number(cid));
    if (!cart) return null;

    const item = cart.products.find((p) => p.product === Number(pid));
    if (!item) return null;

    item.quantity = quantity;
    await this.#writeFile(carts);
    return cart;
  }

  async clearCart(cid) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === Number(cid));
    if (!cart) return null;

    cart.products = [];
    await this.#writeFile(carts);
    return cart;
  }
}

module.exports = CartManagerFS;
