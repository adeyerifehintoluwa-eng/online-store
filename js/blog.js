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

    function formatDate(value) {
        return new Date(value).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function renderHero(post) {
        $('#blogHeroFeature').html(`
            <div style="margin-bottom: 40px; background: #f9f2ea; overflow: hidden;">
                <div class="row align-items-center no-gutters">
                    <div class="col-lg-6">
                        <div style="padding: 36px 34px;">
                            <span style="display: inline-block; font-size: 12px; letter-spacing: 0.18em; font-weight: 700; text-transform: uppercase; color: #ca1515; margin-bottom: 16px;">KT Fashion Journal</span>
                            <h2 style="font-size: 36px; line-height: 1.25; margin-bottom: 14px;">${escapeHtml(post.title)}</h2>
                            <p style="color: #444; line-height: 1.9; margin-bottom: 18px;">${escapeHtml(post.excerpt)}</p>
                            <ul style="display: flex; flex-wrap: wrap; gap: 16px; padding: 0; margin: 0 0 24px; list-style: none; color: #666;">
                                <li>By <span style="color: #111;">${escapeHtml(post.author)}</span></li>
                                <li>${formatDate(post.publishedAt)}</li>
                                <li>${post.readTimeMinutes} min read</li>
                            </ul>
                            <a href="./blog-details/?id=${encodeURIComponent(post.id)}" class="primary-btn">Read Article</a>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div style="min-height: 390px; background-image: url('${escapeHtml(post.image)}'); background-size: cover; background-position: center;"></div>
                    </div>
                </div>
            </div>
        `);
    }

    function renderPosts(posts) {
        if (!posts.length) {
            $('#blogPostsGrid').html(`
                <div class="col-lg-12">
                    <div style="padding: 32px; border: 1px solid #f2f2f2; text-align: center;">
                        <h5 style="margin-bottom: 10px;">No journal entries yet</h5>
                        <p style="margin: 0; color: #666;">KT Fashion blog posts will appear here as soon as they are published.</p>
                    </div>
                </div>
            `);
            return;
        }

        $('#blogPostsGrid').html(posts.map(function(post) {
            return `
                <div class="col-lg-6 col-md-6 col-sm-6">
                    <div class="blog__item" style="margin-bottom: 34px;">
                        <div class="blog__item__pic" style="height: 260px; background-image: url('${escapeHtml(post.image)}'); background-size: cover; background-position: center;"></div>
                        <div class="blog__item__text">
                            <span style="display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ca1515; margin-bottom: 10px;">${escapeHtml(post.category)}</span>
                            <h6><a href="./blog-details/?id=${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h6>
                            <p style="color: #666; line-height: 1.8; margin-bottom: 14px;">${escapeHtml(post.excerpt)}</p>
                            <ul>
                                <li>by <span>${escapeHtml(post.author)}</span></li>
                                <li>${formatDate(post.publishedAt)}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }).join(''));
    }

    function renderSidebar(posts, heroPostId) {
        const categories = posts.reduce(function(map, post) {
            map.set(post.category, (map.get(post.category) || 0) + 1);
            return map;
        }, new Map());
        const categoryMarkup = Array.from(categories.entries()).map(function(entry) {
            return `<li><a href="./blog/">${escapeHtml(entry[0])} <span>(${entry[1]})</span></a></li>`;
        }).join('');
        const featuredPosts = posts.filter(function(post) {
            return post.id !== heroPostId;
        }).slice(0, 3);
        const tags = Array.from(new Set(posts.flatMap(function(post) {
            return Array.isArray(post.tags) ? post.tags : [];
        }))).slice(0, 10);

        $('#blogCategoryList').html(categoryMarkup || '<li><a href="./blog/">KT Fashion <span>(0)</span></a></li>');
        $('#blogFeaturedPosts').html(featuredPosts.map(function(post) {
            return `
                <a href="./blog-details/?id=${encodeURIComponent(post.id)}" class="blog__feature__item">
                    <div class="blog__feature__item__pic">
                        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">
                    </div>
                    <div class="blog__feature__item__text">
                        <h6>${escapeHtml(post.title)}</h6>
                        <span>${formatDate(post.publishedAt)}</span>
                    </div>
                </a>
            `;
        }).join(''));
        $('#blogTagCloud').html(tags.map(function(tag) {
            return `<a href="./blog/">${escapeHtml(tag)}</a>`;
        }).join(''));
    }

    requestJson('/api/blog-posts', { method: 'GET' })
        .then(function(data) {
            const posts = data.posts || [];
            const heroPost = posts.find(function(post) {
                return post.featured;
            }) || posts[0];
            const gridPosts = posts.filter(function(post) {
                return !heroPost || post.id !== heroPost.id;
            });

            if (heroPost) {
                renderHero(heroPost);
            } else {
                $('#blogHeroFeature').html('');
            }

            renderPosts(gridPosts);
            renderSidebar(posts, heroPost ? heroPost.id : '');
        })
        .catch(function(error) {
            $('#blogHeroFeature').html('');
            $('#blogPostsGrid').html(`
                <div class="col-lg-12">
                    <div style="padding: 32px; border: 1px solid #f2f2f2; text-align: center;">
                        <h5 style="margin-bottom: 10px;">Unable to load the journal</h5>
                        <p style="margin: 0; color: #666;">${escapeHtml(error.message)}</p>
                    </div>
                </div>
            `);
        });
});
