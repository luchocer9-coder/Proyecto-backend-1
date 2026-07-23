const socket = io();

const container = document.getElementById('products-container');

function renderProducts(products) {
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = '<p>No hay productos cargados todavía.</p>';
    return;
  }

  container.innerHTML = products
    .map(
      (p) => `
      <div class="product-card" data-id="${p._id}">
        <h3>${p.title}</h3>
        <p class="category">${p.category}</p>
        <p class="price">$${p.price}</p>
        <p class="stock">Stock: ${p.stock}</p>
        <a href="/products/${p._id}" class="btn">Ver detalle</a>
      </div>
    `
    )
    .join('');
}

socket.on('updateProducts', (products) => {
  renderProducts(products);
});
