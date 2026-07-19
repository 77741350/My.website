// ========== Pm Store - Auth & API Frontend ========== //

const API = '';
const TOKEN_KEY = 'pm_token';
const USER_KEY = 'pm_user';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
function authHeaders() {
    const t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ---------- Auth UI ----------
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authError = document.getElementById('authError');
const authSwitch = document.getElementById('authSwitch');
const authSwitchLink = document.getElementById('authSwitchLink');
const nameField = document.getElementById('nameField');
const phoneField = document.getElementById('phoneField');
const authSubmit = document.getElementById('authSubmit');
const loginNavBtn = document.getElementById('loginNavBtn');
const userMenu = document.getElementById('userMenu');
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const userName = document.getElementById('userName');

let isRegister = false;

function openAuth(register = false) {
    isRegister = register;
    authError.textContent = '';
    authForm.reset();
    if (register) {
        authTitle.textContent = 'إنشاء حساب';
        authSubmit.textContent = 'تسجيل';
        authSwitch.innerHTML = 'لديك حساب؟ <a href="#" id="authSwitchLink">تسجيل الدخول</a>';
        nameField.style.display = 'block';
        phoneField.style.display = 'block';
    } else {
        authTitle.textContent = 'تسجيل الدخول';
        authSubmit.textContent = 'دخول';
        authSwitch.innerHTML = 'ليس لديك حساب؟ <a href="#" id="authSwitchLink">إنشاء حساب</a>';
        nameField.style.display = 'none';
        phoneField.style.display = 'none';
    }
    authModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAuth() {
    authModal.classList.remove('show');
    document.body.style.overflow = '';
}

loginNavBtn.addEventListener('click', () => openAuth(false));

document.getElementById('authModalClose').addEventListener('click', closeAuth);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });

authSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.id === 'authSwitchLink') openAuth(!isRegister);
});

userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
});
document.addEventListener('click', () => userDropdown.classList.remove('show'));

document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    updateAuthUI();
    userDropdown.classList.remove('show');
});

document.getElementById('myOrdersLink').addEventListener('click', (e) => {
    e.preventDefault();
    userDropdown.classList.remove('show');
    loadMyOrders();
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const payload = { email, password };
    if (isRegister) {
        payload.name = document.getElementById('authName').value;
        payload.phone = document.getElementById('authPhone').value;
    }
    try {
        const res = await fetch(API + (isRegister ? '/api/auth/register' : '/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            authError.textContent = data.error || 'حدث خطأ';
            return;
        }
        if (isRegister) {
            setAuth(data.token, { email, name: payload.name, role: 'customer' });
        } else {
            setAuth(data.token, data.user);
        }
        updateAuthUI();
        closeAuth();
    } catch (err) {
        authError.textContent = 'تعذر الاتصال بالخادم';
    }
});

function updateAuthUI() {
    const user = getUser();
    if (user) {
        loginNavBtn.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = user.name || user.email;
    } else {
        loginNavBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

// ---------- Products (load from API) ----------
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    try {
        const res = await fetch(API + '/api/products');
        const products = await res.json();
        if (!Array.isArray(products) || products.length === 0) return;
        grid.innerHTML = products.map(p => `
            <div class="product-card animate-on-scroll" data-category="${p.category}">
                ${p.badge ? `<div class="product-badge ${p.badge}">${p.badge === 'sale' ? 'خصم' : 'جديد'}</div>` : ''}
                <div class="product-wishlist"><i class="far fa-heart"></i></div>
                <div class="product-image"><i class="${p.icon || 'fas fa-box'}"></i></div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-rating">
                        ${renderStars(p.rating || 5)} <span>(${p.rating_count || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-new">$${p.price}</span>
                        ${p.old_price ? `<span class="price-old">$${p.old_price}</span>` : ''}
                    </div>
                    <button class="btn btn-add-cart add-to-cart" data-name="${p.name}" data-price="${p.price}">
                        <i class="fas fa-cart-plus"></i> أضف للسلة
                    </button>
                </div>
            </div>
        `).join('');
        // re-bind add-to-cart and wishlist
        bindCartButtons();
        bindWishlist();
        observeNewCards();
    } catch (err) {
        console.error('Failed to load products', err);
    }
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let s = '';
    for (let i = 0; i < full; i++) s += '<i class="fas fa-star"></i>';
    if (half) s += '<i class="fas fa-star-half-alt"></i>';
    for (let i = full + (half ? 1 : 0); i < 5; i++) s += '<i class="far fa-star"></i>';
    return s;
}

function observeNewCards() {
    document.querySelectorAll('.product-card.animate-on-scroll:not(.animated)').forEach(el => {
        el.classList.add('animated');
    });
}

// ---------- Cart (uses global cart from main.js) ----------
function bindCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));
            if (typeof cart !== 'undefined') {
                cart.push({ name, price });
                if (typeof updateCart === 'function') updateCart();
                btn.style.transform = 'scale(0.95)';
                btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
                btn.style.background = '#00cec9'; btn.style.color = 'white';
                setTimeout(() => {
                    btn.style.transform = ''; btn.innerHTML = '<i class="fas fa-cart-plus"></i> أضف للسلة';
                    btn.style.background = ''; btn.style.color = '';
                }, 1500);
            }
        });
    });
}

