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

            requestAnimationFrame(function() {
                toast.classList.add('is-visible');
            });

            setTimeout(function() {
                toast.classList.remove('is-visible');
                setTimeout(function() {
                    toast.remove();
                }, 200);
            }, 2800);
        };
    }

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

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    function formatDate(value) {
        return new Date(value).toLocaleString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
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

    function formatSectionLabel(section) {
        const labels = {
            wears: 'Wears',
            bags: 'Bags',
            jewelry: 'Jewelry',
            traditional: 'Traditional'
        };

        return labels[section] || section || '';
    }

    function setMessage(selector, message, type) {
        const element = $(selector);
        if (!message) {
            element.hide().text('');
            return;
        }

        element
            .text(message)
            .css('color', type === 'success' ? '#1f7a4d' : '#b42318')
            .show();
    }

    function isValidImagePath(value) {
        return /^(https?:\/\/|\/|\.\/|img\/|data:image\/)/i.test(String(value || '').trim());
    }

    function updateImagePreview(options) {
        const imageValue = String(options.value || '').trim();
        const wrapper = $(options.wrapper);
        const image = $(options.image);
        const text = $(options.text);

        if (!imageValue) {
            wrapper.show();
            image.hide().attr('src', '');
            text.text(options.emptyText).show();
            return;
        }

        wrapper.show();
        text.text('Loading preview...').show();
        image.hide();

        image.off('load error');
        image.on('load', function() {
            text.hide();
            image.show();
        });
        image.on('error', function() {
            image.hide().attr('src', '');
            text.text('Preview unavailable. Check the image path or URL.').show();
        });
        image.attr('src', imageValue);
    }

    function syncSectionOptions() {
        const category = $('#adminProductCategory').val();
        const sectionSelect = $('#adminProductSection');
        const currentValue = sectionSelect.val();
        const options = category === 'Men'
            ? [{ value: 'traditional', label: 'Traditional' }]
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

    function resetProductForm() {
        $('#adminProductForm')[0].reset();
        $('#adminProductId').val('');
        $('#adminFormTitle').text('Add Product');
        $('#adminProductSubmit').text('Save Product');
        setMessage('#adminFormMessage', '');
        updateImagePreview({
            value: '',
            wrapper: '#adminImagePreviewWrap',
            image: '#adminImagePreview',
            text: '#adminImagePreviewText',
            emptyText: 'Paste an image path or URL to preview it here.'
        });
        syncSectionOptions();
    }

    function resetBlogForm() {
        $('#adminBlogForm')[0].reset();
        $('#adminBlogId').val('');
        $('#adminBlogFormTitle').text('Add Blog Post');
        $('#adminBlogSubmit').text('Save Post');
        setMessage('#adminBlogFormMessage', '');
        updateImagePreview({
            value: '',
            wrapper: '#adminBlogImagePreviewWrap',
            image: '#adminBlogImagePreview',
            text: '#adminBlogImagePreviewText',
            emptyText: 'Paste a blog image path or URL to preview it here.'
        });
    }

    function populateContactForm(content) {
        const safeContent = content || {};
        window.adminContactContent = safeContent;
        $('#adminContactTitle').val(safeContent.title || '');
        $('#adminContactIntro').val(safeContent.intro || '');
        $('#adminContactAddress').val(safeContent.address || '');
        $('#adminContactPrimaryPhone').val(safeContent.primaryPhone || '');
        $('#adminContactSecondaryPhone').val(safeContent.secondaryPhone || '');
        $('#adminContactSupportLabel').val(safeContent.supportLabel || '');
        $('#adminContactSupportEmail').val(safeContent.supportEmail || '');
        $('#adminContactMapEmbedUrl').val(safeContent.mapEmbedUrl || '');
        setMessage('#adminContactFormMessage', '');
    }

    function buildContactPayload() {
        const payload = {
            title: String($('#adminContactTitle').val() || '').trim(),
            intro: String($('#adminContactIntro').val() || '').trim(),
            address: String($('#adminContactAddress').val() || '').trim(),
            primaryPhone: String($('#adminContactPrimaryPhone').val() || '').trim(),
            secondaryPhone: String($('#adminContactSecondaryPhone').val() || '').trim(),
            supportLabel: String($('#adminContactSupportLabel').val() || '').trim(),
            supportEmail: String($('#adminContactSupportEmail').val() || '').trim().toLowerCase(),
            mapEmbedUrl: String($('#adminContactMapEmbedUrl').val() || '').trim()
        };

        if (payload.title.length < 4) {
            return { error: 'Contact page title must be at least 4 characters.' };
        }

        if (payload.intro.length < 20) {
            return { error: 'Contact intro must be at least 20 characters.' };
        }

        if (!payload.address) {
            return { error: 'Contact address is required.' };
        }

        if (!/^[0-9+\-\s()]{7,20}$/.test(payload.primaryPhone)) {
            return { error: 'Enter a valid primary phone number.' };
        }

        if (payload.secondaryPhone && !/^[0-9+\-\s()]{7,20}$/.test(payload.secondaryPhone)) {
            return { error: 'Enter a valid secondary phone number.' };
        }

        if (!payload.supportLabel) {
            return { error: 'Support label is required.' };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.supportEmail)) {
            return { error: 'Enter a valid support email address.' };
        }

        if (!/^https:\/\/www\.google\.com\/maps\/embed\?/i.test(payload.mapEmbedUrl)) {
            return { error: 'Use a valid Google Maps embed URL.' };
        }

        return { payload };
    }

    function buildProductPayload() {
        const payload = {
            name: String($('#adminProductName').val() || '').trim(),
            price: String($('#adminProductPrice').val() || '').trim(),
            image: String($('#adminProductImage').val() || '').trim(),
            category: $('#adminProductCategory').val(),
            section: $('#adminProductSection').val(),
            badge: String($('#adminProductBadge').val() || '').trim(),
            description: String($('#adminProductDescription').val() || '').trim(),
            specification: String($('#adminProductSpecification').val() || '').trim(),
            care: String($('#adminProductCare').val() || '').trim(),
            featured: $('#adminProductFeatured').is(':checked')
        };
        const priceValue = Number(payload.price);
        const allowedSections = payload.category === 'Men' ? ['traditional'] : ['wears', 'bags', 'jewelry'];

        if (payload.name.length < 2) {
            return { error: 'Product name must be at least 2 characters.' };
        }

        if (!Number.isFinite(priceValue) || priceValue <= 0) {
            return { error: 'Enter a valid product price greater than 0.' };
        }

        if (!payload.image) {
            return { error: 'Product image is required.' };
        }

        if (!isValidImagePath(payload.image)) {
            return { error: 'Use a valid image path or URL, for example img/product/item.jpg or https://...' };
        }

        if (!allowedSections.includes(payload.section)) {
            return { error: 'Select a valid section for the chosen category.' };
        }

        payload.price = priceValue;
        return { payload };
    }

    function buildBlogPayload() {
        const payload = {
            title: String($('#adminBlogTitle').val() || '').trim(),
            category: String($('#adminBlogCategory').val() || '').trim(),
            author: String($('#adminBlogAuthor').val() || '').trim(),
            publishedAt: String($('#adminBlogPublishedAt').val() || '').trim(),
            image: String($('#adminBlogImage').val() || '').trim(),
            excerpt: String($('#adminBlogExcerpt').val() || '').trim(),
            content: String($('#adminBlogContent').val() || '').trim(),
            quote: String($('#adminBlogQuote').val() || '').trim(),
            tags: String($('#adminBlogTags').val() || '').trim(),
            featured: $('#adminBlogFeatured').is(':checked')
        };

        if (payload.title.length < 8) {
            return { error: 'Blog title must be at least 8 characters.' };
        }

        if (!payload.category) {
            return { error: 'Blog category is required.' };
        }

        if (!payload.image) {
            return { error: 'Blog image is required.' };
        }

        if (!isValidImagePath(payload.image)) {
            return { error: 'Use a valid blog image path or URL.' };
        }

        if (payload.excerpt.length < 24) {
            return { error: 'Blog excerpt must be at least 24 characters.' };
        }

        if (payload.content.length < 80) {
            return { error: 'Blog content must be at least 80 characters.' };
        }

        return { payload };
    }

    function renderProducts(products) {
        $('#adminProductCount').text(products.length);

        if (!products.length) {
            $('#adminProductList').html('<p style="color: #666;">No products added yet.</p>');
            return;
        }

        $('#adminProductList').html(products.map(function(product) {
            return `
                <div style="border: 1px solid #f0f0f0; padding: 18px; margin-bottom: 16px;">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px;">
                        </div>
                        <div class="col-md-6">
                            <h6 style="margin-bottom: 6px;">${escapeHtml(product.name)}</h6>
                            <p style="margin: 0 0 6px; color: #666;">${escapeHtml(product.category)} / ${escapeHtml(formatSectionLabel(product.section))}</p>
                            <p style="margin: 0; font-weight: 600;">${formatCurrency(product.price)}</p>
                        </div>
                        <div class="col-md-4 text-md-right" style="margin-top: 12px;">
                            <button type="button" class="site-btn admin-edit-product" data-product-id="${escapeHtml(product.id)}" style="margin-right: 8px;">Edit</button>
                            <button type="button" class="site-btn admin-delete-product" data-product-id="${escapeHtml(product.id)}" style="background: #111111;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join(''));
    }

    function renderBlogPosts(posts) {
        $('#adminBlogCount').text(posts.length);

        if (!posts.length) {
            $('#adminBlogList').html('<p style="color: #666;">No blog posts published yet.</p>');
            return;
        }

        $('#adminBlogList').html(posts.map(function(post) {
            return `
                <div style="border: 1px solid #f0f0f0; padding: 18px; margin-bottom: 16px;">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px;">
                        </div>
                        <div class="col-md-6">
                            <h6 style="margin-bottom: 6px;">${escapeHtml(post.title)}</h6>
                            <p style="margin: 0 0 6px; color: #666;">${escapeHtml(post.category)} • ${formatDate(post.publishedAt)}</p>
                            <p style="margin: 0; color: #666; line-height: 1.7;">${escapeHtml(post.excerpt)}</p>
                        </div>
                        <div class="col-md-3 text-md-right" style="margin-top: 12px;">
                            <button type="button" class="site-btn admin-edit-blog" data-blog-id="${escapeHtml(post.id)}" style="margin-right: 8px;">Edit</button>
                            <button type="button" class="site-btn admin-delete-blog" data-blog-id="${escapeHtml(post.id)}" style="background: #111111;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join(''));
    }

    function renderOrders(orders) {
        $('#adminOrderCount').text(orders.length);

        if (!orders.length) {
            $('#adminOrderList').html('<p style="color: #666;">No orders yet.</p>');
            return;
        }

        $('#adminOrderList').html(orders.map(function(order) {
            const items = (order.items || []).map(function(item) {
                return `<div style="display:flex; justify-content:space-between; padding: 6px 0;"><span>${escapeHtml(item.name)} x ${item.quantity}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>`;
            }).join('');
            const billing = order.billingDetails || {};
            const billingAddress = [
                billing.addressLine1,
                billing.addressLine2,
                billing.city,
                billing.state,
                billing.postalCode
            ].filter(Boolean).map(escapeHtml).join(', ');

            return `
                <div style="border: 1px solid #f0f0f0; padding: 18px; margin-bottom: 16px;">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 style="margin-bottom: 6px;">${escapeHtml(order.id)}</h6>
                            <p style="margin: 0 0 6px; color: #666;">${escapeHtml(order.customerName)} (${escapeHtml(order.customerEmail)})</p>
                            <p style="margin: 0; color: #666;">${formatDate(order.createdAt)}</p>
                        </div>
                        <div class="col-md-6 text-md-right" style="margin-top: 12px;">
                            <p style="margin: 0 0 6px; font-weight: 600;">${formatCurrency(order.total)}</p>
                            <p style="margin: 0; color: #ca1515; font-weight: 600;">${escapeHtml(order.status || 'Received')}</p>
                        </div>
                    </div>
                    <div style="margin-top: 12px; color: #666; line-height: 1.8;">
                        <div><strong style="color: #111;">Phone:</strong> ${escapeHtml(billing.phone || 'Not provided')}</div>
                        <div><strong style="color: #111;">Payment:</strong> ${escapeHtml(billing.paymentMethod || 'Not provided')}</div>
                        <div><strong style="color: #111;">Address:</strong> ${billingAddress || 'Not provided'}</div>
                    </div>
                    <div style="margin-top: 14px; border-top: 1px solid #f2f2f2; padding-top: 12px;">
                        ${items}
                    </div>
                </div>
            `;
        }).join(''));
    }

    function toDatetimeLocal(value) {
        if (!value) return '';
        const date = new Date(value);
        const offsetMs = date.getTimezoneOffset() * 60 * 1000;
        return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
    }

    async function loadDashboard() {
        const [productsData, ordersData, blogData, contactData] = await Promise.all([
            requestJson('/api/admin/products', { method: 'GET' }),
            requestJson('/api/admin/orders', { method: 'GET' }),
            requestJson('/api/admin/blog-posts', { method: 'GET' }),
            requestJson('/api/admin/contact-content', { method: 'GET' })
        ]);

        window.adminProducts = productsData.products || [];
        window.adminOrders = ordersData.orders || [];
        window.adminBlogPosts = blogData.posts || [];

        renderProducts(window.adminProducts);
        renderOrders(window.adminOrders);
        renderBlogPosts(window.adminBlogPosts);
        populateContactForm(contactData.content || {});
    }

    ensureToastSupport();
    syncSectionOptions();
    resetProductForm();
    resetBlogForm();

    $('#adminProductCategory').on('change', syncSectionOptions);
    $('#adminProductImage').on('input blur', function() {
        updateImagePreview({
            value: $(this).val(),
            wrapper: '#adminImagePreviewWrap',
            image: '#adminImagePreview',
            text: '#adminImagePreviewText',
            emptyText: 'Paste an image path or URL to preview it here.'
        });
    });
    $('#adminBlogImage').on('input blur', function() {
        updateImagePreview({
            value: $(this).val(),
            wrapper: '#adminBlogImagePreviewWrap',
            image: '#adminBlogImagePreview',
            text: '#adminBlogImagePreviewText',
            emptyText: 'Paste a blog image path or URL to preview it here.'
        });
    });

    $('#adminProductForm').on('submit', async function(event) {
        event.preventDefault();

        const productId = $('#adminProductId').val();
        const result = buildProductPayload();

        if (result.error) {
            setMessage('#adminFormMessage', result.error, 'error');
            window.showToast(result.error, 'error');
            return;
        }

        try {
            if (productId) {
                await requestJson(`/api/admin/products/${encodeURIComponent(productId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(result.payload)
                });
                window.showToast('Product updated successfully.', 'success');
            } else {
                await requestJson('/api/admin/products', {
                    method: 'POST',
                    body: JSON.stringify(result.payload)
                });
                window.showToast('Product added successfully.', 'success');
            }

            resetProductForm();
            setMessage('#adminFormMessage', productId ? 'Product updated successfully.' : 'Product added successfully.', 'success');
            await loadDashboard();
        } catch (error) {
            setMessage('#adminFormMessage', error.message, 'error');
            window.showToast(error.message, 'error');
        }
    });

    $('#adminBlogForm').on('submit', async function(event) {
        event.preventDefault();

        const blogId = $('#adminBlogId').val();
        const result = buildBlogPayload();

        if (result.error) {
            setMessage('#adminBlogFormMessage', result.error, 'error');
            window.showToast(result.error, 'error');
            return;
        }

        try {
            if (blogId) {
                await requestJson(`/api/admin/blog-posts/${encodeURIComponent(blogId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(result.payload)
                });
                window.showToast('Blog post updated successfully.', 'success');
            } else {
                await requestJson('/api/admin/blog-posts', {
                    method: 'POST',
                    body: JSON.stringify(result.payload)
                });
                window.showToast('Blog post added successfully.', 'success');
            }

            resetBlogForm();
            setMessage('#adminBlogFormMessage', blogId ? 'Blog post updated successfully.' : 'Blog post added successfully.', 'success');
            await loadDashboard();
        } catch (error) {
            setMessage('#adminBlogFormMessage', error.message, 'error');
            window.showToast(error.message, 'error');
        }
    });

    $('#adminContactForm').on('submit', async function(event) {
        event.preventDefault();

        const result = buildContactPayload();

        if (result.error) {
            setMessage('#adminContactFormMessage', result.error, 'error');
            window.showToast(result.error, 'error');
            return;
        }

        try {
            const response = await requestJson('/api/admin/contact-content', {
                method: 'PUT',
                body: JSON.stringify(result.payload)
            });
            populateContactForm(response.content || result.payload);
            setMessage('#adminContactFormMessage', 'Contact page details updated successfully.', 'success');
            window.showToast('Contact page details updated successfully.', 'success');
        } catch (error) {
            setMessage('#adminContactFormMessage', error.message, 'error');
            window.showToast(error.message, 'error');
        }
    });

    $(document).on('click', '.admin-edit-product', function() {
        const productId = $(this).data('product-id');
        const product = (window.adminProducts || []).find(function(item) {
            return item.id === productId;
        });

        if (!product) return;

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
        setMessage('#adminFormMessage', '');
        updateImagePreview({
            value: product.image,
            wrapper: '#adminImagePreviewWrap',
            image: '#adminImagePreview',
            text: '#adminImagePreviewText',
            emptyText: 'Paste an image path or URL to preview it here.'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $(document).on('click', '.admin-edit-blog', function() {
        const blogId = $(this).data('blog-id');
        const post = (window.adminBlogPosts || []).find(function(item) {
            return item.id === blogId;
        });

        if (!post) return;

        $('#adminBlogId').val(post.id);
        $('#adminBlogTitle').val(post.title);
        $('#adminBlogCategory').val(post.category);
        $('#adminBlogAuthor').val(post.author || '');
        $('#adminBlogPublishedAt').val(toDatetimeLocal(post.publishedAt));
        $('#adminBlogImage').val(post.image);
        $('#adminBlogExcerpt').val(post.excerpt || '');
        $('#adminBlogContent').val(post.content || '');
        $('#adminBlogQuote').val(post.quote || '');
        $('#adminBlogTags').val(Array.isArray(post.tags) ? post.tags.join(', ') : '');
        $('#adminBlogFeatured').prop('checked', Boolean(post.featured));
        $('#adminBlogFormTitle').text('Edit Blog Post');
        $('#adminBlogSubmit').text('Update Post');
        setMessage('#adminBlogFormMessage', '');
        updateImagePreview({
            value: post.image,
            wrapper: '#adminBlogImagePreviewWrap',
            image: '#adminBlogImagePreview',
            text: '#adminBlogImagePreviewText',
            emptyText: 'Paste a blog image path or URL to preview it here.'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $(document).on('click', '.admin-delete-product', async function() {
        const productId = $(this).data('product-id');
        if (!window.confirm('Delete this product?')) return;

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

    $(document).on('click', '.admin-delete-blog', async function() {
        const blogId = $(this).data('blog-id');
        if (!window.confirm('Delete this blog post?')) return;

        try {
            await requestJson(`/api/admin/blog-posts/${encodeURIComponent(blogId)}`, {
                method: 'DELETE'
            });
            window.showToast('Blog post deleted successfully.', 'success');
            await loadDashboard();
        } catch (error) {
            window.showToast(error.message, 'error');
        }
    });

    $('#adminResetForm').on('click', function() {
        resetProductForm();
    });

    $('#adminBlogResetForm').on('click', function() {
        resetBlogForm();
    });

    $('#adminContactResetForm').on('click', function() {
        populateContactForm(window.adminContactContent || {});
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
