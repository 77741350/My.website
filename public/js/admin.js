// ========== Admin Panel JS ========== //
const API = '';
const TOKEN_KEY = 'pm_admin_token';
const USER_KEY = 'pm_admin_user';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setAuth(token, user) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
function authHeaders() { return { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' }; }

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');

// ---------- Login ----------
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const err = document.getElementById('adminLoginError');
    err.textContent = '';
    try {
        const res = await fetch(API + '/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) { err.textContent = data.error || 'فشل الدخول'; return; }
        if (data.user.role !== 'admin') { err.textContent = 'هذا الحساب ليس للإدارة'; return; }
        setAuth(data.token, data.user);
        showDashboard();
    } catch (e) { err.textContent = 'تعذر الاتصال بالخادم'; }
});

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'grid';
    loadProducts();
}

// ---------- Tabs ----------
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const tab = item.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(tab + 'Tab').classList.add('active');
        document.getElementById('pageTitle').textContent = tab === 'products' ? 'إدارة المنتجات' : 'إدارة الطلبات';
        document.getElementById('addProductBtn').style.display = tab === 'products' ? 'inline-flex' : 'none';
        if (tab === 'orders') loadOrders();
    });
});

document.getElementById('adminLogout').addEventListener('click', () => {
    clearAuth();
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
});

// ---------- Products ----------
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    try {
        const res = await fetch(API + '/api/products');
        const products = await res.json();
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><span class="cell-icon"><i class="${p.icon || 'fas fa-box'}"></i></span></td>
                <td>${p.name}</td>
                <td>${categoryLabel(p.category)}</td>
                <td>$${p.price}${p.old_price ? ` <span style="color:var(--gray);text-decoration:line-through;font-size:0.8rem;">$${p.old_price}</span>` : ''}</td>
                <td>${renderStars(p.rating)}</td>
                <td>
                    <div class="cell-actions">
                        <button class="btn btn-sm btn-outline" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">فشل التحميل</td></tr>'; }
}

function categoryLabel(c) {
    return { phones: 'هواتف', laptops: 'لابتوبات', audio: 'سماعات', beauty: 'تجميل', accessories: 'ملحقات', smart: 'ساعات ذكية' }[c] || c;
}

function renderStars(rating) {
    const r = rating || 0;
    const full = Math.floor(r);
    let s = '';
    for (let i = 0; i < full; i++) s += '<i class="fas fa-star" style="color:#ffc107;font-size:0.75rem;"></i>';
    for (let i = full; i < 5; i++) s += '<i class="far fa-star" style="color:#ffc107;font-size:0.75rem;"></i>';
    return s;
}

// ---------- Product Modal ----------
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');

document.getElementById('addProductBtn').addEventListener('click', () => {
    productForm.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = 'إضافة منتج';
    document.getElementById('productFormError').textContent = '';
    productModal.classList.add('show');
});

document.getElementById('productModalClose').addEventListener('click', () => productModal.classList.remove('show'));
productModal.addEventListener('click', (e) => { if (e.target === productModal) productModal.classList.remove('show'); });

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const payload = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        icon: document.getElementById('pIcon').value || 'fas fa-box',
        price: parseFloat(document.getElementById('pPrice').value),
        old_price: parseFloat(document.getElementById('pOldPrice').value) || null,
        badge: document.getElementById('pBadge').value || null,
        rating: parseFloat(document.getElementById('pRating').value) || 5,
        description: document.getElementById('pDescription').value
    };
    const err = document.getElementById('productFormError');
    err.textContent = '';
    try {
        const url = id ? API + '/api/products/' + id : API + '/api/products';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) { err.textContent = data.error || 'فشل الحفظ'; return; }
        productModal.classList.remove('show');
        loadProducts();
    } catch (e) { err.textContent = 'تعذر الاتصال بالخادم'; }
});

window.editProduct = async function (id) {
    try {
        const res = await fetch(API + '/api/products');
        const products = await res.json();
        const p = products.find(x => x.id === id);
        if (!p) return;
        document.getElementById('productId').value = p.id;
        document.getElementById('pName').value = p.name;
        document.getElementById('pCategory').value = p.category;
        document.getElementById('pIcon').value = p.icon || 'fas fa-box';
        document.getElementById('pPrice').value = p.price;
        document.getElementById('pOldPrice').value = p.old_price || '';
        document.getElementById('pBadge').value = p.badge || '';
        document.getElementById('pRating').value = p.rating || 5;
        document.getElementById('pDescription').value = p.description || '';
        document.getElementById('productModalTitle').textContent = 'تعديل منتج';
        document.getElementById('productFormError').textContent = '';
        productModal.classList.add('show');
    } catch (e) { alert('فشل التحميل'); }
};

window.deleteProduct = async function (id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
        const res = await fetch(API + '/api/products/' + id, { method: 'DELETE', headers: authHeaders() });
        if (res.ok) loadProducts();
        else alert('فشل الحذف');
    } catch (e) { alert('تعذر الاتصال بالخادم'); }
};

// ---------- Orders ----------
async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    try {
        const res = await fetch(API + '/api/orders', { headers: authHeaders() });
        const orders = await res.json();
        if (!Array.isArray(orders) || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا توجد طلبات</td></tr>';
            return;
        }
        tbody.innerHTML = orders.map(o => {
            const items = JSON.parse(o.items || '[]');
            const itemsText = items.map(i => `${i.name} ($${i.price})`).join('، ');
            const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            const options = statuses.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${statusLabel(s)}</option>`).join('');
            return `
                <tr>
                    <td>${o.id}</td>
                    <td>${o.customer_name}</td>
                    <td dir="ltr">${o.phone}</td>
                    <td style="max-width:200px;">${itemsText}</td>
                    <td>$${o.total}</td>
                    <td><span class="status-badge ${o.status}">${statusLabel(o.status)}</span></td>
                    <td>${new Date(o.created_at).toLocaleDateString('ar')}</td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">${options}</select>
                    </td>
                </tr>`;
        }).join('');
    } catch (e) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">فشل التحميل</td></tr>'; }
}

function statusLabel(s) {
    return { pending: 'قيد الانتظار', confirmed: 'مؤكد', shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي' }[s] || s;
}

window.updateOrderStatus = async function (id, status) {
    try {
        const res = await fetch(API + '/api/orders/' + id, {
            method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status })
        });
        if (!res.ok) { alert('فشل التحديث'); loadOrders(); }
    } catch (e) { alert('تعذر الاتصال بالخادم'); }
};

// ---------- Init ----------
if (getToken()) {
    fetch(API + '/api/auth/me', { headers: authHeaders() })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => { if (d.user.role === 'admin') showDashboard(); else clearAuth(); })
        .catch(() => clearAuth());
}
