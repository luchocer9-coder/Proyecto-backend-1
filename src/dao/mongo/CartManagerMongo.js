const CartModel = require('../../models/cart.model');

class CartManagerMongo {
  async createCart() {
    return CartModel.create({ products: [] });
  }

  async getCartById(cid) {
    return CartModel.findById(cid).populate('products.product').lean();
  }

  async addProductToCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    const existingProduct = cart.products.find(
      (item) => item.product.toString() === pid
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    return cart;
  }

  async removeProductFromCart(cid, pid) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid
    );

    await cart.save();
    return cart;
  }

  async updateCart(cid, products) {
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    );
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await CartModel.findById(cid);
    if (!cart) return null;

    const item = cart.products.find(
      (p) => p.product.toString() === pid
    );
    if (!item) return null;

    item.quantity = quantity;
    await cart.save();
    return cart;
  }

  async clearCart(cid) {
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
    return cart;
  }
}

module.exports = CartManagerMongo;
