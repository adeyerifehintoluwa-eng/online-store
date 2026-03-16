// cart.js - Handles shopping cart functionality

$(document).ready(function() {
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currencySymbol = '\u20A6';

    function ensureToastSupport() {
        if (window.showToast) return;

        const styleId = 'toast-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
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
                .app-toast--info {
                    background: #1d4ed8;
                }
            `;
            document.head.appendChild(style);
        }

        window.showToast = function(message, type) {
            const toastType = type || 'info';
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

            requestAnimationFrame(() => {
                toast.classList.add('is-visible');
            });

            setTimeout(() => {
                toast.classList.remove('is-visible');
                setTimeout(() => toast.remove(), 200);
            }, 2800);
        };
    }

    function formatCurrency(amount) {
        return `${currencySymbol}${Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    function readStoredJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
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

    function setCheckoutMessage(message, type) {
        const element = $('#checkoutMessage');
        if (!element.length) return;

        const color = type === 'success' ? 'green' : 'red';
        element.text(message).css('color', color);
    }

    function collectBillingDetails() {
        return {
            firstName: String($('#billingFirstName').val() || '').trim(),
            lastName: String($('#billingLastName').val() || '').trim(),
            country: String($('#billingCountry').val() || '').trim(),
            addressLine1: String($('#billingAddressLine1').val() || '').trim(),
            addressLine2: String($('#billingAddressLine2').val() || '').trim(),
            city: String($('#billingCity').val() || '').trim(),
            state: String($('#billingState').val() || '').trim(),
            postalCode: String($('#billingPostalCode').val() || '').trim(),
            phone: String($('#billingPhone').val() || '').trim(),
            email: String($('#billingEmail').val() || '').trim().toLowerCase(),
            notes: String($('#billingOrderNotes').val() || '').trim(),
            paymentMethod: $('input[name="payment_method"]:checked').val() || ''
        };
    }

    function validateBillingDetails(details) {
        const validations = [
            { key: 'firstName', message: 'First name is required.', selector: '#billingFirstName' },
            { key: 'lastName', message: 'Last name is required.', selector: '#billingLastName' },
            { key: 'country', message: 'Country is required.', selector: '#billingCountry' },
            { key: 'addressLine1', message: 'Street address is required.', selector: '#billingAddressLine1' },
            { key: 'city', message: 'Town/City is required.', selector: '#billingCity' },
            { key: 'state', message: 'State is required.', selector: '#billingState' },
            { key: 'postalCode', message: 'Postcode/Zip is required.', selector: '#billingPostalCode' },
            { key: 'phone', message: 'Phone number is required.', selector: '#billingPhone' },
            { key: 'email', message: 'Email address is required.', selector: '#billingEmail' }
        ];

        const firstMissing = validations.find(function(rule) {
            return !details[rule.key];
        });

        if (firstMissing) {
            return firstMissing;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
            return {
                message: 'Enter a valid email address.',
                selector: '#billingEmail'
            };
        }

        if (!/^[0-9+\-\s()]{7,20}$/.test(details.phone)) {
            return {
                message: 'Enter a valid phone number.',
                selector: '#billingPhone'
            };
        }

        if (!details.paymentMethod) {
            return {
                message: 'Select a payment method before placing your order.',
                selector: '#check-payment'
            };
        }

        return null;
    }

    function getCartTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    ensureToastSupport();

    function updateCartTotals(total) {
        const cartSummarySpans = $('.cart__total__procced ul li span');
        if (cartSummarySpans.length >= 2) {
            cartSummarySpans.eq(0).text(formatCurrency(total));
            cartSummarySpans.eq(1).text(formatCurrency(total));
        }

        const checkoutSummarySpans = $('.checkout__order__total ul li span');
        if (checkoutSummarySpans.length >= 2) {
            checkoutSummarySpans.eq(0).text(formatCurrency(total));
            checkoutSummarySpans.eq(1).text(formatCurrency(total));
        }
    }

    // Function to save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Function to update cart count in header
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        $('.icon_bag_alt').next('.tip').text(count);
    }

    // Function to add item to cart
    window.addToCart = function(productId, name, price, image, quantity) {
        const itemQuantity = Math.max(parseInt(quantity, 10) || 1, 1);
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += itemQuantity;
        } else {
            cart.push({
                id: productId,
                name: name,
                price: parseFloat(price),
                image: image,
                quantity: itemQuantity
            });
        }
        saveCart();
        window.showToast(itemQuantity > 1 ? 'Items added to cart.' : 'Item added to cart.', 'success');
        return false;
    };

    // Function to remove item from cart
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        renderCheckoutSummary();
    };

    // Function to update quantity
    window.updateQuantity = function(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(newQuantity, 10) || 0;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                renderCart();
                renderCheckoutSummary();
            }
        }
    };

    // Function to render cart on shop-cart.html
    function renderCart() {
        const cartTableBody = $('.shop__cart__table tbody');
        if (!cartTableBody.length) return;

        cartTableBody.empty();

        if (cart.length === 0) {
            cartTableBody.html('<tr><td colspan="5" style="text-align: center;">Your cart is empty.</td></tr>');
            updateCartTotals(0);
            $('.cart__total__procced .primary-btn')
                .attr('href', '#')
                .css('pointer-events', 'none')
                .css('opacity', '0.6');
            return;
        }

        $('.cart__total__procced .primary-btn')
            .attr('href', './checkout/')
            .css('pointer-events', '')
            .css('opacity', '');

        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const row = `
                <tr>
                    <td class="cart__product__item">
                        <img src="${item.image}" alt="">
                        <div class="cart__product__item__title">
                            <h6>${item.name}</h6>
                        </div>
                    </td>
                    <td class="cart__price">${formatCurrency(item.price)}</td>
                    <td class="cart__quantity">
                        <div class="pro-qty">
                            <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                        </div>
                    </td>
                    <td class="cart__total">${formatCurrency(itemTotal)}</td>
                    <td class="cart__close"><span class="icon_close" onclick="removeFromCart('${item.id}')"></span></td>
                </tr>
            `;
            cartTableBody.append(row);
        });

        updateCartTotals(total);
    }

    // Function to place order
    window.placeOrder = async function() {
        if (cart.length === 0) {
            window.showToast('Your cart is empty.', 'error');
            return;
        }

        const billingDetails = collectBillingDetails();
        const validationError = validateBillingDetails(billingDetails);
        if (validationError) {
            setCheckoutMessage(validationError.message, 'error');
            window.showToast(validationError.message, 'error');
            if (validationError.selector) {
                const field = $(validationError.selector);
                if (field.length) {
                    field.trigger('focus');
                }
            }
            return;
        }

        try {
            const payload = {
                billingDetails: billingDetails,
                items: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            };
            const data = await requestJson('/api/orders', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setCheckoutMessage('Order placed successfully.', 'success');

            if (data.order) {
                localStorage.setItem('lastOrder', JSON.stringify(data.order));
            }

            localStorage.removeItem('cart');
            cart = [];
            updateCartCount();
            renderCart();
            renderCheckoutSummary();

            const orderId = data.order && data.order.id ? `?orderId=${encodeURIComponent(data.order.id)}` : '';
            window.location.href = `./thank-you/${orderId}`;
        } catch (error) {
            window.showToast(error.message, 'error');
            if (/log in/i.test(error.message)) {
                setTimeout(() => {
                    window.location.href = './login/';
                }, 700);
            }
        }
    };

    // Function to render checkout order summary
    function renderCheckoutSummary() {
        const orderProductUl = $('.checkout__order__product ul');
        if (!orderProductUl.length) return;

        // Clear existing items except header
        orderProductUl.find('li:not(:first)').remove();

        if (cart.length === 0) {
            orderProductUl.append('<li>Your cart is empty. <span>0 items</span></li>');
            updateCartTotals(0);
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const li = `<li>${index + 1}. ${item.name} <span>${formatCurrency(itemTotal)}</span></li>`;
            orderProductUl.append(li);
        });

        updateCartTotals(total);
    }

    // Initialize cart count on page load
    updateCartCount();

    // Render cart if on cart page
    if ($('.shop__cart__table').length) {
        renderCart();
    }

    // Render checkout summary if on checkout page
    if ($('.checkout__order').length) {
        renderCheckoutSummary();
    }
});
