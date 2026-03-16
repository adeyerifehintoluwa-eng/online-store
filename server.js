const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const BLOG_POSTS_FILE = path.join(DATA_DIR, 'blog-posts.json');
const CONTACT_CONTENT_FILE = path.join(DATA_DIR, 'contact-content.json');
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PORT = Number(process.env.PORT || 3000);

const OWNER_EMAIL = 'owner@ktfashion.com';
const OWNER_PASSWORD = 'Owner@123';

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const PAGE_ROUTES = {
    '/': 'index.html',
    '/admin/': 'admin.html',
    '/about/': 'about.html',
    '/blog/': 'blog.html',
    '/blog-details/': 'blog-details.html',
    '/checkout/': 'checkout.html',
    '/contact/': 'contact.html',
    '/faq/': 'faq.html',
    '/login/': 'login.html',
    '/men/': 'men.html',
    '/my-account/': 'my-account.html',
    '/orders-tracking/': 'orders-tracking.html',
    '/product-details/': 'product-details.html',
    '/shop/': 'shop.html',
    '/shop-cart/': 'shop-cart.html',
    '/signup/': 'signup.html',
    '/thank-you/': 'thank-you.html',
    '/wishlist/': 'wishlist.html',
    '/women/': 'women.html'
};

const SEED_PRODUCTS = [
    {
        id: 'product1',
        name: 'Ankara Dress',
        price: 18000,
        image: 'img/product/details/Ankara-gown.jpg',
        category: 'Women',
        section: 'wears',
        description: 'A tailored Ankara dress designed for events, birthdays, and polished daywear.',
        specification: 'Structured silhouette, full-length finish, breathable fabric, and made-for-occasion styling.',
        care: 'Dry clean or hand wash gently. Steam on low heat to preserve the finish.',
        badge: 'Best Seller',
        featured: true
    },
    {
        id: 'product2',
        name: 'Aso-oke Dress',
        price: 18000,
        image: 'img/product/details/aso-oke-b.jpg',
        category: 'Women',
        section: 'wears',
        description: 'A refined Aso-oke dress with a soft drape and occasion-ready finish.',
        specification: 'Statement texture, elegant volume, lined interior, and comfortable movement.',
        care: 'Spot clean when needed and store on a padded hanger.',
        badge: 'Signature',
        featured: true
    },
    {
        id: 'product3',
        name: 'Aso-oke Iro and Buba',
        price: 180000,
        image: 'img/product/details/iro-buba.jpg',
        category: 'Women',
        section: 'wears',
        description: 'A complete iro and buba set crafted for ceremonies and standout traditional looks.',
        specification: 'Matching two-piece set, premium woven fabric, and a generous ceremonial fit.',
        care: 'Professional cleaning recommended for best longevity.',
        badge: 'Premium',
        featured: false
    },
    {
        id: 'product4',
        name: "Agbeke's Kimono",
        price: 44999000,
        image: 'img/product/details/bou-bou.jpg',
        category: 'Women',
        section: 'wears',
        description: 'A dramatic luxury kimono with flowing volume and a statement silhouette.',
        specification: 'Floor-length cut, elevated finish, and bold presence for premium styling.',
        care: 'Dry clean only and store away from direct sunlight.',
        badge: 'Luxury',
        featured: false
    },
    {
        id: 'product5',
        name: "Adunni's Bag",
        price: 28000,
        image: 'img/product/details/Adunni-bag.jpeg',
        category: 'Women',
        section: 'bags',
        description: 'A compact statement bag that complements both native and modern outfits.',
        specification: 'Structured body, fashion-forward finish, and easy day-to-event carry.',
        care: 'Wipe clean with a soft dry cloth after use.',
        badge: 'New',
        featured: true
    },
    {
        id: 'product6',
        name: 'Aduke Aso-oke Bag',
        price: 47000,
        image: 'img/product/details/Aso-oke-bag.jpg',
        category: 'Women',
        section: 'bags',
        description: 'A statement Aso-oke bag built to pair with celebratory looks and coordinated sets.',
        specification: 'Textured woven finish, sturdy carry shape, and polished hardware detailing.',
        care: 'Store upright and avoid excess moisture.',
        badge: 'Handpicked',
        featured: false
    },
    {
        id: 'product7',
        name: 'Iyunade Neck Set',
        price: 210000,
        image: 'img/product/details/bead-1.jpg',
        category: 'Women',
        section: 'jewelry',
        description: 'A regal neck set designed to complete bridal and celebration styling.',
        specification: 'Bold beadwork, ceremonial finish, and coordinated statement presentation.',
        care: 'Keep dry and store in a lined jewelry box.',
        badge: 'Occasion',
        featured: true
    },
    {
        id: 'product8',
        name: "Sijuade and Adedoyin's Set",
        price: 210000,
        image: 'img/product/details/bead-2.jpg',
        category: 'Women',
        section: 'jewelry',
        description: 'A coordinated jewelry set created for high-impact traditional dressing.',
        specification: 'Layered bead composition, rich color story, and complete event styling.',
        care: 'Avoid perfumes and moisture directly on the beads.',
        badge: 'Exclusive',
        featured: false
    },
    {
        id: 'product9',
        name: "Ayaba's Luxury Set",
        price: 210000,
        image: 'img/product/details/bead-3.jpg',
        category: 'Women',
        section: 'jewelry',
        description: 'A luxury bead set intended for queenship-inspired ceremonial outfits.',
        specification: 'Grand statement sizing, premium presentation, and standout finishing.',
        care: 'Store flat and handle delicately between wears.',
        badge: 'Luxury',
        featured: false
    },
    {
        id: 'men-product-1',
        name: 'Men Aso-Oke',
        price: 12000,
        image: 'img/product/details/men-Aso-oke.jpg',
        category: 'Men',
        section: 'traditional',
        description: 'A crisp traditional men\'s Aso-oke look with a clean ceremonial finish.',
        specification: 'Sharp fit, classic woven texture, and easy styling for celebrations.',
        care: 'Dry clean to preserve the structure and texture.',
        badge: 'Classic',
        featured: true
    },
    {
        id: 'men-product-2',
        name: 'Traditional Set',
        price: 25000,
        image: 'img/product/details/men-1.jpg',
        category: 'Men',
        section: 'traditional',
        description: 'A complete men\'s traditional set that balances comfort with occasion styling.',
        specification: 'Matching set, relaxed movement, and versatile event-ready presentation.',
        care: 'Hand wash gently or dry clean for best results.',
        badge: 'Featured',
        featured: true
    }
];