function bindWishlist() {
    document.querySelectorAll('.product-wishlist').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (btn.classList.contains('active')) { icon.classList.remove('far'); icon.classList.add('fas'); }
            else { icon.classList.remove('fas'); icon.classList.add('far'); }
        });
    });
}

// ---------- Checkout ----------
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
        if (typeof cart === 'undefined' || cart.length === 0) { alert('سلة التسوق فارغة'); return; }
        if (!getToken()) {
            alert('يرجى تسجيل الدخول أولاً');
            openAuth(false);
            return;
        }
        const total = cart.reduce((s, i) => s + i.price, 0);
        const items = cart.map(i => ({ name: i.name, price: i.price }));
        try {
            const res = await fetch(API + '/api/orders', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ items, total })
            });
            const data = await res.json();
            if (res.ok) {
                cart = [];
                if (typeof updateCart === 'function') updateCart();
                if (typeof closeCart === 'function') closeCart();
                alert('تم إنشاء طلبك بنجاح! سنتواصل معك قريباً.');
            } else {
                alert(data.error || 'فشل إنشاء الطلب');
            }
        } catch (err) {
            alert('تعذر الاتصال بالخادم');
        }
    });
}

// ---------- My Orders ----------
async function loadMyOrders() {
    const list = document.getElementById('ordersList');
    const modal = document.getElementById('ordersModal');
    try {
        const res = await fetch(API + '/api/orders/user', { headers: authHeaders() });
        const orders = await res.json();
        if (Array.isArray(orders) && orders.length > 0) {
            list.innerHTML = orders.map(o => {
                const items = JSON.parse(o.items || '[]');
                const itemsText = items.map(i => `${i.name} ($${i.price})`).join('، ');
                return `
                    <div class="order-item">
                        <div class="order-item-header">
                            <span class="order-id">طلب #${o.id}</span>
                            <span class="order-status ${o.status}">${statusLabel(o.status)}</span>
                        </div>
                        <div class="order-items">${itemsText}</div>
                        <div class="order-total">الإجمالي: $${o.total}</div>
                    </div>`;
            }).join('');
        } else {
            list.innerHTML = '<p class="text-muted">لا توجد طلبات بعد.</p>';
        }
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    } catch (err) {
        alert('تعذر تحميل الطلبات');
    }
}

function statusLabel(s) {
    const map = { pending: 'قيد الانتظار', confirmed: 'مؤكد', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي' };
    return map[s] || s;
}

document.getElementById('ordersModalClose').addEventListener('click', () => {
    document.getElementById('ordersModal').classList.remove('show');
    document.body.style.overflow = '';
});

// ---------- Init ----------
updateAuthUI();
loadProducts();
