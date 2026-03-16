// auth.js - Handles login, signup, session UI, and admin links

$(document).ready(function() {
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

    function normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setFormMessage(selector, message, type) {
        const color = type === 'success' ? 'green' : 'red';
        const element = $(selector);
        if (element.length) {
            element.text(message).css('color', color);
        }
        window.showToast(message, type === 'success' ? 'success' : 'error');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizePath(path) {
        if (!path) return '/';

        let pathname = path;
        try {
            pathname = new URL(path, window.location.origin).pathname;
        } catch (error) {
            pathname = path;
        }

        pathname = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');

        if (!pathname.startsWith('/')) {
            pathname = `/${pathname}`;
        }

        if (pathname !== '/' && !pathname.endsWith('/')) {
            pathname += '/';
        }

        return pathname;
    }

    function getActiveNavPath() {
        const pathname = normalizePath(window.location.pathname);

        if (pathname === '/' || pathname === '/main/') {
            return '/';
        }

        if (pathname.startsWith('/women/')) {
            return '/women/';
        }

        if (pathname.startsWith('/men/')) {
            return '/men/';
        }

        if (pathname.startsWith('/blog/')) {
            return '/blog/';
        }

        if (pathname.startsWith('/contact/')) {
            return '/contact/';
        }

        if (pathname.startsWith('/admin/')) {
            return '/admin/';
        }

        if (
            pathname.startsWith('/shop/') ||
            pathname.startsWith('/shop-cart/') ||
            pathname.startsWith('/checkout/') ||
            pathname.startsWith('/product-details/') ||
            pathname.startsWith('/thank-you/')
        ) {
            return '/shop/';
        }

        return '';
    }

    function syncActiveNavbar() {
        const activePath = getActiveNavPath();
        const desktopItems = $('.header__menu > ul > li');
        const mobileItems = $('#mobile-menu-wrap .slicknav_nav li');

        desktopItems.removeClass('active');
        desktopItems.each(function() {
            const link = $(this).children('a').get(0);
            if (!link) return;

            const linkPath = normalizePath(link.getAttribute('href') || link.href);
            $(this).toggleClass('active', activePath && linkPath === activePath);
        });

        mobileItems.removeClass('active');
        mobileItems.each(function() {
            const link = $(this).children('a').get(0);
            if (!link) return;

            const linkPath = normalizePath(link.getAttribute('href') || link.href);
            $(this).toggleClass('active', activePath && linkPath === activePath);
        });
    }

    function syncAdminNavbar(user) {
        const isAdmin = Boolean(user && user.role === 'admin');
        const desktopMenu = $('.header__menu > ul');
        const mobileMenu = $('#mobile-menu-wrap .slicknav_nav');
        const isAdminPage = window.location.pathname === '/admin/' || window.location.pathname === '/admin';

        const desktopAdminItems = desktopMenu
            .children('li.nav-admin-link, li:has(> a[href="./admin/"]), li:has(> a[href="/admin/"])');
        const mobileAdminItems = mobileMenu
            .find('li.nav-admin-link, li:has(> a[href="./admin/"]), li:has(> a[href="/admin/"])');

        if (!isAdmin) {
            desktopAdminItems.remove();
            mobileAdminItems.remove();
            return;
        }

        if (desktopMenu.length && !desktopAdminItems.length) {
            desktopMenu.append(`
                <li class="nav-admin-link${isAdminPage ? ' active' : ''}">
                    <a href="./admin/">Admin</a>
                </li>
            `);
        } else if (desktopAdminItems.length) {
            desktopAdminItems.toggleClass('active', isAdminPage);
        }

        if (mobileMenu.length && !mobileAdminItems.length) {
            mobileMenu.append(`
                <li class="nav-admin-link${isAdminPage ? ' slicknav_open' : ''}">
                    <a href="./admin/">Admin</a>
                </li>
            `);
        }

        syncActiveNavbar();
    }

    function updateAuthUi(user) {
        syncAdminNavbar(user);
        if (!user) return;

        const safeName = escapeHtml(user.name || 'User');
        const adminLink = user.role === 'admin'
            ? '<a href="./admin/" class="auth-admin-link">Admin</a>'
            : '';

        const authMarkup = `
            <span class="auth-user-greeting">Hi, ${safeName}</span>
            ${adminLink}
            <a href="#" id="logout">Logout</a>
        `;
        const mobileAuthMarkup = `
            <span class="auth-user-greeting">Hi, ${safeName}</span>
            ${adminLink}
            <a href="#" id="logoutMobile">Logout</a>
        `;

        $('.header__right__auth').addClass('header__right__auth--logged-in').html(authMarkup);
        $('.offcanvas__auth').addClass('offcanvas__auth--logged-in').html(mobileAuthMarkup);
    }

    async function loadSession() {
        try {
            const data = await requestJson('/api/auth/session', { method: 'GET' });
            if (data.authenticated && data.user) {
                window.currentSessionUser = data.user;
                updateAuthUi(data.user);
            } else {
                window.currentSessionUser = null;
                syncAdminNavbar(null);
            }
        } catch (error) {
            window.currentSessionUser = null;
            syncAdminNavbar(null);
        }
    }

    ensureToastSupport();
    syncActiveNavbar();

    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();

        const email = normalizeEmail($('#loginEmail').val());
        const password = $('#loginPassword').val();

        if (!email) {
            setFormMessage('#loginMessage', 'Email is required.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            setFormMessage('#loginMessage', 'Enter a valid email address.', 'error');
            return;
        }

        if (!password) {
            setFormMessage('#loginMessage', 'Password is required.', 'error');
            return;
        }

        try {
            await requestJson('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            setFormMessage('#loginMessage', 'Login successful!', 'success');
            setTimeout(() => {
                window.location.href = './';
            }, 900);
        } catch (error) {
            setFormMessage('#loginMessage', error.message, 'error');
        }
    });

    $('#signupForm').on('submit', async function(e) {
        e.preventDefault();

        const name = String($('#signupName').val() || '').trim();
        const email = normalizeEmail($('#signupEmail').val());
        const password = $('#signupPassword').val();
        const confirmPassword = $('#signupConfirmPassword').val();

        if (name.length < 2) {
            setFormMessage('#signupMessage', 'Full name must be at least 2 characters.', 'error');
            return;
        }

        if (!email) {
            setFormMessage('#signupMessage', 'Email is required.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            setFormMessage('#signupMessage', 'Enter a valid email address.', 'error');
            return;
        }

        if (password.length < 6) {
            setFormMessage('#signupMessage', 'Password must be at least 6 characters.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            setFormMessage('#signupMessage', 'Passwords do not match.', 'error');
            return;
        }

        try {
            await requestJson('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });
            setFormMessage('#signupMessage', 'Sign up successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = './login/';
            }, 900);
        } catch (error) {
            setFormMessage('#signupMessage', error.message, 'error');
        }
    });

    $(document).on('click', '#logout, #logoutMobile', async function(e) {
        e.preventDefault();
        try {
            await requestJson('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            // Reload regardless so the header resets on session expiry.
        }
        window.location.href = './';
    });

    loadSession();
});
