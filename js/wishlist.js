$(document).ready(function() {
    function requestJson(url, options) {
        return fetch(url, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        }).then(async function(response) {
            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                data = {};
            }

            if (!response.ok) {
                throw new Error(data.message || 'Request failed.');
            }

            return data;
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    function render(products) {
        window.allWishlistProducts = products;
        const wishlistIds = typeof window.getWishlistIds === 'function' ? window.getWishlistIds() : [];
        const savedProducts = products.filter(function(product) {
            return wishlistIds.includes(product.id);
        });
        const suggestedProducts = products.filter(function(product) {
            return !wishlistIds.includes(product.id);
        }).slice(0, 4);

        $('#wishlistSavedCount').text(savedProducts.length);
        $('#wishlistSavedItems').html(savedProducts.map(function(product) {
            return `
                <div class="col-lg-6 col-md-6">
                    <div style="padding: 20px; border: 1px solid #f2f2f2; margin-bottom: 24px;">
                        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" style="width: 100%; height: 240px; object-fit: cover; margin-bottom: 18px;">
                        <h5 style="margin-bottom: 8px;">${escapeHtml(product.name)}</h5>
                        <p style="margin-bottom: 12px; color: #666;">${escapeHtml(product.category)} / ${escapeHtml(product.section)}</p>
                        <p style="margin-bottom: 18px; font-weight: 700;">${formatCurrency(product.price)}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                            <a href="./product-details/?id=${encodeURIComponent(product.id)}" class="primary-btn">View Details</a>
                            <button type="button" class="site-btn wishlist-toggle" data-product-id="${escapeHtml(product.id)}" style="background: #111;">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || `
            <div class="col-lg-12">
                <div style="padding: 30px; border: 1px solid #f2f2f2; text-align: center;">
                    <h5 style="margin-bottom: 10px;">Your wishlist is empty</h5>
                    <p style="margin-bottom: 18px; color: #666;">Use this page to keep track of pieces you want to revisit. For now, you can start by saving suggested picks below.</p>
                </div>
            </div>
        `);

        $('#wishlistSuggestions').html(suggestedProducts.map(function(product) {
            return `
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="product__item">
                        <div class="product__item__pic set-bg" style="background-image: url('${escapeHtml(product.image)}');">
                            ${product.badge ? `<div class="label">${escapeHtml(product.badge)}</div>` : ''}
                        </div>
                        <div class="product__item__text">
                            <h6><a href="./product-details/?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h6>
                            <div class="product__price">${formatCurrency(product.price)}</div>
                            <button type="button" class="site-btn wishlist-toggle" data-product-id="${escapeHtml(product.id)}" style="margin-top: 14px;">Save Item</button>
                        </div>
                    </div>
                </div>
            `;
        }).join(''));
    }

    $(document).on('click', '.wishlist-toggle', function() {
        if (typeof window.toggleWishlist !== 'function') {
            return;
        }

        const saved = window.toggleWishlist({
            id: $(this).data('product-id')
        });

        if (typeof window.showToast === 'function') {
            window.showToast(saved ? 'Item saved to wishlist.' : 'Item removed from wishlist.', saved ? 'success' : 'info');
        }
        render(window.allWishlistProducts || []);
    });

    window.addEventListener('wishlist:changed', function() {
        render(window.allWishlistProducts || []);
    });

    requestJson('/api/products', { method: 'GET' })
        .then(function(data) {
            render(data.products || []);
        })
        .catch(function(error) {
            $('#wishlistSavedItems').html(`
                <div class="col-lg-12">
                    <div style="padding: 30px; border: 1px solid #f2f2f2; text-align: center;">
                        <h5 style="margin-bottom: 10px;">Unable to load wishlist</h5>
                        <p style="margin: 0; color: #666;">${escapeHtml(error.message)}</p>
                    </div>
                </div>
            `);
        });
});
