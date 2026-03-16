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

    function formatDate(value) {
        return new Date(value).toLocaleString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function renderOrders(orders) {
        if (!orders.length) {
            $('#ordersTrackingList').html(`
                <div style="padding: 28px; border: 1px solid #f2f2f2; text-align: center;">
                    <h5 style="margin-bottom: 10px;">No orders yet</h5>
                    <p style="margin-bottom: 18px; color: #666;">Your KT Fashion orders will appear here after checkout.</p>
                    <a href="./shop/" class="primary-btn">Browse Shop</a>
                </div>
            `);
            return;
        }

        $('#ordersTrackingList').html(orders.map(function(order) {
            const billing = order.billingDetails || {};
            return `
                <div style="padding: 24px; border: 1px solid #f2f2f2; margin-bottom: 18px;">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 style="margin-bottom: 8px;">${escapeHtml(order.id)}</h5>
                            <p style="margin-bottom: 8px; color: #666;">Placed on ${formatDate(order.createdAt)}</p>
                            <p style="margin: 0; color: #666;">${escapeHtml(billing.firstName || '')} ${escapeHtml(billing.lastName || '')} • ${escapeHtml(billing.phone || 'No phone')}</p>
                        </div>
                        <div class="col-md-4 text-md-right" style="margin-top: 12px;">
                            <div style="font-weight: 700; margin-bottom: 6px;">${formatCurrency(order.total)}</div>
                            <div style="color: #ca1515; font-weight: 600;">${escapeHtml(order.status)}</div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; border-top: 1px solid #f2f2f2; padding-top: 14px;">
                        ${(order.items || []).map(function(item) {
                            return `
                                <div style="display: flex; justify-content: space-between; gap: 16px; padding: 6px 0;">
                                    <span>${escapeHtml(item.name)} x ${item.quantity}</span>
                                    <span>${formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join(''));
    }

    let allOrders = [];

    function applyFilter() {
        const query = String($('#ordersSearchInput').val() || '').trim().toLowerCase();
        if (!query) {
            renderOrders(allOrders);
            return;
        }

        renderOrders(allOrders.filter(function(order) {
            return order.id.toLowerCase().includes(query);
        }));
    }

    requestJson('/api/auth/session', { method: 'GET' })
        .then(function(session) {
            const user = session.user;

            if (!session.authenticated || !user) {
                $('#ordersTrackingContent').replaceWith(`
                    <div style="padding: 34px; border: 1px solid #f2f2f2; text-align: center;">
                        <h4 style="margin-bottom: 12px;">Sign in to track your orders</h4>
                        <p style="margin-bottom: 18px; color: #666;">Order history and billing details are available after login.</p>
                        <a href="./login/" class="primary-btn">Go to Login</a>
                    </div>
                `);
                return null;
            }

            return requestJson('/api/orders', { method: 'GET' });
        })
        .then(function(data) {
            if (!data) {
                return;
            }

            allOrders = data.orders || [];
            $('#ordersTrackingContent').show();
            renderOrders(allOrders);
            $('#ordersSearchInput').on('input', applyFilter);
        })
        .catch(function(error) {
            $('#ordersTrackingContent').html(`
                <div style="padding: 34px; border: 1px solid #f2f2f2; text-align: center;">
                    <h4 style="margin-bottom: 12px;">Unable to load orders</h4>
                    <p style="margin: 0; color: #666;">${escapeHtml(error.message)}</p>
                </div>
            `);
        });
});
