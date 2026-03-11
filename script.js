// --- Database Data & Local Storage Setup ---
const products = {
    caramel: {
        name: "Caramel Popcorn", price: 200,
        themeMain: "#b8860b", themeText: "#000", border: "#b8860b", img: "kk.jpeg"
    },
    strawberry: {
        name: "Strawberry Popcorn", price: 150,
        themeMain: "#ff69b4", themeText: "#fff", border: "#ff0000", img: "WhatsApp Image 2026-02-26 at 11.25.16 AM.jpeg"
    },
    premium: {
        name: "Premium Caramel Popcorn", price: 350,
        themeMain: "#d4af37", themeText: "#000", border: "#c0c0c0", img: "Gemini_Generated_Image_4qqtm84qqtm84qqt.png"
    }
};

let stock = JSON.parse(localStorage.getItem('mrcorn_stock')) || { caramel: 12, strawberry: 8, premium: 5 };
let cart = JSON.parse(localStorage.getItem('mrcorn_cart')) || [];
let ordersLog = JSON.parse(localStorage.getItem('mrcorn_orders')) || [];

let currentProduct = null;
let currentQty = 1;
let orderDetails = {};
let checkoutMode = 'direct'; // 'direct' or 'cart'

// --- Init & UI Bindings ---
window.addEventListener('load', () => {
    updateStockUI();
    updateCartUI();
    startCountdownTimer();
    startFakeNotifications();

    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        initAnimations();
        initParticles();
        startLiveCounter();
    }, 2500);
});

function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.hero-title', { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
    gsap.to('.hero-tagline', { opacity: 1, y: 0, duration: 1.5, ease: "power4.out", delay: 0.5 });

    let ticking = false;
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) header.classList.add('scrolled');
                else header.classList.remove('scrolled');
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    gsap.utils.toArray('.product-card').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" },
            opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)", delay: i * 0.2
        });
    });
}

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        let size = Math.random() * 5 + 2;
        p.style.width = size + 'px'; p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + 'vw'; p.style.top = Math.random() * 100 + 'vh';
        particlesContainer.appendChild(p);

        gsap.to(p, {
            y: "random(-100, 100)", x: "random(-100, 100)", opacity: "random(0.1, 0.5)",
            duration: "random(3, 8)", repeat: -1, yoyo: true, ease: "sine.inOut",
            force3D: true
        });
    }
}

// --- Live Timers & Counters ---
function startCountdownTimer() {
    // 5 hour countdown
    let time = 5 * 3600;
    const el = document.getElementById('countdown-timer');
    setInterval(() => {
        const h = Math.floor(time / 3600).toString().padStart(2, '0');
        const m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
        const s = (time % 60).toString().padStart(2, '0');
        el.innerText = `${h}:${m}:${s}`;
        if (time > 0) time--;
    }, 1000);
}

function startLiveCounter() {
    let count = 27;
    setInterval(() => {
        if (Math.random() > 0.6) {
            count++;
            document.getElementById('order-count').innerText = count;
            gsap.fromTo('#live-counter', { scale: 1.1 }, { scale: 1, duration: 0.3, ease: 'back.out' });
        }
    }, 8000);
}

function startFakeNotifications() {
    const names = ["Amila", "Kasun", "Ruwanthi", "Nimal", "Sanduni", "Kavindu", "Aroma"];
    const locs = ["Colombo", "Kandy", "Galle", "Negombo", "Jaffna", "Gampaha"];
    const items = ["Caramel", "Strawberry", "Premium Caramel"];

    setInterval(() => {
        if (Math.random() > 0.4) {
            const n = names[Math.floor(Math.random() * names.length)];
            const l = locs[Math.floor(Math.random() * locs.length)];
            const i = items[Math.floor(Math.random() * items.length)];
            showToast(`🍿 ${n} from ${l} just bought ${i} Popcorn!`);
        }
    }, 25000);
}

function showToast(msg) {
    const container = document.getElementById('notification-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = msg;
    container.appendChild(toast);

    // trigger animation
    setTimeout(() => toast.classList.add('show'), 50);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500); // cleanup dom
    }, 4500);
}

// --- Stock Management ---
function updateStockUI() {
    document.getElementById('stock-caramel').innerText = stock.caramel;
    document.getElementById('stock-strawberry').innerText = stock.strawberry;
    document.getElementById('stock-premium').innerText = stock.premium;
}


