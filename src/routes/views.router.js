const { Router } = require('express');
const { productManager, cartManager } = require('../dao/factory');

const router = Router();

// GET /products -> listado con paginación
router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;
    const result = await productManager.getProducts({ limit, page, query, sort });

    res.render('home', {
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage
    });
  } catch (error) {
    res.status(500).send('Error al cargar los productos: ' + error.message);
  }
});

// GET /products/:pid -> detalle de producto
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).send('Error al cargar el producto: ' + error.message);
  }
});

// GET /carts/:cid -> detalle de carrito
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.render('cartDetail', { cart });
  } catch (error) {
    res.status(500).send('Error al cargar el carrito: ' + error.message);
  }
});

module.exports = router;
