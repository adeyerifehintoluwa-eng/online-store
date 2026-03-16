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

    function getPostId() {
        return new URLSearchParams(window.location.search).get('id');
    }

    function renderSidebar(posts, currentPostId) {
        const categories = posts.reduce(function(map, post) {
            map.set(post.category, (map.get(post.category) || 0) + 1);
            return map;
        }, new Map());
        const categoryMarkup = Array.from(categories.entries()).map(function(entry) {
            return `<li><a href="./blog/">${escapeHtml(entry[0])} <span>(${entry[1]})</span></a></li>`;
        }).join('');
        const featuredPosts = posts.filter(function(post) {
            return post.id !== currentPostId;
        }).slice(0, 3);
        const tags = Array.from(new Set(posts.flatMap(function(post) {
            return Array.isArray(post.tags) ? post.tags : [];
        }))).slice(0, 10);

        $('#blogDetailCategoryList').html(categoryMarkup);
        $('#blogDetailFeaturedPosts').html(featuredPosts.map(function(post) {
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
        $('#blogDetailTagCloud').html(tags.map(function(tag) {
            return `<a href="./blog/">${escapeHtml(tag)}</a>`;
        }).join(''));
    }

    function renderRelatedPosts(posts, currentPostId) {
        const relatedPosts = posts.filter(function(post) {
            return post.id !== currentPostId;
        }).slice(0, 3);

        $('#blogRelatedPosts').html(relatedPosts.map(function(post) {
            return `
                <div class="col-lg-4 col-md-6">
                    <div class="blog__item" style="margin-bottom: 0;">
                        <div class="blog__item__pic" style="height: 220px; background-image: url('${escapeHtml(post.image)}'); background-size: cover; background-position: center;"></div>
                        <div class="blog__item__text">
                            <span style="display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ca1515; margin-bottom: 10px;">${escapeHtml(post.category)}</span>
                            <h6><a href="./blog-details/?id=${encodeURIComponent(post.id)}">${escapeHtml(post.title)}</a></h6>
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

    function renderPost(post, posts) {
        const paragraphs = String(post.content || '')
            .split(/\n\s*\n/)
            .map(function(paragraph) {
                return paragraph.trim();
            })
            .filter(Boolean);
        const orderedPosts = posts.slice().sort(function(left, right) {
            return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
        });
        const currentIndex = orderedPosts.findIndex(function(item) {
            return item.id === post.id;
        });
        const previousPost = currentIndex >= 0 ? orderedPosts[currentIndex + 1] : null;
        const nextPost = currentIndex > 0 ? orderedPosts[currentIndex - 1] : null;

        document.title = `KT Fashion | ${post.title}`;
        $('#blogDetailBreadcrumbTitle').text(post.title);
        $('#blogDetailMain').html(`
            <div class="blog__details__item">
                <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">
                <div class="blog__details__item__title">
                    <span class="tip">${escapeHtml(post.category)}</span>
                    <h4>${escapeHtml(post.title)}</h4>
                    <ul>
                        <li>by <span>${escapeHtml(post.author)}</span></li>
                        <li>${formatDate(post.publishedAt)}</li>
                        <li>${post.readTimeMinutes} min read</li>
                    </ul>
                </div>
            </div>
            <div class="blog__details__desc">
                ${paragraphs.map(function(paragraph) {
                    return `<p>${escapeHtml(paragraph)}</p>`;
                }).join('')}
            </div>
            ${post.quote ? `
                <div class="blog__details__quote">
                    <div class="icon"><i class="fa fa-quote-left"></i></div>
                    <p>${escapeHtml(post.quote)}</p>
                </div>
            ` : ''}
            <div class="blog__details__tags">
                ${post.tags.map(function(tag) {
                    return `<a href="./blog/">${escapeHtml(tag)}</a>`;
                }).join('')}
            </div>
            <div class="blog__details__btns">
                <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-6">
                        <div class="blog__details__btn__item">
                            ${previousPost ? `<h6><a href="./blog-details/?id=${encodeURIComponent(previousPost.id)}"><i class="fa fa-angle-left"></i> Previous article</a></h6>` : ''}
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6">
                        <div class="blog__details__btn__item blog__details__btn__item--next">
                            ${nextPost ? `<h6><a href="./blog-details/?id=${encodeURIComponent(nextPost.id)}">Next article <i class="fa fa-angle-right"></i></a></h6>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `);

        renderSidebar(posts, post.id);
        renderRelatedPosts(posts, post.id);
    }

    Promise.all([
        requestJson('/api/blog-posts', { method: 'GET' }),
        (function() {
            const postId = getPostId();
            if (!postId) {
                return Promise.resolve({ post: null });
            }

            return requestJson(`/api/blog-posts/${encodeURIComponent(postId)}`, { method: 'GET' });
        })()
    ])
        .then(function(results) {
            const posts = results[0].posts || [];
            const explicitPost = results[1].post;
            const fallbackPost = posts[0];
            const post = explicitPost || fallbackPost;

            if (!post) {
                $('#blogDetailMain').html(`
                    <div style="padding: 32px; border: 1px solid #f2f2f2;">
                        <h5 style="margin-bottom: 10px;">Article not found</h5>
                        <p style="margin: 0; color: #666;">The requested KT Fashion journal article could not be found.</p>
                    </div>
                `);
                return;
            }

            renderPost(post, posts);
        })
        .catch(function(error) {
            $('#blogDetailMain').html(`
                <div style="padding: 32px; border: 1px solid #f2f2f2;">
                    <h5 style="margin-bottom: 10px;">Unable to load article</h5>
                    <p style="margin: 0; color: #666;">${escapeHtml(error.message)}</p>
                </div>
            `);
        });
});