const SEED_BLOG_POSTS = [
    {
        id: 'styling-aso-oke-for-modern-occasions',
        title: 'Styling Aso-Oke for modern occasions without losing the cultural statement',
        excerpt: 'From weddings to engagement shoots, KT Fashion shares how to wear Aso-Oke with structure, comfort, and the right accessories.',
        image: 'img/product/details/aso-oke-b.jpg',
        category: 'Style Guide',
        author: 'KT Fashion Team',
        quote: 'The strongest native look is not always the loudest one. It is the outfit that feels intentional from fabric to finishing.',
        content: 'Aso-Oke remains one of the strongest pieces in Nigerian occasion dressing because it carries texture, heritage, and presence in a way very few fabrics can. The difference between a look that feels heavy and a look that feels refined usually comes down to fit, proportion, and how the accessories are handled.\n\nAt KT Fashion, we usually advise clients to start with the event itself. A morning introduction, a church wedding, and a late-evening reception do not all ask for the same silhouette. When the fabric already has depth, the rest of the styling should support it instead of competing with it.\n\nFor women, structured dresses, iro and buba sets, and softer layered wraps all work well when the neckline, sleeve volume, and jewelry are chosen carefully. For men, a clean-cut traditional set in the right tone immediately feels elevated when paired with neat footwear and a composed overall fit.\n\nThe easiest way to keep an Aso-Oke look modern is to balance one statement element with calm supporting pieces. If the fabric is bold, let the bag, beads, or gele work with it rather than against it. That balance is where elegance shows.',
        tags: ['Aso-Oke', 'Occasion Wear', 'Styling', 'KT Fashion'],
        featured: true,
        publishedAt: '2026-03-05T09:00:00.000Z'
    },
    {
        id: 'choosing-the-right-ankara-silhouette',
        title: 'Choosing the right Ankara silhouette for birthdays, owambes, and polished daywear',
        excerpt: 'Ankara works best when the cut matches the occasion. This KT Fashion guide breaks down how to choose shapes that flatter and still feel practical.',
        image: 'img/product/details/Ankara-gown.jpg',
        category: 'Fashion Tips',
        author: 'KT Fashion Team',
        quote: 'Print alone does not make the outfit memorable. Shape is what gives Ankara confidence.',
        content: 'Ankara is flexible enough to move from casual daywear to celebration dressing, but the silhouette changes everything. A dress that works beautifully for a brunch or birthday setup may not carry the same energy for a wedding guest look.\n\nWhen clients come to KT Fashion for Ankara pieces, we look at three things first: where the outfit will be worn, how much movement the person wants, and what level of statement the print already makes. Once those are clear, the cut becomes easier to get right.\n\nStraight silhouettes create a polished and easy finish, especially when the fabric print is already busy. Fitted waistlines and fuller skirts bring drama and photograph well for events, while softer kimono-inspired shapes feel relaxed but still intentional when styled properly.\n\nThe safest way to avoid an overworked Ankara look is to let one idea lead the outfit. Either the print leads, the sleeve shape leads, or the accessories lead. When everything tries to dominate, the outfit loses clarity.',
        tags: ['Ankara', 'Women', 'Style Guide', 'Events'],
        featured: true,
        publishedAt: '2026-03-01T11:00:00.000Z'
    },
    {
        id: 'statement-beads-for-bridal-and-celebration-looks',
        title: 'How statement beads complete bridal and celebration looks',
        excerpt: 'Beads are not an afterthought in traditional styling. KT Fashion explains how to choose sets that support the outfit and frame the face correctly.',
        image: 'img/product/details/Adunni-bag.jpeg',
        category: 'Accessories',
        author: 'KT Fashion Team',
        quote: 'Jewelry should finish the outfit, not interrupt it.',
        content: 'In traditional fashion, beads do more than decorate the neck. They frame the face, connect the colors in the outfit, and often carry the ceremonial energy of the entire look. That is why the wrong bead size or color can throw off an otherwise excellent outfit.\n\nFor brides and celebrants, we usually recommend starting from the neckline and the mood of the event. A higher neckline often works better with a more deliberate layered set, while open or sculpted necklines can carry bolder statement pieces with more breathing room.\n\nColor matters just as much as size. Rich corals, wine tones, ivory, and deep reds all communicate differently depending on the fabric and skin tone beside them. Matching exactly is not always necessary. Coordination is often more elegant than strict sameness.\n\nKT Fashion bead sets are chosen to feel complete with occasion wear, not separate from it. The right set should make the clothing feel more expensive, more settled, and more memorable the moment it is worn.',
        tags: ['Beads', 'Jewelry', 'Bridal', 'Accessories'],
        featured: false,
        publishedAt: '2026-02-23T10:30:00.000Z'
    },
    {
        id: 'pairing-handcrafted-bags-with-native-outfits',
        title: 'Pairing handcrafted bags with native outfits the right way',
        excerpt: 'A good bag should support the fabric story. Here is how KT Fashion approaches bags for Aso-Oke, Ankara, and event-ready styling.',
        image: 'img/product/details/Aso-oke-bag.jpg',
        category: 'Accessories',
        author: 'KT Fashion Team',
        quote: 'A statement bag works best when it feels like part of the outfit story, not a last-minute extra.',
        content: 'Handcrafted bags have become an essential part of modern native styling because they bridge function and style so easily. They can echo the texture of the fabric, repeat a color, or bring structure into a look that needs a sharper finish.\n\nThe mistake many people make is choosing a bag only because it is beautiful on its own. A bag can be lovely and still be the wrong choice for the outfit. Scale, texture, and occasion all matter.\n\nFor Aso-Oke looks, structured bags with a visible woven or textural finish tend to sit better than overly soft shapes. Ankara styling is more flexible, but even there, the cleaner the silhouette, the easier it is for the print to remain the focus.\n\nAt KT Fashion, we think of the bag as a styling anchor. If it repeats one strong idea from the outfit and leaves the rest alone, it usually lands well.',
        tags: ['Bags', 'Aso-Oke', 'Ankara', 'Styling'],
        featured: false,
        publishedAt: '2026-02-18T14:00:00.000Z'
    },
    {
        id: 'building-a-coordinated-his-and-hers-look',
        title: 'Building a coordinated his-and-hers traditional look without looking overmatched',
        excerpt: 'Couples do not need identical outfits to look aligned. KT Fashion shares how to coordinate color, texture, and detail for events.',
        image: 'img/product/details/men-Aso-oke.jpg',
        category: 'Occasion Wear',
        author: 'KT Fashion Team',
        quote: 'Coordination looks strongest when two outfits feel connected, not duplicated.',
        content: 'Coordinated couple styling has become a major part of engagement ceremonies, traditional weddings, and celebration shoots. The strongest result is rarely full duplication. It is usually a shared color conversation, matching intensity, and one or two repeated details.\n\nWhen building his-and-hers looks, we start with the main event tone. If the woman is wearing a richly textured Aso-Oke dress, the man does not have to wear the exact same texture in the exact same volume. He only needs enough connection in color family or finish to make the pairing feel deliberate.\n\nAccessories should also be coordinated with restraint. Matching every single detail can make the styling feel forced. Instead, choose one or two touchpoints such as a shared accent color, complementary beads, or a bag and cap story that feels linked.\n\nKT Fashion pieces are selected to work in combinations, which makes couple styling easier. The goal is always balance: two strong looks, clearly connected, with room for each person to still stand on their own.',
        tags: ['Men', 'Women', 'Couples', 'Occasion Wear'],
        featured: true,
        publishedAt: '2026-02-10T15:00:00.000Z'
    }
];

