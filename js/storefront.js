(function() {
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderProductCard(product, imageClass) {
        var cardImageClass = imageClass || 'product-card__image';
        var isSaved = typeof window.isWishlisted === 'function' && window.isWishlisted(product.id);

        return '' +
            '<div class="col-lg-4 col-md-6 col-sm-6">' +
                '<div class="product__item product__item--catalog">' +
                    '<div class="product__item__pic">' +
                        '<a class="product__item__pic-link" href="./product-details/?id=' + encodeURIComponent(product.id) + '">' +
                            '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" class="' + cardImageClass + '">' +
                        '</a>' +
                    '</div>' +
                    '<div class="product__item__text product__item__text--catalog">' +
                        '<h6><a href="./product-details/?id=' + encodeURIComponent(product.id) + '">' + escapeHtml(product.name) + '</a></h6>' +
                        '<div class="product__price">' + escapeHtml(formatCurrency(product.price)) + '</div>' +
                        '<div class="product__item__actions">' +
                            '<a href="./product-details/?id=' + encodeURIComponent(product.id) + '" class="product__item__link">View Details</a>' +
                            '<button type="button" class="product__item__wishlist-btn js-storefront-toggle-wishlist' + (isSaved ? ' is-active' : '') + '" data-product-id="' + escapeHtml(product.id) + '" data-product-name="' + escapeHtml(product.name) + '" data-product-price="' + product.price + '" data-product-image="' + escapeHtml(product.image) + '">' + (isSaved ? 'Saved' : 'Save') + '</button>' +
                            '<a href="#" class="primary-btn product__item__cart-btn js-storefront-add-to-cart" data-product-id="' + escapeHtml(product.id) + '" data-product-name="' + escapeHtml(product.name) + '" data-product-price="' + product.price + '" data-product-image="' + escapeHtml(product.image) + '">Add to Cart</a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function updateWishlistButtonState(button) {
        var isSaved = typeof window.isWishlisted === 'function' && window.isWishlisted(button.getAttribute('data-product-id'));
        button.classList.toggle('is-active', isSaved);
        button.textContent = isSaved ? 'Saved' : 'Save';
    }

    function bindAddToCartButtons(container) {
        Array.prototype.slice.call(container.querySelectorAll('.js-storefront-add-to-cart')).forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();

                if (typeof window.addToCart === 'function') {
                    window.addToCart(
                        button.getAttribute('data-product-id'),
                        button.getAttribute('data-product-name'),
                        button.getAttribute('data-product-price'),
                        button.getAttribute('data-product-image')
                    );
                }
            });
        });

        Array.prototype.slice.call(container.querySelectorAll('.js-storefront-toggle-wishlist')).forEach(function(button) {
            updateWishlistButtonState(button);

            button.addEventListener('click', function() {
                if (typeof window.toggleWishlist !== 'function') {
                    return;
                }

                var saved = window.toggleWishlist({
                    id: button.getAttribute('data-product-id')
                });

                updateWishlistButtonState(button);

                if (typeof window.showToast === 'function') {
                    window.showToast(saved ? 'Item saved to wishlist.' : 'Item removed from wishlist.', saved ? 'success' : 'info');
                }
            });
        });
    }

    function renderInto(containerId, products, imageClass) {
        var container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        if (!products.length) {
            container.innerHTML = '<div class="col-lg-12"><p style="color: #666;">No products available right now.</p></div>';
            return;
        }

        container.innerHTML = products.map(function(product) {
            return renderProductCard(product, imageClass);
        }).join('');
        bindAddToCartButtons(container);
    }

    window.addEventListener('wishlist:changed', function() {
        Array.prototype.slice.call(document.querySelectorAll('.js-storefront-toggle-wishlist')).forEach(updateWishlistButtonState);
    });

    document.addEventListener('DOMContentLoaded', async function() {
        if (typeof window.loadCatalog !== 'function') {
            return;
        }

        try {
            var products = await window.loadCatalog();
            renderInto('shopFeaturedProducts', products.filter(function(product) {
                return product.featured;
            }).slice(0, 6), 'product-card__image product-card__image--related');

            renderInto('womenWearsProducts', products.filter(function(product) {
                return product.category === 'Women' && product.section === 'wears';
            }));

            renderInto('womenBagsProducts', products.filter(function(product) {
                return product.category === 'Women' && product.section === 'bags';
            }));

            renderInto('womenJewelryProducts', products.filter(function(product) {
                return product.category === 'Women' && product.section === 'jewelry';
            }));

            renderInto('menProducts', products.filter(function(product) {
                return product.category === 'Men';
            }));
        } catch (error) {
            ['shopFeaturedProducts', 'womenWearsProducts', 'womenBagsProducts', 'womenJewelryProducts', 'menProducts'].forEach(function(containerId) {
                var container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '<div class="col-lg-12"><p style="color: #666;">Products are unavailable right now.</p></div>';
                }
            });
        }
    });
})();
