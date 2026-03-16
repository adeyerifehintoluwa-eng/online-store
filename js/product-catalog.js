window.KTFashionCatalog = [];

window.loadCatalog = async function(forceRefresh) {
    if (!forceRefresh && Array.isArray(window.KTFashionCatalog) && window.KTFashionCatalog.length) {
        return window.KTFashionCatalog;
    }

    const response = await fetch('/api/products', {
        credentials: 'same-origin'
    });

    if (!response.ok) {
        throw new Error('Unable to load products right now.');
    }

    const data = await response.json();
    window.KTFashionCatalog = Array.isArray(data.products) ? data.products : [];
    return window.KTFashionCatalog;
};

window.getCatalogProduct = async function(productId) {
    const products = await window.loadCatalog();
    return products.find(function(product) {
        return product.id === productId;
    }) || null;
};