const SEED_CONTACT_CONTENT = {
    title: 'Talk to KT Fashion',
    intro: 'Reach out for product questions, styling guidance, account help, or order support. KT Fashion uses this page to make sure customers know where to go when they need quick help.',
    address: 'KT Fashion Store, Lagos, Nigeria',
    primaryPhone: '+234 801 234 5678',
    secondaryPhone: '+234 809 876 5432',
    supportLabel: 'Customer Support',
    supportEmail: 'support@ktfashion.com',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126871.56902579633!2d3.2889702440969008!3d6.548035692223913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8c7a5222cf51%3A0xb0f858b71e4f8db0!2sLagos!5e0!3m2!1sen!2sng!4v1710000000000!5m2!1sen!2sng'
};

const sessions = new Map();

function ensureDataFiles() {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(PRODUCTS_FILE)) {
        writeJson(PRODUCTS_FILE, SEED_PRODUCTS.map(withTimestamps));
    }

    if (!fs.existsSync(USERS_FILE)) {
        writeJson(USERS_FILE, []);
    }

    if (!fs.existsSync(ORDERS_FILE)) {
        writeJson(ORDERS_FILE, []);
    }

    if (!fs.existsSync(BLOG_POSTS_FILE)) {
        writeJson(BLOG_POSTS_FILE, SEED_BLOG_POSTS.map(withBlogTimestamps));
    }

    if (!fs.existsSync(CONTACT_CONTENT_FILE)) {
        writeJson(CONTACT_CONTENT_FILE, SEED_CONTACT_CONTENT);
    }

    const users = readJson(USERS_FILE, []);
    const ownerExists = users.some((user) => user.email === OWNER_EMAIL);

    if (!ownerExists) {
        const passwordData = createPasswordHash(OWNER_PASSWORD);
        users.push({
            id: `user_${Date.now()}`,
            name: 'KT Fashion Owner',
            email: OWNER_EMAIL,
            role: 'admin',
            passwordHash: passwordData.hash,
            passwordSalt: passwordData.salt,
            createdAt: new Date().toISOString()
        });
        writeJson(USERS_FILE, users);
    }
}

