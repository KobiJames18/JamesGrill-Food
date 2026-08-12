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

// escapes customer-supplied text (order details, review text) before it's
// inserted via innerHTML in the admin dashboard — without this, a
// malicious order or review could run a script inside the admin's
// logged-in session the moment this data is displayed (stored XSS)
function escapeHtml(str){
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ============================================
   TURNSTILE (CAPTCHA)
   Real, server-enforced bot/brute-force protection — unlike the client-side
   throttle below, this can't be bypassed by calling the Supabase API
   directly, because Supabase itself verifies the token with Cloudflare
   before allowing the login to proceed.
   ============================================ */
let turnstileToken = null;
window.onTurnstileVerified = function(token){ turnstileToken = token; };
function resetTurnstile(){
    if (window.turnstile) window.turnstile.reset();
    turnstileToken = null;
}

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
    if (isLockedOut()) updateLoginUIForLockout();
}
function showDashboard(){
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    logoutBtn.style.display = 'inline-flex';
    loadOrders();
    loadMenuAdmin();
    loadReviewsAdmin();
}
function showLoginError(msg){
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.classList.add('show');
}

/* ============================================
   LOGIN THROTTLING (client-side deterrent)
   Slows down repeated failed attempts from this browser. This is a UX
   deterrent, not real rate limiting — anyone calling the Supabase API
   directly (bypassing this page entirely) isn't affected by it. Supabase
   itself applies baseline rate limits to the auth endpoint regardless.
   For real brute-force protection, enable CAPTCHA on Auth in the
   Supabase dashboard (Authentication → Settings → Bot and Abuse
   Protection) — that's enforced server-side and can't be bypassed by
   skipping this page.
   ============================================ */
const THROTTLE_KEY = 'jamesgrill_admin_login_throttle';
const LOCKOUT_THRESHOLD = 5; // start locking out after this many failures in a row

function getThrottleState(){
    try{
        return JSON.parse(localStorage.getItem(THROTTLE_KEY)) || { count: 0, lockUntil: null };
    } catch(e){
        return { count: 0, lockUntil: null };
    }
}
function saveThrottleState(state){
    localStorage.setItem(THROTTLE_KEY, JSON.stringify(state));
}
function resetThrottle(){
    localStorage.removeItem(THROTTLE_KEY);
}
function remainingLockSeconds(){
    const state = getThrottleState();
    if (!state.lockUntil) return 0;
    return Math.max(0, Math.ceil((state.lockUntil - Date.now()) / 1000));
}
function isLockedOut(){
    return remainingLockSeconds() > 0;
}
function recordFailedAttempt(){
    const state = getThrottleState();
    state.count += 1;
    if (state.count >= LOCKOUT_THRESHOLD){
        // escalating cooldown: 30s, 60s, 2min, 4min, capped at 5min
        const tier = state.count - LOCKOUT_THRESHOLD;
        const seconds = Math.min(300, 30 * Math.pow(2, tier));
        state.lockUntil = Date.now() + seconds * 1000;
    }
    saveThrottleState(state);
}

