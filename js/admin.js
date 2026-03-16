$(document).ready(function() {
    function ensureToastSupport() {
        if (window.showToast) return;

        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 340px;
            }
            .app-toast {
                color: #fff;
                padding: 14px 16px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
                font-size: 14px;
                line-height: 1.5;
                opacity: 0;
                transform: translateY(-8px);
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .app-toast.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
            .app-toast--success {
                background: #1f7a4d;
            }
            .app-toast--error {
                background: #b42318;
            }
        `;
        document.head.appendChild(style);

        window.showToast = function(message, type) {
            const toastType = type || 'success';
            let container = document.querySelector('.toast-container');

            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `app-toast app-toast--${toastType}`;
            toast.textContent = message;
            container.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('is-visible'));
            setTimeout(() => {
                toast.classList.remove('is-visible');
                setTimeout(() => toast.remove(), 200);
            }, 2800);
        };
    }

    async function requestJson(url, options) {
        const response = await fetch(url, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });

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
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    function resetForm() {
        $('#adminProductForm')[0].reset();
        $('#adminProductId').val('');
        $('#adminFormTitle').text('Add Product');
        $('#adminProductSubmit').text('Save Product');
    }

    function syncSectionOptions() {
        const category = $('#adminProductCategory').val();
        const sectionSelect = $('#adminProductSection');
        const currentValue = sectionSelect.val();
        const options = category === 'Men'
            ? [
                { value: 'traditional', label: 'Traditional' }
            ]
            : [
                { value: 'wears', label: 'Wears' },
                { value: 'bags', label: 'Bags' },
                { value: 'jewelry', label: 'Jewelry' }
            ];

        sectionSelect.html(options.map(function(option) {
            return `<option value="${option.value}">${option.label}</option>`;
        }).join(''));

        if (options.some(function(option) { return option.value === currentValue; })) {
            sectionSelect.val(currentValue);
        }
    }

    function renderProducts(products) {
        $('#adminProductCount').text(products.length);

        if (!products.length) {
            $('#adminProductList').html('<p style="color: #666;">No products added yet.</p>');
            return;
        }

        const markup = products.map(function(product) {
            return `
                <div style="border: 1px solid #f0f0f0; padding: 18px; margin-bottom: 16px;">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px;">
                        </div>
                        <div class="col-md-6">
                            <h6 style="margin-bottom: 6px;">${product.name}</h6>
                            <p style="margin: 0 0 6px; color: #666;">${product.category} / ${product.section}</p>
                            <p style="margin: 0; font-weight: 600;">${formatCurrency(product.price)}</p>
                        </div>
                        <div class="col-md-4 text-md-right" style="margin-top: 12px;">
                            <button type="button" class="site-btn admin-edit-product" data-product-id="${product.id}" style="margin-right: 8px;">Edit</button>
                            <button type="button" class="site-btn admin-delete-product" data-product-id="${product.id}" style="background: #111111;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#adminProductList').html(markup);
    }

    function renderOrders(orders) {
        $('#adminOrderCount').text(orders.length);

        if (!orders.length) {
            $('#adminOrderList').html('<p style="color: #666;">No orders yet.</p>');
            return;
        }

        const markup = orders.map(function(order) {
            const items = order.items.map(function(item) {
                return `<div style="display:flex; justify-content:space-between; padding: 6px 0;"><span>${item.name} x ${item.quantity}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>`;
            }).join('');

            return `
                <div style="border: 1px solid #f0f0f0; padding: 18px; margin-bottom: 16px;">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 style="margin-bottom: 6px;">${order.id}</h6>
                            <p style="margin: 0 0 6px; color: #666;">${order.customerName} (${order.customerEmail})</p>
                            <p style="margin: 0; color: #666;">${new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div class="col-md-6 text-md-right" style="margin-top: 12px;">
                            <p style="margin: 0 0 6px; font-weight: 600;">${formatCurrency(order.total)}</p>
                            <p style="margin: 0; color: #666;">${order.itemCount} item(s)</p>
                        </div>
                    </div>
                    <div style="margin-top: 14px; border-top: 1px solid #f2f2f2; padding-top: 12px;">
                        ${items}
                    </div>
                </div>
            `;
        }).join('');

        $('#adminOrderList').html(markup);
    }

    async function loadDashboard() {
        const [productsData, ordersData] = await Promise.all([
            requestJson('/api/admin/products', { method: 'GET' }),
            requestJson('/api/admin/orders', { method: 'GET' })
        ]);

        window.adminProducts = productsData.products || [];
        renderProducts(window.adminProducts);
        renderOrders(ordersData.orders || []);
    }

    ensureToastSupport();
    syncSectionOptions();

    $('#adminProductCategory').on('change', syncSectionOptions);

    $('#adminProductForm').on('submit', async function(event) {
        event.preventDefault();

        const productId = $('#adminProductId').val();
        const payload = {
            name: $('#adminProductName').val(),
            price: $('#adminProductPrice').val(),
            image: $('#adminProductImage').val(),
            category: $('#adminProductCategory').val(),
            section: $('#adminProductSection').val(),
            badge: $('#adminProductBadge').val(),
            description: $('#adminProductDescription').val(),
            specification: $('#adminProductSpecification').val(),
            care: $('#adminProductCare').val(),
            featured: $('#adminProductFeatured').is(':checked')
        };

        try {
            if (productId) {
                await requestJson(`/api/admin/products/${encodeURIComponent(productId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                window.showToast('Product updated successfully.', 'success');
            } else {
                await requestJson('/api/admin/products', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                window.showToast('Product added successfully.', 'success');
            }

            resetForm();
            await loadDashboard();
        } catch (error) {
            window.showToast(error.message, 'error');
        }
    });

    $(document).on('click', '.admin-edit-product', function() {
        const productId = $(this).data('product-id');
        const product = (window.adminProducts || []).find(function(item) {
            return item.id === productId;
        });

        if (!product) {
            return;
        }

        $('#adminProductId').val(product.id);
        $('#adminProductName').val(product.name);
        $('#adminProductPrice').val(product.price);
        $('#adminProductImage').val(product.image);
        $('#adminProductCategory').val(product.category);
        syncSectionOptions();
        $('#adminProductSection').val(product.section);
        $('#adminProductBadge').val(product.badge || '');
        $('#adminProductDescription').val(product.description || '');
        $('#adminProductSpecification').val(product.specification || '');
        $('#adminProductCare').val(product.care || '');
        $('#adminProductFeatured').prop('checked', Boolean(product.featured));
        $('#adminFormTitle').text('Edit Product');
        $('#adminProductSubmit').text('Update Product');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $(document).on('click', '.admin-delete-product', async function() {
        const productId = $(this).data('product-id');

        if (!window.confirm('Delete this product?')) {
            return;
        }

        try {
            await requestJson(`/api/admin/products/${encodeURIComponent(productId)}`, {
                method: 'DELETE'
            });
            window.showToast('Product deleted successfully.', 'success');
            await loadDashboard();
        } catch (error) {
            window.showToast(error.message, 'error');
        }
    });

    $('#adminResetForm').on('click', function() {
        resetForm();
    });

    requestJson('/api/auth/session', { method: 'GET' })
        .then(function(data) {
            if (!data.authenticated || !data.user || data.user.role !== 'admin') {
                $('#adminDashboard').hide();
                $('#adminUnauthorized').show();
                return;
            }

            $('#adminUnauthorized').hide();
            $('#adminDashboard').show();
            $('#adminOwnerName').text(data.user.name);
            loadDashboard().catch(function(error) {
                window.showToast(error.message, 'error');
            });
        })
        .catch(function() {
            $('#adminDashboard').hide();
            $('#adminUnauthorized').show();
        });
});