function withTimestamps(product) {
    const now = new Date().toISOString();
    return {
        ...product,
        createdAt: product.createdAt || now,
        updatedAt: product.updatedAt || now
    };
}

function withBlogTimestamps(post) {
    const now = new Date().toISOString();
    return {
        ...post,
        publishedAt: post.publishedAt || now,
        createdAt: post.createdAt || now,
        updatedAt: post.updatedAt || now
    };
}

function readJson(filePath, fallback) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        return fallback;
    }
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function createPasswordHash(password, salt) {
    const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, passwordSalt, 64).toString('hex');
    return { hash, salt: passwordSalt };
}

function verifyPassword(password, user) {
    if (!user || !user.passwordSalt || !user.passwordHash) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(createPasswordHash(password, user.passwordSalt).hash, 'hex'),
        Buffer.from(user.passwordHash, 'hex')
    );
}

function parseCookies(cookieHeader) {
    if (!cookieHeader) {
        return {};
    }

    return cookieHeader.split(';').reduce((cookies, part) => {
        const [name, ...valueParts] = part.trim().split('=');
        cookies[name] = decodeURIComponent(valueParts.join('=') || '');
        return cookies;
    }, {});
}

function serializeCookie(name, value, options = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`];

    if (options.httpOnly !== false) parts.push('HttpOnly');
    if (options.path) parts.push(`Path=${options.path}`);
    if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
    if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);

    return parts.join('; ');
}

function createSession(userId) {
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, {
        userId,
        expiresAt: Date.now() + SESSION_TTL_MS
    });
    return token;
}

function destroySession(request) {
    const cookies = parseCookies(request.headers.cookie || '');
    if (cookies.kt_session) {
        sessions.delete(cookies.kt_session);
    }
}

function getCurrentUser(request) {
    const cookies = parseCookies(request.headers.cookie || '');
    const token = cookies.kt_session;

    if (!token || !sessions.has(token)) {
        return null;
    }

    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        sessions.delete(token);
        return null;
    }

    const users = readJson(USERS_FILE, []);
    return users.find((user) => user.id === session.userId) || null;
}

function isAdmin(user) {
    return Boolean(user && user.role === 'admin');
}

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
}

function normalizeProduct(product) {
    const categoryUrl = product.category === 'Men'
        ? './men/'
        : `./women/#${product.section || 'wears'}`;

    return {
        ...product,
        categoryUrl
    };
}

function buildExcerpt(value) {
    const plain = String(value || '').replace(/\s+/g, ' ').trim();
    if (plain.length <= 160) {
        return plain;
    }

    return `${plain.slice(0, 157).trimEnd()}...`;
}

function normalizeBlogPost(post) {
    const content = String(post.content || '').trim();
    const tags = Array.isArray(post.tags)
        ? post.tags.map((tag) => String(tag || '').trim()).filter(Boolean)
        : [];
    const wordCount = content ? content.split(/\s+/).length : 0;

    return {
        ...post,
        excerpt: String(post.excerpt || '').trim() || buildExcerpt(content),
        content,
        author: String(post.author || 'KT Fashion Team').trim(),
        category: String(post.category || 'KT Fashion Journal').trim(),
        quote: String(post.quote || '').trim(),
        tags,
        readTimeMinutes: Math.max(1, Math.ceil(wordCount / 180)),
        url: `./blog-details/?id=${encodeURIComponent(post.id)}`
    };
}