let lockoutTimer = null;
function updateLoginUIForLockout(){
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const seconds = remainingLockSeconds();
    if (seconds > 0){
        if (submitBtn) submitBtn.disabled = true;
        showLoginError(`Too many failed attempts. Try again in ${seconds}s.`);
        clearTimeout(lockoutTimer);
        lockoutTimer = setTimeout(updateLoginUIForLockout, 1000);
    } else {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/* ============================================
   INPUT VALIDATION
   ============================================ */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginInput(email, password){
    if (!email || !EMAIL_PATTERN.test(email)){
        return 'Please enter a valid email address.';
    }
    if (!password){
        return 'Please enter your password.';
    }
    return null;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('loginError');
    errEl.classList.remove('show');

    if (isLockedOut()){
        updateLoginUIForLockout();
        return;
    }

    // clean and cap input before it goes anywhere near Supabase — trims
    // stray whitespace and enforces sane length limits (email/password
    // inputs also carry maxlength in the HTML as a first line of defense)
    const email = document.getElementById('loginEmail').value.trim().slice(0, 254);
    const password = document.getElementById('loginPassword').value.slice(0, 128);

    const validationError = validateLoginInput(email, password);
    if (validationError){
        showLoginError(validationError);
        return;
    }

    if (!window.supabaseClient){
        showLoginError('Supabase is not configured yet. Fill in supabase-client.js with your project URL and anon key.');
        return;
    }

    if (!turnstileToken){
        showLoginError('Please complete the verification check below.');
        return;
    }

    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const { error } = await window.supabaseClient.auth.signInWithPassword({
        email, password,
        options: { captchaToken: turnstileToken }
    });

    // Turnstile tokens are single-use — always reset after an attempt,
    // whether it succeeded or failed, so the next attempt gets a fresh one
    resetTurnstile();

    if (submitBtn) submitBtn.disabled = false;

    if (error){
        recordFailedAttempt();
        // deliberately generic: never reveal whether the email exists,
        // whether it's unconfirmed, or whether it was the password that
        // was wrong — all credential failures show the same message so
        // an attacker can't use the response to enumerate valid accounts.
        // A genuine connectivity problem still gets its own honest message.
        const isNetworkIssue = !error.status && /fetch|network/i.test(error.message || '');
        showLoginError(isNetworkIssue
            ? "Couldn't reach the server. Check your connection and try again."
            : 'Incorrect email or password.');
        if (isLockedOut()) updateLoginUIForLockout();
        return;
    }
    resetThrottle();
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
        document.getElementById('reviewsPanel').classList.toggle('active', tab === 'reviews');
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
    const items = (o.items || []).map(it => `<div class="order-line"><span>${escapeHtml(it.name)} x${it.qty}</span><span>${money(it.price * it.qty)}</span></div>`).join('');
    const statusOptions = STATUS_OPTIONS.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('');
    return `
    <div class="order-admin-card">
        <div class="order-admin-head">
            <div class="meta">
                <div><strong>${escapeHtml(o.id)}</strong> — ${new Date(o.created_at).toLocaleString()}</div>
                <div><strong>${escapeHtml(o.customer_name || '—')}</strong> · ${escapeHtml(o.customer_phone || '—')}</div>
                <div>${escapeHtml(o.address || '—')}</div>
                <div>${escapeHtml(o.payment_method || '—')}</div>
            </div>
            <select class="status-select" data-status-order="${escapeHtml(o.id)}">${statusOptions}</select>
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
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(row.category)}</td>
            <td>${money(row.price_min)} – ${money(row.price_max)}</td>
            <td>${escapeHtml(row.badge || '—')}</td>
            <td>
                <div class="row-actions">
                    <button data-edit="${escapeHtml(row.id)}" aria-label="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button data-delete="${escapeHtml(row.id)}" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
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
        document.getElementById('itemVariants').value = row.variants ? row.variants.join(', ') : '';
    } else {
        document.getElementById('itemModalTitle').textContent = 'Add Menu Item';
        document.getElementById('itemId').value = '';
    }

    modalBackdrop.classList.add('show');
}
function closeItemModal(){
    modalBackdrop.classList.remove('show');
}

let itemFormSubmitting = false;

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (itemFormSubmitting) return; // guard against double-click creating duplicate items
    const errEl = document.getElementById('itemFormError');
    errEl.classList.remove('show');

    itemFormSubmitting = true;
    const saveBtn = itemForm.querySelector('button[type="submit"]');
    if (saveBtn) saveBtn.disabled = true;

    const existingId = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value.trim();
    const id = existingId || slugify(name);

    const variantsRaw = document.getElementById('itemVariants').value.trim();
    const variants = variantsRaw
        ? variantsRaw.split(',').map(v => v.trim()).filter(Boolean)
        : null;

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
        badge: document.getElementById('itemBadge').value.trim() || null,
        variants: variants
    };

    const { error } = await window.supabaseClient.from('menu_items').upsert(record);

    itemFormSubmitting = false;
    if (saveBtn) saveBtn.disabled = false;

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
   REVIEWS MANAGEMENT
   ============================================ */
function starsPlain(rating){
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

async function loadReviewsAdmin(){
    const list = document.getElementById('reviewsAdminList');
    list.innerHTML = '<div class="empty-state small"><p>Loading reviews…</p></div>';

    const { data, error } = await window.supabaseClient
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

    if (error){
        list.innerHTML = `<div class="empty-state small"><h3>Couldn't load reviews</h3><p>${error.message}</p></div>`;
        return;
    }

    if (!data || data.length === 0){
        list.innerHTML = `
        <div class="empty-state small">
            <i class="fa-solid fa-star"></i>
            <h3>No reviews yet</h3>
            <p>Reviews submitted on the site will show up here.</p>
        </div>`;
        return;
    }

    list.innerHTML = data.map(reviewAdminCardHTML).join('');

    list.querySelectorAll('[data-approve]').forEach(btn => btn.addEventListener('click', () => setReviewApproval(btn.getAttribute('data-approve'), true)));
    list.querySelectorAll('[data-unapprove]').forEach(btn => btn.addEventListener('click', () => setReviewApproval(btn.getAttribute('data-unapprove'), false)));
    list.querySelectorAll('[data-delete-review]').forEach(btn => btn.addEventListener('click', () => deleteReview(btn.getAttribute('data-delete-review'))));
}

function reviewAdminCardHTML(r){
    const statusBadge = r.approved
        ? `<span class="order-status" style="background:rgba(76,201,120,.15); color:#4cc978;">Approved</span>`
        : `<span class="order-status">Pending</span>`;
    const actionBtn = r.approved
        ? `<button class="btn small outline" data-unapprove="${escapeHtml(r.id)}">Unpublish</button>`
        : `<button class="btn small" data-approve="${escapeHtml(r.id)}">Approve</button>`;
    return `
    <div class="order-admin-card">
        <div class="order-admin-head">
            <div class="meta">
                <div><strong>${escapeHtml(r.name)}</strong>${r.location ? ' · ' + escapeHtml(r.location) : ''}</div>
                <div>${new Date(r.created_at).toLocaleString()}</div>
                <div style="color:var(--ember);">${starsPlain(r.rating)}</div>
            </div>
            ${statusBadge}
        </div>
        <p style="font-size:1.4rem; color:var(--text-muted); line-height:1.6; margin-bottom:1.6rem;">${escapeHtml(r.message)}</p>
        <div style="display:flex; gap:.8rem; flex-wrap:wrap;">
            ${actionBtn}
            <button class="btn small outline" data-delete-review="${escapeHtml(r.id)}">Delete</button>
        </div>
    </div>`;
}

async function setReviewApproval(id, approved){
    const { error } = await window.supabaseClient.from('reviews').update({ approved }).eq('id', id);
    if (error){ alert('Could not update review: ' + error.message); return; }
    loadReviewsAdmin();
}

async function deleteReview(id){
    if (!confirm('Delete this review? This cannot be undone.')) return;
    const { error } = await window.supabaseClient.from('reviews').delete().eq('id', id);
    if (error){ alert('Could not delete review: ' + error.message); return; }
    loadReviewsAdmin();
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initAdminTheme();
    checkSession();
});