(function() {
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function renderRelatedProducts(products) {
        var relatedContainer = document.getElementById('related-products');
        if (!relatedContainer) {
            return;
        }

        relatedContainer.innerHTML = products.map(function(item) {
            var isSaved = typeof window.isWishlisted === 'function' && window.isWishlisted(item.id);
            return '' +
                '<div class="col-lg-3 col-md-4 col-sm-6">' +
                    '<div class="product__item product__item--catalog">' +
                        '<div class="product__item__pic">' +
                            '<a class="product__item__pic-link" href="./product-details/?id=' + encodeURIComponent(item.id) + '">' +
                                '<img class="product-card__image product-card__image--related" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
                            '</a>' +
                        '</div>' +
                        '<div class="product__item__text product__item__text--catalog">' +
                            '<h6><a href="./product-details/?id=' + encodeURIComponent(item.id) + '">' + escapeHtml(item.name) + '</a></h6>' +
                            '<div class="product__price">' + escapeHtml(formatCurrency(item.price)) + '</div>' +
                            '<div class="product__item__actions">' +
                                '<a href="./product-details/?id=' + encodeURIComponent(item.id) + '" class="product__item__link">View Details</a>' +
                                '<button type="button" class="product__item__wishlist-btn js-related-toggle-wishlist' + (isSaved ? ' is-active' : '') + '" data-product-id="' + escapeHtml(item.id) + '">' + (isSaved ? 'Saved' : 'Save') + '</button>' +
                                '<a href="#" class="primary-btn product__item__cart-btn js-related-add-to-cart" data-product-id="' + escapeHtml(item.id) + '" data-product-name="' + escapeHtml(item.name) + '" data-product-price="' + item.price + '" data-product-image="' + escapeHtml(item.image) + '">Add to Cart</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }).join('');

        Array.prototype.slice.call(relatedContainer.querySelectorAll('.js-related-add-to-cart')).forEach(function(button) {
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

        Array.prototype.slice.call(relatedContainer.querySelectorAll('.js-related-toggle-wishlist')).forEach(function(button) {
            button.addEventListener('click', function() {
                if (typeof window.toggleWishlist !== 'function') {
                    return;
                }

                var saved = window.toggleWishlist({
                    id: button.getAttribute('data-product-id')
                });
                button.classList.toggle('is-active', saved);
                button.textContent = saved ? 'Saved' : 'Save';

                if (typeof window.showToast === 'function') {
                    window.showToast(saved ? 'Item saved to wishlist.' : 'Item removed from wishlist.', saved ? 'success' : 'info');
                }
            });
        });

        window.addEventListener('wishlist:changed', function() {
            Array.prototype.slice.call(relatedContainer.querySelectorAll('.js-related-toggle-wishlist')).forEach(function(button) {
                var isSaved = typeof window.isWishlisted === 'function' && window.isWishlisted(button.getAttribute('data-product-id'));
                button.classList.toggle('is-active', isSaved);
                button.textContent = isSaved ? 'Saved' : 'Save';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', async function() {
        try {
            var products = await window.loadCatalog();
            if (!products.length) {
                setText('product-name', 'Product unavailable');
                return;
            }

            var params = new URLSearchParams(window.location.search);
            var productId = params.get('id') || products[0].id;
            var product = await window.getCatalogProduct(productId);

            if (!product) {
                product = products[0];
            }

            document.title = product.name + ' | KT Fashion';
            setText('product-name', product.name);
            setText('breadcrumb-product-name', product.name);
            setText('breadcrumb-category-name', product.category);
            setText('product-category-label', product.category + ' Collection');
            setText('product-price', formatCurrency(product.price));
            setText('product-description', product.description);
            setText('tab-description-copy', product.description);
            setText('tab-specification-copy', product.specification);
            setText('tab-care-copy', product.care);

            var categoryLink = document.getElementById('breadcrumb-category-link');
            if (categoryLink) {
                categoryLink.href = product.categoryUrl;
                categoryLink.textContent = product.category;
            }

            var heroImage = document.getElementById('product-hero-image');
            if (heroImage) {
                heroImage.src = product.image;
                heroImage.alt = product.name;
            }

            var badge = document.getElementById('product-badge');
            if (badge) {
                badge.textContent = product.badge || 'Featured';
            }

            var qtyInput = document.getElementById('detail-quantity');
            var addButton = document.getElementById('add-to-cart-button');
            var wishlistButton = document.getElementById('wishlist-button');
            if (addButton) {
                addButton.addEventListener('click', function(event) {
                    event.preventDefault();
                    var quantity = qtyInput ? qtyInput.value : 1;
                    if (typeof window.addToCart === 'function') {
                        window.addToCart(product.id, product.name, product.price, product.image, quantity);
                    }
                });
            }

            function syncDetailWishlistButton() {
                if (!wishlistButton) {
                    return;
                }

                var isSaved = typeof window.isWishlisted === 'function' && window.isWishlisted(product.id);
                wishlistButton.classList.toggle('is-active', isSaved);
                wishlistButton.textContent = isSaved ? 'Saved to Wishlist' : 'Save to Wishlist';
            }

            if (wishlistButton) {
                syncDetailWishlistButton();
                wishlistButton.addEventListener('click', function() {
                    if (typeof window.toggleWishlist !== 'function') {
                        return;
                    }

                    var saved = window.toggleWishlist({ id: product.id });
                    syncDetailWishlistButton();

                    if (typeof window.showToast === 'function') {
                        window.showToast(saved ? 'Item saved to wishlist.' : 'Item removed from wishlist.', saved ? 'success' : 'info');
                    }
                });

                window.addEventListener('wishlist:changed', syncDetailWishlistButton);
            }

            var continueLink = document.getElementById('continue-shopping-link');
            if (continueLink) {
                continueLink.href = product.categoryUrl;
            }

            var related = products.filter(function(item) {
                return item.id !== product.id && item.category === product.category;
            }).slice(0, 4);

            if (!related.length) {
                related = products.filter(function(item) {
                    return item.id !== product.id;
                }).slice(0, 4);
            }

            renderRelatedProducts(related);
        } catch (error) {
            setText('product-name', 'Product unavailable');
            setText('product-description', 'We could not load this product right now.');
        }
    });
})();