function sanitizeProductInput(input, existingProduct) {
    const name = String(input.name || '').trim();
    const image = String(input.image || '').trim();
    const category = String(input.category || '').trim();
    const section = String(input.section || '').trim();
    const badge = String(input.badge || '').trim();
    const description = String(input.description || '').trim();
    const specification = String(input.specification || '').trim();
    const care = String(input.care || '').trim();
    const price = Number(input.price);
    const featured = Boolean(input.featured);

    if (!name) {
        return { error: 'Product name is required.' };
    }

    if (!Number.isFinite(price) || price <= 0) {
        return { error: 'Price must be a valid amount.' };
    }

    if (!image) {
        return { error: 'Image path is required.' };
    }

    if (!['Women', 'Men'].includes(category)) {
        return { error: 'Category must be Women or Men.' };
    }

    const validSections = category === 'Women'
        ? ['wears', 'bags', 'jewelry']
        : ['traditional'];

    if (!validSections.includes(section)) {
        return { error: `Section must be one of: ${validSections.join(', ')}.` };
    }

    return {
        product: {
            id: existingProduct?.id || slugify(name) || `product-${Date.now()}`,
            name,
            price,
            image,
            category,
            section,
            badge: badge || 'Featured',
            description: description || 'No description provided yet.',
            specification: specification || 'Details will be updated by KT Fashion.',
            care: care || 'Handle according to fabric and finish.',
            featured,
            createdAt: existingProduct?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };
}

function sanitizeBlogPostInput(input, existingPost) {
    const title = String(input.title || '').trim();
    const excerpt = String(input.excerpt || '').trim();
    const content = String(input.content || '').trim();
    const image = String(input.image || '').trim();
    const category = String(input.category || '').trim();
    const author = String(input.author || '').trim();
    const quote = String(input.quote || '').trim();
    const rawTags = Array.isArray(input.tags)
        ? input.tags
        : String(input.tags || '').split(',');
    const tags = rawTags
        .map((tag) => String(tag || '').trim())
        .filter(Boolean)
        .slice(0, 8);
    const featured = Boolean(input.featured);
    const publishedAtInput = String(input.publishedAt || '').trim();
    const publishedAt = publishedAtInput
        ? new Date(publishedAtInput)
        : (existingPost?.publishedAt ? new Date(existingPost.publishedAt) : new Date());

    if (title.length < 8) {
        return { error: 'Blog title must be at least 8 characters.' };
    }

    if (excerpt.length < 24) {
        return { error: 'Blog excerpt must be at least 24 characters.' };
    }

    if (!image) {
        return { error: 'Blog image path is required.' };
    }

    if (!category) {
        return { error: 'Blog category is required.' };
    }

    if (content.length < 80) {
        return { error: 'Blog content must be at least 80 characters.' };
    }

    if (Number.isNaN(publishedAt.getTime())) {
        return { error: 'Publish date is invalid.' };
    }

    return {
        post: {
            id: existingPost?.id || slugify(title) || `post-${Date.now()}`,
            title,
            excerpt,
            content,
            image,
            category,
            author: author || 'KT Fashion Team',
            quote,
            tags: tags.length ? tags : ['KT Fashion'],
            featured,
            publishedAt: publishedAt.toISOString(),
            createdAt: existingPost?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };
}

function normalizeOrder(order) {
    return {
        ...order,
        status: String(order.status || 'Received').trim()
    };
}

function sanitizeContactContentInput(input) {
    const title = String(input.title || '').trim();
    const intro = String(input.intro || '').trim();
    const address = String(input.address || '').trim();
    const primaryPhone = String(input.primaryPhone || '').trim();
    const secondaryPhone = String(input.secondaryPhone || '').trim();
    const supportLabel = String(input.supportLabel || '').trim();
    const supportEmail = String(input.supportEmail || '').trim().toLowerCase();
    const mapEmbedUrl = String(input.mapEmbedUrl || '').trim();

    if (title.length < 4) {
        return { error: 'Contact title must be at least 4 characters.' };
    }

    if (intro.length < 20) {
        return { error: 'Contact intro must be at least 20 characters.' };
    }

    if (!address) {
        return { error: 'Contact address is required.' };
    }

    if (!primaryPhone) {
        return { error: 'Primary phone number is required.' };
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(primaryPhone)) {
        return { error: 'Enter a valid primary phone number.' };
    }

    if (secondaryPhone && !/^[0-9+\-\s()]{7,20}$/.test(secondaryPhone)) {
        return { error: 'Enter a valid secondary phone number.' };
    }

    if (!supportLabel) {
        return { error: 'Support label is required.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
        return { error: 'Enter a valid support email address.' };
    }

    if (!/^https:\/\/www\.google\.com\/maps\/embed\?/i.test(mapEmbedUrl)) {
        return { error: 'Use a valid Google Maps embed URL.' };
    }

    return {
        content: {
            title,
            intro,
            address,
            primaryPhone,
            secondaryPhone,
            supportLabel,
            supportEmail,
            mapEmbedUrl
        }
    };
}

function validateBillingDetails(details) {
    const billingDetails = details || {};
    const requiredFields = [
        ['firstName', 'First name is required.'],
        ['lastName', 'Last name is required.'],
        ['country', 'Country is required.'],
        ['addressLine1', 'Street address is required.'],
        ['city', 'Town/City is required.'],
        ['state', 'State is required.'],
        ['postalCode', 'Postcode/Zip is required.'],
        ['phone', 'Phone number is required.'],
        ['email', 'Email address is required.'],
        ['paymentMethod', 'Payment method is required.']
    ];

    for (const [field, message] of requiredFields) {
        if (!String(billingDetails[field] || '').trim()) {
            return { error: message };
        }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(billingDetails.email))) {
        return { error: 'Enter a valid email address.' };
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(String(billingDetails.phone))) {
        return { error: 'Enter a valid phone number.' };
    }

    return {
        billingDetails: {
            firstName: String(billingDetails.firstName).trim(),
            lastName: String(billingDetails.lastName).trim(),
            country: String(billingDetails.country).trim(),
            addressLine1: String(billingDetails.addressLine1).trim(),
            addressLine2: String(billingDetails.addressLine2 || '').trim(),
            city: String(billingDetails.city).trim(),
            state: String(billingDetails.state).trim(),
            postalCode: String(billingDetails.postalCode).trim(),
            phone: String(billingDetails.phone).trim(),
            email: String(billingDetails.email).trim().toLowerCase(),
            notes: String(billingDetails.notes || '').trim(),
            paymentMethod: String(billingDetails.paymentMethod).trim()
        }
    };
}

function sendJson(response, statusCode, payload, headers = {}) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        ...headers
    });
    response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
    response.writeHead(statusCode, {
        'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end(message);
}

function redirect(response, location) {
    response.writeHead(302, { Location: location });
    response.end();
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let total = 0;

        request.on('data', (chunk) => {
            total += chunk.length;
            if (total > 1_000_000) {
                reject(new Error('Request body too large.'));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });

        request.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(new Error('Invalid JSON body.'));
            }
        });

        request.on('error', reject);
    });
}

