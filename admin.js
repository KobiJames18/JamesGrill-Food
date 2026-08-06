/* ============================================
   THEME (standalone copy — admin.html doesn't load script.js)
   ============================================ */
function initAdminTheme(){
    const saved = localStorage.getItem('jamesgrill_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateAdminThemeIcon(saved);
    document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('jamesgrill_theme', next);
        updateAdminThemeIcon(next);
    });
}
function updateAdminThemeIcon(theme){
    document.querySelector('[data-theme-toggle] i').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

function money(n){ return 'Le ' + Number(n).toLocaleString(); }

/* ============================================
   AUTH
   ============================================ */
const loginSection = document.getElementById('adminLogin');
const dashboardSection = document.getElementById('adminDashboard');
const logoutBtn = document.getElementById('logoutBtn');

async function checkSession(){
    if (!window.supabaseClient){
        showLoginError('Supabase is not configured yet. Fill in supabase-client.js with your project URL and anon key.');
        return;
    }
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session){
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin(){
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    logoutBtn.style.display = 'none';
}
function showDashboard(){
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    logoutBtn.style.display = 'inline-flex';
    loadOrders();
    loadMenuAdmin();
}
function showLoginError(msg){
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.classList.add('show');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.classList.remove('show');

    if (!window.supabaseClient){
        showLoginError('Supabase is not configured yet. Fill in supabase-client.js with your project URL and anon key.');
        return;
    }

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error){
        showLoginError(error.message);
        return;
    }
    showDashboard();
});

logoutBtn.addEventListener('click', async () => {
    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
    showLogin();
});

/* ============================================
   TABS
   ============================================ */
document.querySelectorAll('.admin-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.toggle('active', b === btn));
        const tab = btn.getAttribute('data-tab');
        document.getElementById('ordersPanel').classList.toggle('active', tab === 'orders');
        document.getElementById('menuPanel').classList.toggle('active', tab === 'menu');
    });
});

/* ============================================
   ORDERS
   ============================================ */
const STATUS_OPTIONS = ['Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

async function loadOrders(){
    const list = document.getElementById('ordersAdminList');
    list.innerHTML = '<div class="empty-state small"><p>Loading orders…</p></div>';

    const { data, error } = await window.supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error){
        list.innerHTML = `<div class="empty-state small"><h3>Couldn't load orders</h3><p>${error.message}</p></div>`;
        return;
    }

    if (!data || data.length === 0){
        list.innerHTML = `
        <div class="empty-state small">
            <i class="fa-solid fa-receipt"></i>
            <h3>No orders yet</h3>
            <p>Orders placed on the site will show up here.</p>
        </div>`;
        return;
    }

    list.innerHTML = data.map(orderCardHTML).join('');

    list.querySelectorAll('[data-status-order]').forEach(select => {
        select.addEventListener('change', () => updateOrderStatus(select.getAttribute('data-status-order'), select.value));
    });
}

function orderCardHTML(o){
    const items = (o.items || []).map(it => `<div class="order-line"><span>${it.name} x${it.qty}</span><span>${money(it.price * it.qty)}</span></div>`).join('');
    const statusOptions = STATUS_OPTIONS.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('');
    return `
    <div class="order-admin-card">
        <div class="order-admin-head">
            <div class="meta">
                <div><strong>${o.id}</strong> — ${new Date(o.created_at).toLocaleString()}</div>
                <div><strong>${o.customer_name || '—'}</strong> · ${o.customer_phone || '—'}</div>
                <div>${o.address || '—'}</div>
                <div>${o.payment_method || '—'}</div>
            </div>
            <select class="status-select" data-status-order="${o.id}">${statusOptions}</select>
        </div>
        ${items}
        <div class="order-line" style="margin-top:1rem; padding-top:1rem; border-top:.1rem dashed var(--border);"><span>Delivery</span><span>${money(o.delivery)}</span></div>
        <div class="order-line"><strong>Total</strong><strong>${money(o.total)}</strong></div>
    </div>`;
}

