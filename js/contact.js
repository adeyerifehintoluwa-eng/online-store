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

    requestJson('/api/contact-content', { method: 'GET' })
        .then(function(data) {
            const content = data.content || {};
            $('#contactPageTitle').text(content.title || 'Talk to KT Fashion');
            $('#contactPageIntro').text(content.intro || '');
            $('#contactAddress').text(content.address || '');
            $('#contactSupportLabel').text(content.supportLabel || 'Customer Support');
            $('#contactSupportEmail').text(content.supportEmail || '');
            $('#contactPhones').html([
                content.primaryPhone ? `<span>${escapeHtml(content.primaryPhone)}</span>` : '',
                content.secondaryPhone ? `<span>${escapeHtml(content.secondaryPhone)}</span>` : ''
            ].filter(Boolean).join(''));
            $('#contactMapEmbed').attr('src', content.mapEmbedUrl || '');
        })
        .catch(function(error) {
            $('#contactPageIntro').text(error.message);
        });

    $('#contactStaticForm').on('submit', function(event) {
        event.preventDefault();
        $('#contactFormMessage').text('Thanks. This demo contact form is not wired to email yet, but KT Fashion contact details above are editable from the admin dashboard.');
        this.reset();
    });
});
