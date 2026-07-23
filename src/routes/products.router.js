const { Router } = require('express');
const { productManager } = require('../dao/factory');

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;

    const result = await productManager.getProducts({ limit, page, query, sort });

    const buildLink = (targetPage) => {
      if (!targetPage) return null;
      const params = new URLSearchParams({
        limit,
        page: targetPage,
        ...(query ? { query } : {}),
        ...(sort ? { sort } : {})
      });
      return `/api/products?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: buildLink(result.prevPage),
      nextLink: buildLink(result.nextPage)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
    }

    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      status: status !== undefined ? status : true,
      stock,
      category,
      thumbnails: thumbnails || []
    });

    // Emitir evento de socket para actualizar vistas en tiempo real
    const io = req.app.get('io');
    if (io) {
      const updated = await productManager.getProducts({ limit: 100, page: 1 });
      io.emit('updateProducts', updated.docs);
    }

    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    const updated = await productManager.updateProduct(req.params.pid, updateData);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    const io = req.app.get('io');
    if (io) {
      const refreshed = await productManager.getProducts({ limit: 100, page: 1 });
      io.emit('updateProducts', refreshed.docs);
    }

    res.json({ status: 'success', payload: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await productManager.deleteProduct(req.params.pid);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    const io = req.app.get('io');
    if (io) {
      const refreshed = await productManager.getProducts({ limit: 100, page: 1 });
      io.emit('updateProducts', refreshed.docs);
    }

    res.json({ status: 'success', payload: deleted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