// --- Cart System ---
function saveCart() {
    localStorage.setItem('mrcorn_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(prodKey, qty = 1) {
    const existing = cart.find(item => item.key === prodKey);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ key: prodKey, qty: qty });
    }
    saveCart();

    // Animate cart button
    gsap.fromTo('.float-cart', { y: -15, scale: 1.2 }, { y: 0, scale: 1, duration: 0.5, ease: 'bounce.out' });
    showToast(`🛒 Added ${products[prodKey].name} to cart.`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function updateCartQty(index, newQty) {
    newQty = parseInt(newQty);
    if (newQty < 1) newQty = 1;
    if (newQty > 99) newQty = 99;
    cart[index].qty = newQty;
    saveCart();
}

function updateCartUI() {
    const navCounter = document.getElementById('cart-nav-count');
    const floatCounter = document.getElementById('float-cart-count');
    const headerCounter = document.getElementById('cart-header-count');
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    let totalQty = 0;
    let totalPrice = 0;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `<p class="cart-empty">Your luxury cart is empty.</p>`;
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach((item, idx) => {
            const p = products[item.key];
            totalQty += item.qty;
            totalPrice += (p.price * item.qty);

            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${p.name}</div>
                        <div class="cart-item-price">Rs. ${p.price}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn" onclick="updateCartQty(${idx}, ${item.qty - 1})">-</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="cart-qty-btn" onclick="updateCartQty(${idx}, ${item.qty + 1})">+</button>
                        <button class="cart-remove-btn" onclick="removeFromCart(${idx})" title="Remove">🗑️</button>
                    </div>
                </div>
            `;
        });
    }

    navCounter.innerText = totalQty;
    floatCounter.innerText = totalQty;
    headerCounter.innerText = `(${totalQty})`;
    totalEl.innerText = totalPrice;
}


// --- Modals Management ---
function openCartModal(e) {
    if (e) e.preventDefault();
    document.getElementById('cart-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('show');
    document.body.style.overflow = 'auto';
}


// --- Direct Buy Now Flow (Product Dashboard) ---
function openDashboard(prodKey) {
    currentProduct = products[prodKey];
    currentQty = 1;

    document.getElementById('dash-qty').value = 1;
    document.getElementById('dash-name').value = '';
    document.getElementById('dash-contact').value = '';
    document.getElementById('dash-address').value = '';
    document.getElementById('dash-error').style.display = 'none';

    document.getElementById('dash-title').innerText = currentProduct.name;
    document.getElementById('dash-title').style.color = currentProduct.themeMain;
    document.getElementById('dash-price').innerText = `Rs. ${currentProduct.price}`;
    document.getElementById('dash-total-price').innerText = currentProduct.price;
    document.getElementById('dash-img').src = currentProduct.img;

    document.getElementById('dashboard-content').style.borderColor = currentProduct.border;
    const btn = document.getElementById('buy-btn-dash');
    btn.style.backgroundColor = currentProduct.themeMain;
    btn.style.color = currentProduct.themeText;
    btn.style.border = `1px solid ${currentProduct.themeMain}`;

    document.getElementById('dashboard-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeDashboard() {
    document.getElementById('dashboard-modal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function updateTotal() {
    let qty = parseInt(document.getElementById('dash-qty').value);
    if (isNaN(qty) || qty < 1) qty = 1;
    document.getElementById('dash-qty').value = qty;
    document.getElementById('dash-total-price').innerText = currentProduct.price * qty;
}

function validateAndOpenOrderFlowFromDirect() {
    const name = document.getElementById('dash-name').value.trim();
    const contact = document.getElementById('dash-contact').value.trim();
    const address = document.getElementById('dash-address').value.trim();

    if (!name || !contact || !address) {
        document.getElementById('dash-error').style.display = 'block';
        return;
    }
    document.getElementById('dash-error').style.display = 'none';

    currentQty = parseInt(document.getElementById('dash-qty').value);
    orderDetails = {
        name, contact, address,
        items: [{ title: currentProduct.name, qty: currentQty, price: currentProduct.price * currentQty }],
        total: currentProduct.price * currentQty,
        theme: currentProduct.themeMain
    };

    checkoutMode = 'direct';
    closeDashboard();
    openPaymentSelection();
}


// --- Cart Checkout Flow ---
function openCheckoutDetailsFromCart() {
    closeCartModal();
    // clear fields
    document.getElementById('cart-name').value = '';
    document.getElementById('cart-contact').value = '';
    document.getElementById('cart-address').value = '';
    document.getElementById('cart-checkout-error').style.display = 'none';

    setTimeout(() => {
        document.getElementById('checkout-details-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 400);
}

function closeCheckoutDetailsModal() {
    document.getElementById('checkout-details-modal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function validateAndOpenOrderFlowFromCart() {
    const name = document.getElementById('cart-name').value.trim();
    const contact = document.getElementById('cart-contact').value.trim();
    const address = document.getElementById('cart-address').value.trim();

    if (!name || !contact || !address) {
        document.getElementById('cart-checkout-error').style.display = 'block';
        return;
    }

    const items = cart.map(i => ({ title: products[i.key].name, qty: i.qty, price: products[i.key].price * i.qty, key: i.key }));
    const total = items.reduce((acc, curr) => acc + curr.price, 0);

    orderDetails = { name, contact, address, items, total, theme: '#D4AF37' }; // default gold for cart checkout

    checkoutMode = 'cart';
    closeCheckoutDetailsModal();
    openPaymentSelection();
}


// --- Common Payment Selection Flow ---
function openPaymentSelection() {
    const btn = document.getElementById('cod-btn-checkout');
    btn.style.backgroundColor = orderDetails.theme;
    btn.style.color = (orderDetails.theme === '#ff69b4') ? '#fff' : '#000'; // handling strawberry
    btn.style.boxShadow = `0 0 20px ${orderDetails.theme}66`;
    document.getElementById('order-content').style.borderColor = orderDetails.theme;

    const summaryBlock = document.getElementById('payment-summary-block');
    let itemsHtml = orderDetails.items.map(i => `<p><strong>${i.qty}x</strong> ${i.title}</p>`).join('');

    summaryBlock.innerHTML = `
        ${itemsHtml}
        <hr style="border-color:#333; margin: 10px 0;">
        <p><strong>Total:</strong> Rs. <span>${orderDetails.total}</span></p>
    `;

    document.getElementById('payment-msg').innerText = '';

    setTimeout(() => {
        document.getElementById('order-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 400);
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function handleCardPayment() {
    const msg = document.getElementById('payment-msg');
    msg.style.color = '#ff4d4d';
    msg.innerText = "This service is currently unavailable.";
}

function handleCOD() {
    triggerConfetti();

    // Deduct stock
    if (checkoutMode === 'cart') {
        cart.forEach(i => { stock[i.key] = Math.max(0, stock[i.key] - i.qty); });
        cart = []; // empty cart
        saveCart();
    } else {
        const prodMatch = Object.keys(products).find(k => products[k].name === currentProduct.name);
        if (prodMatch) stock[prodMatch] = Math.max(0, stock[prodMatch] - currentQty);
    }

    localStorage.setItem('mrcorn_stock', JSON.stringify(stock));
    updateStockUI();

    // Save to Orders DB
    const orderRecord = {
        id: 'ORD' + Math.floor(Math.random() * 90000 + 10000),
        date: new Date().toLocaleDateString(),
        customer: orderDetails.name,
        contact: orderDetails.contact,
        items: orderDetails.items.map(i => `${i.qty}x ${i.title}`).join(', '),
        total: orderDetails.total,
        status: 'Pending'
    };
    ordersLog.unshift(orderRecord);
    localStorage.setItem('mrcorn_orders', JSON.stringify(ordersLog));

    // Render WhatsApp Message
    let itemsText = orderDetails.items.map(i => `- ${i.qty}x ${i.title}`).join('\n');
    const message = `🍿 *Hello MR.CORN! I would like to order:* 🍿
    
*Order ID:* ${orderRecord.id}
*Items:* 
${itemsText}
*Total Price:* Rs. ${orderDetails.total}

*Customer Details:*
👤 *Name:* ${orderDetails.name}
📞 *Contact:* ${orderDetails.contact}
📍 *Delivery Address:*
${orderDetails.address}

Please confirm my order!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/94784246103?text=${encodedMessage}`;

    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        closeOrderModal();
    }, 1500);
}


// --- Admin Panel Logic ---
function openAdminLogin(e) {
    if (e) e.preventDefault();
    document.getElementById('admin-pass').value = '';
    document.getElementById('admin-error').style.display = 'none';
    document.getElementById('admin-login-modal').classList.add('show');
}
function closeAdminLogin() {
    document.getElementById('admin-login-modal').classList.remove('show');
}

function authenticateAdmin() {
    const p = document.getElementById('admin-pass').value;
    if (p === 'admin123') { // Fake auth
        closeAdminLogin();
        openAdminDashboard();
    } else {
        document.getElementById('admin-error').style.display = 'block';
    }
}

function openAdminDashboard() {
    document.getElementById('admin-dashboard-view').style.display = 'block';
    document.body.style.overflow = 'hidden';

    document.getElementById('edit-stock-caramel').value = stock.caramel;
    document.getElementById('edit-stock-strawberry').value = stock.strawberry;
    document.getElementById('edit-stock-premium').value = stock.premium;

    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';

    // Analytics Metrics
    let totalRevenue = 0;
    let units = { c: 0, s: 0, p: 0 };

    if (ordersLog.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No orders recorded yet.</td></tr>`;
    } else {
        ordersLog.forEach(o => {
            totalRevenue += parseFloat(o.total) || 0;

            // Extract item counts for chart
            if (o.items) {
                const parts = o.items.split(',');
                parts.forEach(part => {
                    const match = part.trim().match(/^(\d+)x\s+(.+)$/);
                    if (match) {
                        const q = parseInt(match[1]);
                        const itemTitle = match[2];
                        if (itemTitle.includes('Premium')) units.p += q;
                        else if (itemTitle.includes('Strawberry')) units.s += q;
                        else if (itemTitle.includes('Caramel')) units.c += q;
                    }
                });
            }

            tbody.innerHTML += `
                <tr>
                    <td><strong>${o.id}</strong></td>
                    <td>${o.date}</td>
                    <td>${o.customer}<br><small>${o.contact}</small></td>
                    <td>${o.items}</td>
                    <td>Rs. ${o.total}</td>
                    <td><span style="color:#25D366">${o.status}</span></td>
                </tr>
            `;
        });
    }

    // Update Analytics UI
    const revenueStat = document.getElementById('total-revenue-stat');
    if (revenueStat) revenueStat.innerText = `Rs. ${totalRevenue.toLocaleString()}`;

    const ordersStat = document.getElementById('total-orders-stat');
    if (ordersStat) ordersStat.innerText = ordersLog.length;

    // Chart rendering (find max to scale out of 100%)
    const maxQty = Math.max(units.c, units.s, units.p, 1);

    const barC = document.getElementById('bar-caramel');
    if (barC) {
        barC.style.height = `${(units.c / maxQty) * 100}%`;
        document.getElementById('val-caramel').innerText = units.c;
    }

    const barS = document.getElementById('bar-strawberry');
    if (barS) {
        barS.style.height = `${(units.s / maxQty) * 100}%`;
        document.getElementById('val-strawberry').innerText = units.s;
    }

    const barP = document.getElementById('bar-premium');
    if (barP) {
        barP.style.height = `${(units.p / maxQty) * 100}%`;
        document.getElementById('val-premium').innerText = units.p;
    }
}

function closeAdminDashboard() {
    document.getElementById('admin-dashboard-view').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function saveStock() {
    stock.caramel = parseInt(document.getElementById('edit-stock-caramel').value) || 0;
    stock.strawberry = parseInt(document.getElementById('edit-stock-strawberry').value) || 0;
    stock.premium = parseInt(document.getElementById('edit-stock-premium').value) || 0;
    localStorage.setItem('mrcorn_stock', JSON.stringify(stock));
    updateStockUI();

    // Quick success toast
    const btn = document.querySelector('.admin-action-btn');
    btn.innerText = "Saved ✔";
    btn.style.backgroundColor = "#25D366";
    setTimeout(() => {
        btn.innerText = "Update Stock";
        btn.style.backgroundColor = "var(--gold)";
    }, 2000);
}

// --- Confetti ---
function triggerConfetti() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

    var interval = setInterval(function () {
        var timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        var particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 }, colors: [orderDetails.theme, '#FFFFFF', '#D4AF37'] });
        confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 }, colors: [orderDetails.theme, '#FFFFFF', '#D4AF37'] });
    }, 250);
}

window.onclick = function (event) {
    if (event.target == document.getElementById('dashboard-modal')) closeDashboard();
    if (event.target == document.getElementById('order-modal')) closeOrderModal();
    if (event.target == document.getElementById('cart-modal')) closeCartModal();
    if (event.target == document.getElementById('checkout-details-modal')) closeCheckoutDetailsModal();
    if (event.target == document.getElementById('admin-login-modal')) closeAdminLogin();
}
