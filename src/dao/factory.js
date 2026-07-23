const persistence = process.env.PERSISTENCE || 'mongo';

let ProductManager;
let CartManager;

if (persistence === 'filesystem') {
  ProductManager = require('./filesystem/ProductManagerFS');
  CartManager = require('./filesystem/CartManagerFS');
  console.log('📁 Usando persistencia: FileSystem');
} else {
  ProductManager = require('./mongo/ProductManagerMongo');
  CartManager = require('./mongo/CartManagerMongo');
  console.log('🍃 Usando persistencia: MongoDB');
}

const productManager = new ProductManager();
const cartManager = new CartManager();

module.exports = { productManager, cartManager };
