$(document).ready(function() {
    function readStoredJson(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function formatCurrency(amount) {
        return `\u20A6${Number(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    function renderOrder(order) {
        if (!order) {
            $('#thankYouHeadline').text('No recent order was found, but you can continue shopping.');
            return;
        }

        $('#thankYouHeadline').text(`Thank you, ${order.customerName}. Your purchase was completed successfully.`);
        $('#thankYouOrderId').text(order.id || '-');
        $('#thankYouItemCount').text(order.itemCount || 0);
        $('#thankYouTotal').text(formatCurrency(order.total));
        $('#thankYouDate').text(new Date(order.createdAt).toLocaleString());

        if (Array.isArray(order.items) && order.items.length) {
            const itemsMarkup = order.items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #f2f2f2;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>
            `).join('');

            $('#thankYouItems').html(`
                <h6 style="margin-bottom: 12px;">Order Summary</h6>
                <div style="border-bottom: 1px solid #f2f2f2;">${itemsMarkup}</div>
            `);
        }
    }

    async function loadOrder() {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('orderId');

        if (orderId) {
            try {
                const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.order) {
                        localStorage.setItem('lastOrder', JSON.stringify(data.order));
                        renderOrder(data.order);
                        return;
                    }
                }
            } catch (error) {
                // Fall back to cached order if available.
            }
        }

        renderOrder(readStoredJson('lastOrder', null));
    }

    loadOrder();
});
