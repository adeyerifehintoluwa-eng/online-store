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
        return new Date(value).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    Promise.all([
        requestJson('/api/auth/session', { method: 'GET' }),
        requestJson('/api/orders', { method: 'GET' }).catch(function() {
            return { orders: [] };
        })
    ])
        .then(function(results) {
            const session = results[0];
            const orders = results[1].orders || [];
            const user = session.user;

            if (!session.authenticated || !user) {
                $('#myAccountContent').html(`
                    <div style="padding: 34px; border: 1px solid #f2f2f2; text-align: center;">
                        <h4 style="margin-bottom: 12px;">Sign in to view your account</h4>
                        <p style="margin-bottom: 18px; color: #666;">Your profile details, orders, and saved shopping shortcuts will appear here after login.</p>
                        <a href="./login/" class="primary-btn">Go to Login</a>
                    </div>
                `);
                return;
            }

            const totalSpent = orders.reduce(function(sum, order) {
                return sum + Number(order.total || 0);
            }, 0);
            const latestOrder = orders[0];

            $('#myAccountContent').html(`
                <div class="row">
                    <div class="col-lg-4">
                        <div style="padding: 28px; background: #f9f2ea; margin-bottom: 24px;">
                            <span style="display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #ca1515; margin-bottom: 14px;">Profile</span>
                            <h4 style="margin-bottom: 10px;">${escapeHtml(user.name)}</h4>
                            <p style="margin-bottom: 8px; color: #555;">${escapeHtml(user.email)}</p>
                            <p style="margin: 0; color: #555; text-transform: capitalize;">${escapeHtml(user.role || 'customer')}</p>
                        </div>
                        <div style="padding: 24px; border: 1px solid #f2f2f2; margin-bottom: 18px;">
                            <p style="margin-bottom: 8px; color: #666;">Orders placed</p>
                            <h3 style="margin: 0;">${orders.length}</h3>
                        </div>
                        <div style="padding: 24px; border: 1px solid #f2f2f2;">
                            <p style="margin-bottom: 8px; color: #666;">Total spent</p>
                            <h3 style="margin: 0;">${formatCurrency(totalSpent)}</h3>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div style="padding: 28px; border: 1px solid #f2f2f2; margin-bottom: 24px;">
                            <h5 style="margin-bottom: 18px;">Account summary</h5>
                            <p style="color: #666; line-height: 1.9; margin-bottom: 16px;">
                                Welcome back to KT Fashion. Use this page to review your recent orders, move quickly to the shop, or continue checkout when you are ready.
                            </p>
                            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                                <a href="./shop/" class="primary-btn">Shop Collection</a>
                                <a href="./orders-tracking/" class="primary-btn" style="background: #111;">Track Orders</a>
                                <a href="./wishlist/" class="primary-btn" style="background: #444;">Wishlist</a>
                            </div>
                        </div>
                        <div style="padding: 28px; border: 1px solid #f2f2f2;">
                            <h5 style="margin-bottom: 18px;">Recent orders</h5>
                            ${latestOrder ? `
                                <div style="padding: 20px; background: #fafafa; margin-bottom: 18px;">
                                    <p style="margin-bottom: 8px; color: #666;">Latest order</p>
                                    <h6 style="margin-bottom: 8px;">${escapeHtml(latestOrder.id)}</h6>
                                    <p style="margin-bottom: 6px; color: #666;">Placed on ${formatDate(latestOrder.createdAt)}</p>
                                    <p style="margin: 0; color: #111; font-weight: 600;">${formatCurrency(latestOrder.total)} • ${escapeHtml(latestOrder.status)}</p>
                                </div>
                            ` : `
                                <p style="color: #666; margin-bottom: 18px;">You have not placed any orders yet.</p>
                            `}
                            <div>
                                ${orders.slice(0, 3).map(function(order) {
                                    return `
                                        <div style="display: flex; justify-content: space-between; gap: 18px; padding: 14px 0; border-top: 1px solid #f2f2f2;">
                                            <div>
                                                <strong>${escapeHtml(order.id)}</strong>
                                                <div style="color: #666;">${formatDate(order.createdAt)} • ${order.itemCount} item(s)</div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-weight: 600;">${formatCurrency(order.total)}</div>
                                                <div style="color: #666;">${escapeHtml(order.status)}</div>
                                            </div>
                                        </div>
                                    `;
                                }).join('') || '<p style="color: #666; margin: 0;">No recent orders to show.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `);
        })
        .catch(function(error) {
            $('#myAccountContent').html(`
                <div style="padding: 34px; border: 1px solid #f2f2f2; text-align: center;">
                    <h4 style="margin-bottom: 12px;">Unable to load account</h4>
                    <p style="margin: 0; color: #666;">${escapeHtml(error.message)}</p>
                </div>
            `);
        });
});