async function updateOrderStatus(id, status){
    const { error } = await window.supabaseClient.from('orders').update({ status }).eq('id', id);
    if (error) alert('Could not update order status: ' + error.message);
}

/* ============================================
   MENU MANAGEMENT
   ============================================ */
const modalBackdrop = document.getElementById('itemModalBackdrop');
const itemForm = document.getElementById('itemForm');
let currentMenuRows = [];

async function loadMenuAdmin(){
    const tbody = document.getElementById('menuAdminBody');
    tbody.innerHTML = `<tr><td colspan="5">Loading menu…</td></tr>`;

    const { data, error } = await window.supabaseClient.from('menu_items').select('*').order('category');
    if (error){
        tbody.innerHTML = `<tr><td colspan="5">Couldn't load menu: ${error.message}</td></tr>`;
        return;
    }

    currentMenuRows = data || [];
    if (currentMenuRows.length === 0){
        tbody.innerHTML = `<tr><td colspan="5">No menu items yet. Click "Add Item" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = currentMenuRows.map(row => `
        <tr>
            <td>${row.name}</td>
            <td>${row.category}</td>
            <td>${money(row.price_min)} – ${money(row.price_max)}</td>
            <td>${row.badge || '—'}</td>
            <td>
                <div class="row-actions">
                    <button data-edit="${row.id}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button data-delete="${row.id}" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openItemModal(btn.getAttribute('data-edit'))));
    tbody.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteItem(btn.getAttribute('data-delete'))));
}

document.getElementById('addItemBtn').addEventListener('click', () => openItemModal(null));
document.getElementById('cancelItemBtn').addEventListener('click', closeItemModal);

function openItemModal(id){
    document.getElementById('itemFormError').classList.remove('show');
    itemForm.reset();

    if (id){
        const row = currentMenuRows.find(r => r.id === id);
        document.getElementById('itemModalTitle').textContent = 'Edit Menu Item';
        document.getElementById('itemId').value = row.id;
        document.getElementById('itemName').value = row.name;
        document.getElementById('itemCategory').value = row.category;
        document.getElementById('itemBadge').value = row.badge || '';
        document.getElementById('itemDesc').value = row.description || '';
        document.getElementById('itemPriceMin').value = row.price_min;
        document.getElementById('itemPriceMax').value = row.price_max;
        document.getElementById('itemImage').value = row.image || '';
        document.getElementById('itemIcon').value = row.icon || '';
        document.getElementById('itemRating').value = row.rating || 4;
    } else {
        document.getElementById('itemModalTitle').textContent = 'Add Menu Item';
        document.getElementById('itemId').value = '';
    }

    modalBackdrop.classList.add('show');
}
function closeItemModal(){
    modalBackdrop.classList.remove('show');
}

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('itemFormError');
    errEl.classList.remove('show');

    const existingId = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value.trim();
    const id = existingId || slugify(name);

    const record = {
        id,
        name,
        category: document.getElementById('itemCategory').value,
        description: document.getElementById('itemDesc').value.trim(),
        price_min: Number(document.getElementById('itemPriceMin').value),
        price_max: Number(document.getElementById('itemPriceMax').value),
        image: document.getElementById('itemImage').value.trim() || null,
        icon: document.getElementById('itemIcon').value.trim() || null,
        rating: Number(document.getElementById('itemRating').value),
        badge: document.getElementById('itemBadge').value.trim() || null
    };

    const { error } = await window.supabaseClient.from('menu_items').upsert(record);
    if (error){
        errEl.textContent = error.message;
        errEl.classList.add('show');
        return;
    }

    closeItemModal();
    loadMenuAdmin();
});

async function deleteItem(id){
    if (!confirm('Delete this menu item? This cannot be undone.')) return;
    const { error } = await window.supabaseClient.from('menu_items').delete().eq('id', id);
    if (error){
        alert('Could not delete item: ' + error.message);
        return;
    }
    loadMenuAdmin();
}

function slugify(text){
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initAdminTheme();
    checkSession();
});