function serveFile(response, filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        sendText(response, 404, 'Not found');
        return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(response);
}

function servePage(response, filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        sendText(response, 404, 'Not found');
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (!/<base\s/i.test(content)) {
        content = content.replace('<head>', '<head>\n    <base href="/">');
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(content);
}

function serveStatic(request, response, pathname) {
    if (PAGE_ROUTES[pathname]) {
        servePage(response, path.join(ROOT_DIR, PAGE_ROUTES[pathname]));
        return;
    }

    const routeWithoutSlash = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const slashVersion = `${routeWithoutSlash}/`;
    if (routeWithoutSlash && PAGE_ROUTES[slashVersion]) {
        redirect(response, slashVersion);
        return;
    }

    const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
    const relativePath = safePath.replace(/^[/\\]+/, '');
    const requestedPath = path.join(ROOT_DIR, relativePath);

    if (!requestedPath.startsWith(ROOT_DIR)) {
        sendText(response, 403, 'Forbidden');
        return;
    }

    if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isDirectory()) {
        const indexPath = path.join(requestedPath, 'index.html');
        serveFile(response, indexPath);
        return;
    }

    serveFile(response, requestedPath);
}

async function handleApi(request, response, url) {
    const pathname = url.pathname;
    const method = request.method || 'GET';
    const currentUser = getCurrentUser(request);

    if (pathname === '/api/auth/session' && method === 'GET') {
        sendJson(response, 200, {
            authenticated: Boolean(currentUser),
            user: currentUser ? {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role
            } : null
        });
        return;
    }

    if (pathname === '/api/auth/signup' && method === 'POST') {
        const body = await readRequestBody(request);
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (name.length < 2) {
            sendJson(response, 400, { message: 'Full name must be at least 2 characters.' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            sendJson(response, 400, { message: 'Enter a valid email address.' });
            return;
        }

        if (password.length < 6) {
            sendJson(response, 400, { message: 'Password must be at least 6 characters.' });
            return;
        }

        const users = readJson(USERS_FILE, []);
        const existingUser = users.find((user) => user.email === email);
        if (existingUser) {
            sendJson(response, 409, { message: 'Email already registered.' });
            return;
        }

        const passwordData = createPasswordHash(password);
        const user = {
            id: `user_${Date.now()}`,
            name,
            email,
            role: 'customer',
            passwordHash: passwordData.hash,
            passwordSalt: passwordData.salt,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        writeJson(USERS_FILE, users);
        sendJson(response, 201, { message: 'Sign up successful. Please log in.' });
        return;
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await readRequestBody(request);
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const users = readJson(USERS_FILE, []);
        const user = users.find((candidate) => candidate.email === email);

        if (!verifyPassword(password, user)) {
            sendJson(response, 401, { message: 'Invalid email or password.' });
            return;
        }

        const token = createSession(user.id);
        sendJson(
            response,
            200,
            {
                message: 'Login successful.',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            },
            {
                'Set-Cookie': serializeCookie('kt_session', token, {
                    path: '/',
                    sameSite: 'Lax',
                    maxAge: SESSION_TTL_MS / 1000
                })
            }
        );
        return;
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
        destroySession(request);
        sendJson(
            response,
            200,
            { message: 'Logged out.' },
            {
                'Set-Cookie': serializeCookie('kt_session', '', {
                    path: '/',
                    sameSite: 'Lax',
                    maxAge: 0
                })
            }
        );
        return;
    }

    if (pathname === '/api/products' && method === 'GET') {
        let products = readJson(PRODUCTS_FILE, []).map(normalizeProduct);
        const category = url.searchParams.get('category');
        const section = url.searchParams.get('section');
        const featured = url.searchParams.get('featured');

        if (category) {
            products = products.filter((product) => product.category === category);
        }

        if (section) {
            products = products.filter((product) => product.section === section);
        }

        if (featured === 'true') {
            products = products.filter((product) => product.featured);
        }

        sendJson(response, 200, { products });
        return;
    }

    if (pathname.startsWith('/api/products/') && method === 'GET') {
        const productId = pathname.split('/').pop();
        const product = readJson(PRODUCTS_FILE, [])
            .map(normalizeProduct)
            .find((item) => item.id === productId);

        if (!product) {
            sendJson(response, 404, { message: 'Product not found.' });
            return;
        }

        sendJson(response, 200, { product });
        return;
    }

    if (pathname === '/api/blog-posts' && method === 'GET') {
        let posts = readJson(BLOG_POSTS_FILE, [])
            .map(normalizeBlogPost)
            .sort((left, right) => (
                new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
            ));
        const category = String(url.searchParams.get('category') || '').trim();
        const featured = url.searchParams.get('featured');

        if (category) {
            posts = posts.filter((post) => post.category === category);
        }

        if (featured === 'true') {
            posts = posts.filter((post) => post.featured);
        }

        sendJson(response, 200, { posts });
        return;
    }

    if (pathname.startsWith('/api/blog-posts/') && method === 'GET') {
        const postId = pathname.split('/').pop();
        const post = readJson(BLOG_POSTS_FILE, [])
            .map(normalizeBlogPost)
            .find((item) => item.id === postId);

        if (!post) {
            sendJson(response, 404, { message: 'Blog post not found.' });
            return;
        }

        sendJson(response, 200, { post });
        return;
    }

    if (pathname === '/api/contact-content' && method === 'GET') {
        const content = readJson(CONTACT_CONTENT_FILE, SEED_CONTACT_CONTENT);
        sendJson(response, 200, { content });
        return;
    }

    if (pathname === '/api/orders' && method === 'GET') {
        if (!currentUser) {
            sendJson(response, 401, { message: 'Please log in to view your orders.' });
            return;
        }

        const orders = readJson(ORDERS_FILE, [])
            .filter((order) => isAdmin(currentUser) || order.userId === currentUser.id)
            .map(normalizeOrder)
            .sort((left, right) => (
                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
            ));

        sendJson(response, 200, { orders });
        return;
    }

    if (pathname === '/api/orders' && method === 'POST') {
        if (!currentUser) {
            sendJson(response, 401, { message: 'Please log in to place an order.' });
            return;
        }

        const body = await readRequestBody(request);
        const items = Array.isArray(body.items) ? body.items : [];
        const billingValidation = validateBillingDetails(body.billingDetails);
        if (!items.length) {
            sendJson(response, 400, { message: 'Your cart is empty.' });
            return;
        }

        if (billingValidation.error) {
            sendJson(response, 400, { message: billingValidation.error });
            return;
        }

        const productMap = new Map(readJson(PRODUCTS_FILE, []).map((product) => [product.id, product]));
        const orderItems = [];

        for (const item of items) {
            const product = productMap.get(item.id);
            const quantity = Math.max(parseInt(item.quantity, 10) || 0, 0);

            if (!product || quantity <= 0) {
                continue;
            }

            orderItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity
            });
        }

        if (!orderItems.length) {
            sendJson(response, 400, { message: 'No valid products were found in your cart.' });
            return;
        }

        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const order = {
            id: `KT-${Date.now()}`,
            userId: currentUser.id,
            customerName: currentUser.name,
            customerEmail: currentUser.email,
            billingDetails: billingValidation.billingDetails,
            status: 'Received',
            createdAt: new Date().toISOString(),
            itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
            total,
            items: orderItems
        };

        const orders = readJson(ORDERS_FILE, []);
        orders.push(order);
        writeJson(ORDERS_FILE, orders);
        sendJson(response, 201, { message: 'Order placed successfully.', order });
        return;
    }

    if (pathname.startsWith('/api/orders/') && method === 'GET') {
        if (!currentUser) {
            sendJson(response, 401, { message: 'Please log in to view this order.' });
            return;
        }

        const orderId = pathname.split('/').pop();
        const order = readJson(ORDERS_FILE, []).find((entry) => entry.id === orderId);

        if (!order) {
            sendJson(response, 404, { message: 'Order not found.' });
            return;
        }

        if (!isAdmin(currentUser) && order.userId !== currentUser.id) {
            sendJson(response, 403, { message: 'You do not have access to this order.' });
            return;
        }

        sendJson(response, 200, { order: normalizeOrder(order) });
        return;
    }

    if (pathname === '/api/admin/products' && method === 'GET') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const products = readJson(PRODUCTS_FILE, []).map(normalizeProduct);
        sendJson(response, 200, { products });
        return;
    }

    if (pathname === '/api/admin/products' && method === 'POST') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const body = await readRequestBody(request);
        const validation = sanitizeProductInput(body);
        if (validation.error) {
            sendJson(response, 400, { message: validation.error });
            return;
        }

        const products = readJson(PRODUCTS_FILE, []);
        if (products.some((product) => product.id === validation.product.id)) {
            validation.product.id = `${validation.product.id}-${Date.now()}`;
        }

        products.push(validation.product);
        writeJson(PRODUCTS_FILE, products);
        sendJson(response, 201, {
            message: 'Product created successfully.',
            product: normalizeProduct(validation.product)
        });
        return;
    }

    if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const productId = pathname.split('/').pop();
        const body = await readRequestBody(request);
        const products = readJson(PRODUCTS_FILE, []);
        const existingIndex = products.findIndex((product) => product.id === productId);

        if (existingIndex === -1) {
            sendJson(response, 404, { message: 'Product not found.' });
            return;
        }

        const validation = sanitizeProductInput(body, products[existingIndex]);
        if (validation.error) {
            sendJson(response, 400, { message: validation.error });
            return;
        }

        products[existingIndex] = validation.product;
        writeJson(PRODUCTS_FILE, products);
        sendJson(response, 200, {
            message: 'Product updated successfully.',
            product: normalizeProduct(validation.product)
        });
        return;
    }

    if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const productId = pathname.split('/').pop();
        const products = readJson(PRODUCTS_FILE, []);
        const nextProducts = products.filter((product) => product.id !== productId);

        if (nextProducts.length === products.length) {
            sendJson(response, 404, { message: 'Product not found.' });
            return;
        }

        writeJson(PRODUCTS_FILE, nextProducts);
        sendJson(response, 200, { message: 'Product deleted successfully.' });
        return;
    }

    if (pathname === '/api/admin/orders' && method === 'GET') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const orders = readJson(ORDERS_FILE, [])
            .map(normalizeOrder)
            .sort((left, right) => (
                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
            ));
        sendJson(response, 200, { orders });
        return;
    }

    if (pathname === '/api/admin/blog-posts' && method === 'GET') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const posts = readJson(BLOG_POSTS_FILE, [])
            .map(normalizeBlogPost)
            .sort((left, right) => (
                new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
            ));
        sendJson(response, 200, { posts });
        return;
    }

    if (pathname === '/api/admin/blog-posts' && method === 'POST') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const body = await readRequestBody(request);
        const validation = sanitizeBlogPostInput(body);
        if (validation.error) {
            sendJson(response, 400, { message: validation.error });
            return;
        }

        const posts = readJson(BLOG_POSTS_FILE, []);
        if (posts.some((post) => post.id === validation.post.id)) {
            validation.post.id = `${validation.post.id}-${Date.now()}`;
        }

        posts.push(validation.post);
        writeJson(BLOG_POSTS_FILE, posts);
        sendJson(response, 201, {
            message: 'Blog post created successfully.',
            post: normalizeBlogPost(validation.post)
        });
        return;
    }

    if (pathname.startsWith('/api/admin/blog-posts/') && method === 'PUT') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const postId = pathname.split('/').pop();
        const body = await readRequestBody(request);
        const posts = readJson(BLOG_POSTS_FILE, []);
        const existingIndex = posts.findIndex((post) => post.id === postId);

        if (existingIndex === -1) {
            sendJson(response, 404, { message: 'Blog post not found.' });
            return;
        }

        const validation = sanitizeBlogPostInput(body, posts[existingIndex]);
        if (validation.error) {
            sendJson(response, 400, { message: validation.error });
            return;
        }

        posts[existingIndex] = validation.post;
        writeJson(BLOG_POSTS_FILE, posts);
        sendJson(response, 200, {
            message: 'Blog post updated successfully.',
            post: normalizeBlogPost(validation.post)
        });
        return;
    }

    if (pathname.startsWith('/api/admin/blog-posts/') && method === 'DELETE') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const postId = pathname.split('/').pop();
        const posts = readJson(BLOG_POSTS_FILE, []);
        const nextPosts = posts.filter((post) => post.id !== postId);

        if (nextPosts.length === posts.length) {
            sendJson(response, 404, { message: 'Blog post not found.' });
            return;
        }

        writeJson(BLOG_POSTS_FILE, nextPosts);
        sendJson(response, 200, { message: 'Blog post deleted successfully.' });
        return;
    }

    if (pathname === '/api/admin/contact-content' && method === 'GET') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const content = readJson(CONTACT_CONTENT_FILE, SEED_CONTACT_CONTENT);
        sendJson(response, 200, { content });
        return;
    }

    if (pathname === '/api/admin/contact-content' && method === 'PUT') {
        if (!isAdmin(currentUser)) {
            sendJson(response, 403, { message: 'Admin access is required.' });
            return;
        }

        const body = await readRequestBody(request);
        const validation = sanitizeContactContentInput(body);
        if (validation.error) {
            sendJson(response, 400, { message: validation.error });
            return;
        }

        writeJson(CONTACT_CONTENT_FILE, validation.content);
        sendJson(response, 200, {
            message: 'Contact page details updated successfully.',
            content: validation.content
        });
        return;
    }

    sendJson(response, 404, { message: 'API route not found.' });
}

async function requestHandler(request, response) {
    try {
        const url = new URL(request.url, `http://${request.headers.host}`);

        if (url.pathname.startsWith('/api/')) {
            await handleApi(request, response, url);
            return;
        }

        serveStatic(request, response, url.pathname);
    } catch (error) {
        sendJson(response, 500, { message: error.message || 'Server error.' });
    }
}

ensureDataFiles();

http.createServer(requestHandler).listen(PORT, () => {
    console.log(`KT Fashion server running at http://localhost:${PORT}`);
    console.log(`Owner login: ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
});
