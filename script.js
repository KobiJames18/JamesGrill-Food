/* ============================================
   STORAGE HELPERS
   ============================================ */
const CART_KEY = 'jamesgrill_cart';
const ORDERS_KEY = 'jamesgrill_orders';
const THEME_KEY = 'jamesgrill_theme';

function getCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e){ return []; }
}
function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadges();
}
function getOrders(){
    try{ return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
    catch(e){ return []; }
}
function saveOrders(orders){
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function findItem(id){
    return MENU_ITEMS.find(i => i.id === id);
}
function unitPrice(item){
    // use the midpoint of the [min, max] range as the actual charged price
    return Math.round((item.price[0] + item.price[1]) / 2);
}
function money(n){
    return 'Le ' + n.toLocaleString();
}

function addToCart(id, qty = 1){
    const cart = getCart();
    const existing = cart.find(c => c.id === id);
    if(existing){ existing.qty += qty; }
    else{ cart.push({ id, qty }); }
    saveCart(cart);
    const item = findItem(id);
    if(item) showToast(`${item.name} added to cart`);
}
function removeFromCart(id){
    saveCart(getCart().filter(c => c.id !== id));
    if(document.getElementById('cartItems')) renderCartPage();
}
function setQty(id, qty){
    let cart = getCart();
    if(qty <= 0){
        cart = cart.filter(c => c.id !== id);
    } else {
        const existing = cart.find(c => c.id === id);
        if(existing) existing.qty = qty;
    }
    saveCart(cart);
    if(document.getElementById('cartItems')) renderCartPage();
}
function cartCount(){
    return getCart().reduce((sum, c) => sum + c.qty, 0);
}
function cartTotal(){
    return getCart().reduce((sum, c) => {
        const item = findItem(c.id);
        return item ? sum + unitPrice(item) * c.qty : sum;
    }, 0);
}
function updateCartBadges(){
    document.querySelectorAll('[data-cart-count]').forEach(el => {
        const count = cartCount();
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

/* ============================================
   TOAST
   ============================================ */
function showToast(message){
    let toast = document.querySelector('.toast');
    if(!toast){
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-fire"></i><span></span>`;
        document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ============================================
   THEME TOGGLE
   ============================================ */
function initTheme(){
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem(THEME_KEY, next);
            updateThemeIcon(next);
        });
    });
}
function updateThemeIcon(theme){
    document.querySelectorAll('[data-theme-toggle] i').forEach(icon => {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
}

/* ============================================
   MOBILE MENU + SCROLL
   ============================================ */
function initMobileMenu(){
    const menu = document.getElementById('menu-bar');
    const navbar = document.querySelector('.navbar');
    if(!menu || !navbar) return;

    menu.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('active');
        menu.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    window.addEventListener('scroll', () => {
        if(navbar.classList.contains('active')){
            navbar.classList.remove('active');
            menu.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });
}

/* ============================================
   SEARCH BOX (header)
   ============================================ */
function initHeaderSearch(){
    const toggleBtn = document.querySelector('[data-search-toggle]');
    const box = document.querySelector('.search-box');
    if(!toggleBtn || !box) return;

    toggleBtn.addEventListener('click', () => {
        box.classList.toggle('active');
        if(box.classList.contains('active')) box.querySelector('input').focus();
    });

    const form = box.tagName === 'FORM' ? box : box.querySelector('form');
    if(form){
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = form.querySelector('input').value.trim();
            window.location.href = 'menu.html' + (q ? ('?q=' + encodeURIComponent(q)) : '');
        });
    }
}

/* ============================================
   MEAL CARD RENDERING (shared by home + menu)
   ============================================ */
function starsHTML(rating){
    let html = '<div class="stars">';
    for(let i = 1; i <= 5; i++){
        html += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
    }
    return html + '</div>';
}

function mealCardHTML(item){
    const thumb = item.image
        ? `<img src="${item.image}" alt="${item.name}">`
        : `<div class="icon-fallback"><i class="fa-solid ${item.icon}"></i></div>`;
    const badge = item.badge ? `<span class="badge">${item.badge}</span>` : '';
    return `
    <div class="meal-card" data-category="${item.category}" data-name="${item.name.toLowerCase()}">
        <div class="thumb">
            ${thumb}
            <span class="price-tag">${money(item.price[0])} - ${money(item.price[1])}</span>
            ${badge}
        </div>
        <div class="body">
            <h3>${item.name}</h3>
            ${starsHTML(item.rating)}
            <p>${item.desc}</p>
            <div class="foot">
                <span class="unit-price">${money(unitPrice(item))} / order</span>
                <button class="btn small" data-add-to-cart="${item.id}"><i class="fa-solid fa-cart-plus"></i> Add</button>
            </div>
        </div>
    </div>`;
}

function renderGrid(container, items){
    if(!container) return;
    if(items.length === 0){
        container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-fire-flame-curved"></i>
            <h3>Nothing on the grill for that search</h3>
            <p>Try a different keyword or category.</p>
        </div>`;
        return;
    }
    container.innerHTML = items.map(mealCardHTML).join('');
}

function wireAddToCartButtons(root = document){
    root.querySelectorAll('[data-add-to-cart]').forEach(btn => {
        btn.addEventListener('click', () => addToCart(btn.getAttribute('data-add-to-cart')));
    });
}

/* ============================================
   HOME PAGE
   ============================================ */
function initHomePage(){
    const featuredEl = document.getElementById('featuredGrid');
    if(!featuredEl) return;
    const featured = MENU_ITEMS.filter(i => i.badge).concat(
        MENU_ITEMS.filter(i => !i.badge)
    ).slice(0, 6);
    renderGrid(featuredEl, featured);
    wireAddToCartButtons(featuredEl);

    const catEl = document.getElementById('categoryGrid');
    if(catEl){
        catEl.innerHTML = CATEGORIES.map(c => `
            <a href="menu.html?cat=${c.id}" class="cat-card">
                <div class="icon"><i class="fa-solid ${c.icon}"></i></div>
                <h3>${c.label}</h3>
                <p>${MENU_ITEMS.filter(i => i.category === c.id).length} items</p>
            </a>`).join('');
    }
}

/* ============================================
   MENU PAGE
   ============================================ */
function initMenuPage(){
    const grid = document.getElementById('menuGrid');
    if(!grid) return;

    const params = new URLSearchParams(window.location.search);
    let activeCategory = params.get('cat') || 'all';
    let query = params.get('q') || '';

    const searchInput = document.getElementById('menuSearchInput');
    if(searchInput) searchInput.value = query;

    const pillsWrap = document.getElementById('filterPills');
    const pills = ['all', ...CATEGORIES.map(c => c.id)];
    if(pillsWrap){
        pillsWrap.innerHTML = pills.map(id => {
            const label = id === 'all' ? 'All' : CATEGORIES.find(c => c.id === id).label;
            return `<button data-filter="${id}" class="${id === activeCategory ? 'active' : ''}">${label}</button>`;
        }).join('');
    }

    function apply(){
        let items = MENU_ITEMS.filter(i => activeCategory === 'all' || i.category === activeCategory);
        if(query){
            const q = query.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
        }
        renderGrid(grid, items);
        wireAddToCartButtons(grid);
    }

    if(pillsWrap){
        pillsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if(!btn) return;
            activeCategory = btn.getAttribute('data-filter');
            pillsWrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
            apply();
        });
    }

    if(searchInput){
        searchInput.addEventListener('input', () => {
            query = searchInput.value.trim();
            apply();
        });
    }

    apply();
}

/* ============================================
   CART PAGE
   ============================================ */
function renderCartPage(){
    const container = document.getElementById('cartItems');
    if(!container) return;
    const cart = getCart();

    if(cart.length === 0){
        container.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-cart-shopping"></i>
            <h3>Your cart is empty</h3>
            <p>Browse the menu and add something fresh off the grill.</p>
            <a href="menu.html" class="btn" style="margin-top:2rem;">Browse Menu</a>
        </div>`;
    } else {
        container.innerHTML = cart.map(c => {
            const item = findItem(c.id);
            if(!item) return '';
            const thumb = item.image
                ? `<div class="thumb"><img src="${item.image}" alt="${item.name}"></div>`
                : `<div class="thumb icon-fallback"><i class="fa-solid ${item.icon}"></i></div>`;
            return `
            <div class="cart-item">
                ${thumb}
                <div class="info">
                    <h4>${item.name}</h4>
                    <span class="unit-price">${money(unitPrice(item))} each</span>
                </div>
                <div class="qty-control">
                    <button data-qty-down="${item.id}">&minus;</button>
                    <span>${c.qty}</span>
                    <button data-qty-up="${item.id}">+</button>
                </div>
                <div class="line-total">${money(unitPrice(item) * c.qty)}</div>
                <div class="remove" data-remove="${item.id}"><i class="fa-solid fa-trash"></i></div>
            </div>`;
        }).join('');
    }

    container.querySelectorAll('[data-qty-up]').forEach(btn => {
        const id = btn.getAttribute('data-qty-up');
        btn.addEventListener('click', () => {
            const c = getCart().find(x => x.id === id);
            setQty(id, (c ? c.qty : 0) + 1);
        });
    });
    container.querySelectorAll('[data-qty-down]').forEach(btn => {
        const id = btn.getAttribute('data-qty-down');
        btn.addEventListener('click', () => {
            const c = getCart().find(x => x.id === id);
            setQty(id, (c ? c.qty : 0) - 1);
        });
    });
    container.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-remove')));
    });

    const subtotal = cartTotal();
    const deliveryFee = subtotal > 0 ? 15 : 0;
    const total = subtotal + deliveryFee;

    const subtotalEl = document.getElementById('cartSubtotal');
    const deliveryEl = document.getElementById('cartDelivery');
    const totalEl = document.getElementById('cartTotal');
    if(subtotalEl) subtotalEl.textContent = money(subtotal);
    if(deliveryEl) deliveryEl.textContent = subtotal > 0 ? money(deliveryFee) : '—';
    if(totalEl) totalEl.textContent = money(total);

    // NOTE: checkoutBtn is an <a>, not a <button> — the `disabled` property
    // does nothing on anchor elements. Use a class + aria-disabled instead,
    // paired with the click-guard already in cart.html that blocks navigation
    // when the cart is empty. Add `.btn.is-disabled { opacity:.5; pointer-events:none; }`
    // to style.css if you want it to look disabled too, not just behave that way.
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn){
        const isEmpty = cart.length === 0;
        checkoutBtn.classList.toggle('is-disabled', isEmpty);
        checkoutBtn.setAttribute('aria-disabled', isEmpty ? 'true' : 'false');
    }
}

/* ============================================
   CHECKOUT PAGE
   ============================================ */
function initCheckoutPage(){
    const form = document.getElementById('checkoutForm');
    if(!form) return;

    const cart = getCart();
    const summary = document.getElementById('checkoutSummary');
    if(summary){
        if(cart.length === 0){
            summary.innerHTML = `<p class="sub">Your cart is empty. <a href="menu.html" style="color:var(--flame)">Go add something</a> before checking out.</p>`;
            form.querySelector('button[type="submit"]').disabled = true;
        } else {
            summary.innerHTML = cart.map(c => {
                const item = findItem(c.id);
                if(!item) return '';
                return `<div class="summary-row"><span>${item.name} x${c.qty}</span><span>${money(unitPrice(item) * c.qty)}</span></div>`;
            }).join('');
            const subtotal = cartTotal();
            const deliveryFee = 15;
            summary.innerHTML += `
                <div class="summary-row"><span>Delivery</span><span>${money(deliveryFee)}</span></div>
                <div class="summary-row total"><span>Total</span><span>${money(subtotal + deliveryFee)}</span></div>`;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cartNow = getCart();
        if(cartNow.length === 0) return;

        const name = document.getElementById('coName').value.trim();
        const phone = document.getElementById('coPhone').value.trim();
        const address = document.getElementById('coAddress').value.trim();
        const payment = form.querySelector('input[name="payment"]:checked');

        const order = {
            id: 'TG-' + Date.now().toString().slice(-6),
            date: new Date().toISOString(),
            name, phone, address,
            payment: payment ? payment.value : 'Cash on Delivery',
            items: cartNow.map(c => {
                const item = findItem(c.id);
                return { name: item.name, qty: c.qty, price: unitPrice(item) };
            }),
            subtotal: cartTotal(),
            delivery: 15,
            total: cartTotal() + 15,
            status: 'Processing'
        };

        const orders = getOrders();
        orders.unshift(order);
        saveOrders(orders);
        saveCart([]);

        window.location.href = 'orders.html?placed=' + order.id;
    });
}

/* ============================================
   ORDERS PAGE
   ============================================ */
function initOrdersPage(){
    const list = document.getElementById('ordersList');
    if(!list) return;
    const orders = getOrders();
    const params = new URLSearchParams(window.location.search);
    const justPlaced = params.get('placed');

    const banner = document.getElementById('orderPlacedBanner');
    if(banner){
        if(justPlaced){
            banner.classList.add('show');
            banner.innerHTML = `<i class="fa-solid fa-circle-check"></i> Order ${justPlaced} placed! We're firing up the grill.`;
        } else {
            banner.classList.remove('show');
        }
    }

    if(orders.length === 0){
        list.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-receipt"></i>
            <h3>No orders yet</h3>
            <p>Once you check out, your order history will show up here.</p>
            <a href="menu.html" class="btn" style="margin-top:2rem;">Order Something</a>
        </div>`;
        return;
    }

    list.innerHTML = orders.map(o => `
        <div class="order-card">
            <div class="order-head">
                <div>
                    <div class="order-id">${o.id}</div>
                    <div class="order-date">${new Date(o.date).toLocaleString()}</div>
                </div>
                <span class="order-status">${o.status}</span>
            </div>
            ${o.items.map(it => `<div class="order-line"><span>${it.name} x${it.qty}</span><span>${money(it.price * it.qty)}</span></div>`).join('')}
            <div class="order-line" style="margin-top:1rem; padding-top:1rem; border-top:.1rem dashed var(--border);"><span>Delivery</span><span>${money(o.delivery)}</span></div>
            <div class="order-line"><strong>Total</strong><strong>${money(o.total)}</strong></div>
        </div>`).join('');
}

/* ============================================
   CONTACT PAGE
   ============================================ */
function initContactPage(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    const msg = document.getElementById('contactMsg');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        msg.textContent = "Thanks for reaching out we'll get back to you shortly.";
        msg.className = 'form-msg success show';
        form.reset();
    });
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initHeaderSearch();
    updateCartBadges();
    initHomePage();
    initMenuPage();
    renderCartPage();
    initCheckoutPage();
    initOrdersPage();
    initContactPage();
});