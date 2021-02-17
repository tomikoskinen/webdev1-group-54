const data = {
    products: require('../products.json').map(product => ({ ...product })),
  };

  /**
 * Return products
 *
 * Returns copies of the products and not the originals
 * to prevent modifying them outside of this module.
 *
 * @returns {Array<object>} products
 */
const getProducts = () => {    
    return data.products.map(p => ({ ...p }));
};

module.exports = {
    getProducts
};