// Products Database
const products = [
    {
        id: 'sandalwood',
        name: 'प्रीमियम चंदन अगरबत्ती',
        enName: 'Premium Sandalwood Agarbatti',
        subtitle: 'पवित्र आणि शांत सुगंधी चंदन काड्या',
        desc: 'रवी अगरबत्तीचे खास उत्पादन. १००% शुद्ध चंदनाचा वापर करून तयार केलेली ही अगरबत्ती घरातील आणि मंदिरातील वातावरण शांत आणि पवित्र ठेवते.',
        image: 'assets/sandalwood.png',
        rating: 5,
        sizes: [
            { label: '100g', price: 99, originalPrice: 120 },
            { label: '250g', price: 220, originalPrice: 270 },
            { label: '500g', price: 420, originalPrice: 500 },
            { label: '1kg', price: 799, originalPrice: 950 }
        ]
    },
    {
        id: 'mogra',
        name: 'रॉयल मोगरा अगरबत्ती',
        enName: 'Royal Mogra Agarbatti',
        subtitle: 'ताजी आणि मनमोहक मोगरा फुले सुवास',
        desc: 'ताज्या मोगऱ्याच्या फुलांच्या सुवासाने मन प्रसन्न करा. या अगरबत्तीचा मंद सुगंध दीर्घकाळ राहतो आणि थकवा दूर करण्यास मदत करतो.',
        image: 'assets/mogra.png',
        rating: 4.8,
        sizes: [
            { label: '100g', price: 89, originalPrice: 110 },
            { label: '250g', price: 199, originalPrice: 250 },
            { label: '500g', price: 380, originalPrice: 460 },
            { label: '1kg', price: 720, originalPrice: 850 }
        ]
    },
    {
        id: 'champa',
        name: 'डिव्हाइन चंपा अगरबत्ती',
        enName: 'Divine Champa Agarbatti',
        subtitle: 'मंदिरासारखा दैवी चंपा फुलांचा सुगंध',
        desc: 'पारंपारिक चंपा (सोनचाफा) सुगंध जो मनाला शांत करतो. ध्यान आणि पूजेसाठी अत्यंत उपयुक्त अशी ही अगरबत्ती आहे.',
        image: 'assets/champa.png',
        rating: 4.7,
        sizes: [
            { label: '100g', price: 95, originalPrice: 115 },
            { label: '250g', price: 210, originalPrice: 260 },
            { label: '500g', price: 399, originalPrice: 480 },
            { label: '1kg', price: 750, originalPrice: 900 }
        ]
    },
    {
        id: 'loban',
        name: 'सेक्रेड लोबान अगरबत्ती',
        enName: 'Sacred Loban Agarbatti',
        subtitle: 'शुद्ध गुग्गुळ आणि लोबान धूप सुगंध',
        desc: 'घरातील नकारात्मक ऊर्जा नष्ट करण्यासाठी आणि शुद्ध धूपाचा अनुभव घेण्यासाठी नैसर्गिक लोबान व गुग्गुळ पावडरने बनवलेली अगरबत्ती.',
        image: 'assets/loban.png',
        rating: 4.9,
        sizes: [
            { label: '100g', price: 99, originalPrice: 120 },
            { label: '250g', price: 220, originalPrice: 270 },
            { label: '500g', price: 420, originalPrice: 500 },
            { label: '1kg', price: 799, originalPrice: 950 }
        ]
    }
];

// App State Management
let cart = [];
let selectedSizes = {}; // Tracks selected size per product (e.g. { sandalwood: '250g' })
let currentOrder = null;
let activeAdminFilter = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Set default selected sizes for all products
    products.forEach(p => {
        selectedSizes[p.id] = p.sizes[0].label; // default to first size (100g)
    });
    
    // Load state from session/localStorage
    loadCartFromSession();
    renderProducts();
    updateCartUI();

    // Check if admin was logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('nav-admin').innerHTML = '<i class="fa-solid fa-gauge-high"></i> डॅशबोर्ड';
    }

    // Scroll to products on hero click
    const scrollBtn = document.querySelector('.scroll-btn');
    if(scrollBtn) {
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#products-list').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Custom tracking search setup
    const trackSearchInput = document.getElementById('track-search-input');
    if (trackSearchInput) {
        trackSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchOrderTracking();
            }
        });
    }

    // Handle invoice to tracking screen transition
    const btnGoToTracking = document.getElementById('btn-go-to-tracking');
    if(btnGoToTracking) {
        btnGoToTracking.addEventListener('click', () => {
            if(currentOrder) {
                viewOrderTracking(currentOrder.id);
            }
        });
    }
});

// Navigation System
function navigateTo(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(s => s.classList.add('hidden'));

    // Show target screen
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }

    // Update active state in nav links
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Highlight menu options
    if (screenId === 'shop') {
        document.getElementById('nav-shop').classList.add('active');
    } else if (screenId === 'tracking-search' || screenId === 'tracking-details') {
        document.getElementById('nav-track').classList.add('active');
    } else if (screenId === 'admin-dashboard' || screenId === 'admin-login') {
        document.getElementById('nav-admin').classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Custom view actions
    if (screenId === 'admin-dashboard') {
        checkAdminAuth();
        renderAdminDashboard();
    } else if (screenId === 'cart') {
        renderCartItems();
    } else if (screenId === 'checkout') {
        renderCheckoutSummary();
    }
}

// Render Products Grid
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    
    products.forEach(p => {
        const activeSize = selectedSizes[p.id];
        const sizeInfo = p.sizes.find(s => s.label === activeSize);
        
        // Stars HTML
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(p.rating)) {
                starsHTML += '<i class="fa-solid fa-star"></i>';
            } else if (i - 0.5 <= p.rating) {
                starsHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
            } else {
                starsHTML += '<i class="fa-regular fa-star"></i>';
            }
        }

        // Size Pills HTML
        let sizePillsHTML = '';
        p.sizes.forEach(s => {
            const isActive = s.label === activeSize ? 'active' : '';
            sizePillsHTML += `<div class="size-pill ${isActive}" onclick="selectProductSize('${p.id}', '${s.label}')">${s.label}</div>`;
        });

        const cardHTML = `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <span class="product-badge">बेस्ट सेलर</span>
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <div class="rating-stars">
                        ${starsHTML} <span style="color: var(--text-muted); font-size: 0.75rem;">(${p.rating})</span>
                    </div>
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-subtitle">${p.subtitle}</p>
                    <p class="product-description">${p.desc}</p>
                    
                    <div class="size-selector-label">पॅकिंग निवडा (Select Size):</div>
                    <div class="size-pills">
                        ${sizePillsHTML}
                    </div>

                    <div class="product-footer">
                        <div class="product-price">
                            <h3>₹${sizeInfo.price} <span class="original-price">₹${sizeInfo.originalPrice}</span></h3>
                        </div>
                        <button class="btn-primary" onclick="addProductToCart('${p.id}')">
                            <i class="fa-solid fa-cart-plus"></i> कार्टमध्ये टाका
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Select Product Size
function selectProductSize(productId, sizeLabel) {
    selectedSizes[productId] = sizeLabel;
    renderProducts();
}

// Cart System Functions
function addProductToCart(productId) {
    const product = products.find(p => p.id === productId);
    const sizeLabel = selectedSizes[productId];
    const sizeInfo = product.sizes.find(s => s.label === sizeLabel);

    // Check if product with this size already in cart
    const existingIndex = cart.findIndex(item => item.id === productId && item.size === sizeLabel);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            enName: product.enName,
            size: sizeLabel,
            price: sizeInfo.price,
            qty: 1,
            img: product.image
        });
    }

    saveCartToSession();
    updateCartUI();
    showNotification(`${product.name} (${sizeLabel}) कार्टमध्ये जोडले गेले!`);
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge-count');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if(badge) {
        badge.innerText = totalItems;
        // Trigger mini bounce animation
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const checkoutBtn = document.getElementById('btn-proceed-checkout');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-basket-shopping"></i>
                <h3>तुमचे कार्ट रिकामे आहे!</h3>
                <p>कृपया खरेदी करण्यासाठी उत्पादने निवडा.</p>
                <button class="btn-primary" onclick="navigateTo('shop')" style="margin-top: 15px;">खरेदी सुरू करा</button>
            </div>
        `;
        if (subtotalEl) subtotalEl.innerText = '₹0';
        if (totalEl) totalEl.innerText = '₹0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;
    container.innerHTML = '';
    
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const itemHTML = `
            <div class="cart-item">
                <div class="cart-item-details">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>पॅकिंग: <strong>${item.size}</strong></p>
                        <p>दर: ₹${item.price} प्रति पॅकेट</p>
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <div class="qty-value">${item.qty}</div>
                    <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <div class="cart-item-price">₹${itemTotal}</div>
                <button class="cart-item-remove" onclick="removeCartItem(${index})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });

    if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
    if (totalEl) totalEl.innerText = `₹${subtotal}`;
}

function changeQuantity(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCartToSession();
    updateCartUI();
    renderCartItems();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    saveCartToSession();
    updateCartUI();
    renderCartItems();
}

function saveCartToSession() {
    sessionStorage.setItem('ravi_cart', JSON.stringify(cart));
}

function loadCartFromSession() {
    const stored = sessionStorage.getItem('ravi_cart');
    if (stored) {
        cart = JSON.parse(stored);
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// Notification Alert Maker
function showNotification(message) {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    
    // Quick Inline Toast Styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#2e7d32',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '1000',
        display: 'flex',
        align-items: 'center',
        gap: '10px',
        fontSize: '0.9rem',
        fontWeight: '600',
        animation: 'slideDown 0.3s ease-out'
    });

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 3. CHECKOUT & LOCATION AUTO-DETECTION
function renderCheckoutSummary() {
    const listContainer = document.getElementById('checkout-items-list');
    const totalEl = document.getElementById('checkout-total-price');

    if (!listContainer || !totalEl) return;

    listContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        
        listContainer.insertAdjacentHTML('beforeend', `
            <div class="checkout-item-row">
                <span>${item.name} (${item.size}) x ${item.qty}</span>
                <span>₹${itemTotal}</span>
            </div>
        `);
    });

    totalEl.innerText = `₹${total}`;
}

// Mock Location Detection
let detectedCoordinates = null;

function detectLocation() {
    const gpsBox = document.getElementById('gps-status-box');
    const mapContainer = document.getElementById('mock-map-container');
    const addressArea = document.getElementById('cust-address');
    const cityInput = document.getElementById('cust-city');
    const pincodeInput = document.getElementById('cust-pincode');

    if (!gpsBox || !mapContainer) return;

    gpsBox.classList.remove('hidden');
    mapContainer.classList.add('hidden');
    
    const statusText = document.getElementById('gps-status-text');
    statusText.innerText = 'जीपीएस लोकेशन शोधत आहे...';

    // Check Geolocation Support
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                detectedCoordinates = {
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                };
                
                // Show loading animation on mock map for 2 seconds
                setTimeout(() => {
                    statusText.innerText = 'लोकेशन सापडले! मॅपिंग डेटा लोड करत आहे...';
                    mapContainer.classList.remove('hidden');

                    setTimeout(() => {
                        // Autofill realistic addresses
                        const sampleAddresses = [
                            { addr: "रवी निवास, राम मंदिर रोड, शिर्डी", city: "शिर्डी (Rahata)", pin: "423109" },
                            { addr: "प्लॉट नं. २४, गल्ली नं. ३, शिवाजी नगर, अहमदनगर", city: "अहमदनगर", pin: "414001" },
                            { addr: "साई श्रद्धा अपार्टमेंट, मु. पो. कोपरगाव, कोपरगाव", city: "कोपरगाव", pin: "423601" }
                        ];
                        const selection = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
                        
                        if(addressArea) addressArea.value = `${selection.addr} [GPS Coordinates: ${detectedCoordinates.lat}, ${detectedCoordinates.lng}]`;
                        if(cityInput) cityInput.value = selection.city;
                        if(pincodeInput) pincodeInput.value = selection.pin;
                        
                        gpsBox.classList.add('hidden');
                        showNotification('जीपीएस वरून पत्ता यशस्वीरीत्या डिटेक्ट केला गेला!');
                    }, 1200);
                }, 1000);
            },
            (error) => {
                // Fallback if permission denied
                setTimeout(() => {
                    statusText.innerText = 'GPS सिग्नल मिळाला नाही, नेटवर्क वरून शोधत आहे...';
                    mapContainer.classList.remove('hidden');
                    
                    setTimeout(() => {
                        detectedCoordinates = { lat: "19.7662", lng: "74.4759" }; // Mock Shirdi Coords
                        
                        if(addressArea) addressArea.value = "साई कॉलनी, गल्ली नंबर १, नगर-मनमाड रोड, शिर्डी";
                        if(cityInput) cityInput.value = "शिर्डी";
                        if(pincodeInput) pincodeInput.value = "423109";
                        
                        gpsBox.classList.add('hidden');
                        showNotification('नेटवर्क वरून पत्ता डिटेक्ट केला गेला!');
                    }, 1500);
                }, 800);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        gpsBox.classList.add('hidden');
        alert("तुमचे ब्राउझर जीपीएस ला सपोर्ट करत नाही.");
    }
}

// Handle Form Submission
function handleCheckoutSubmit(event) {
    event.preventDefault();

    if(cart.length === 0) {
        alert("तुमचे कार्ट रिकामे आहे!");
        navigateTo('shop');
        return;
    }

    // Generate unique order ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `RA-${randomNum}`;

    // Get input details
    const name = document.getElementById('cust-name').value;
    const mobile = document.getElementById('cust-mobile').value;
    const altMobile = document.getElementById('cust-alt-mobile').value || '-';
    const address = document.getElementById('cust-address').value;
    const city = document.getElementById('cust-city').value;
    const pincode = document.getElementById('cust-pincode').value;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('mr-IN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    currentOrder = {
        id: orderId,
        date: formattedDate,
        rawDate: today.toISOString(),
        customer: {
            name: name,
            mobile: mobile,
            altMobile: altMobile
        },
        address: `${address}, ${city} - ${pincode}`,
        city: city,
        pincode: pincode,
        coordinates: detectedCoordinates || { lat: "N/A", lng: "N/A" },
        items: [...cart],
        total: getCartTotal(),
        paymentStatus: 'Pending',
        status: 'Ordered',
        courierId: `EK${mobile}`,
        statusLogs: [
            {
                status: 'Ordered',
                time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }) + ' | ' + new Date().toLocaleDateString('mr-IN'),
                desc: 'ऑर्डर यशस्वीरीत्या नोंदवण्यात आली आहे.'
            }
        ]
    };

    // Save order status, show payment screen
    document.getElementById('payment-order-id').innerText = `#${orderId}`;
    document.getElementById('payment-amount').innerText = `₹${currentOrder.total}`;
    
    // Hide QR display until "View QR" is clicked
    document.getElementById('qr-display-container').classList.add('hidden');

    navigateTo('payment');
}

// 4. UPI QR CODE GENERATION
function showQRCode() {
    const qrContainer = document.getElementById('qr-display-container');
    const qrImage = document.getElementById('upi-qr-image');

    if (!qrContainer || !qrImage || !currentOrder) return;

    // Create Official UPI Deep Link
    // UPI parameters: pa = UPI ID, pn = Payee Name, am = Amount, cu = Currency, tn = Transaction Note
    const upiID = "9307696455@ybl"; // Merchant Mobile Support UPI
    const payeeName = "Ravi Agarbatti";
    const amount = currentOrder.total;
    const note = `Order-${currentOrder.id}`;
    
    const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Call dynamic QR code generation API
    // size 250x250
    const qrAPIUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
    
    qrImage.src = qrAPIUrl;
    qrContainer.classList.remove('hidden');
}

// Simulated payments (Testing helper)
function simulatePaymentSuccess() {
    if (!currentOrder) return;

    currentOrder.paymentStatus = 'Paid';
    
    // Save order in localStorage orders list
    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');
    orders.push(currentOrder);
    localStorage.setItem('ravi_orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    saveCartToSession();
    updateCartUI();

    // Prepare Invoice data
    renderInvoice(currentOrder);
    navigateTo('invoice');
}

function simulatePaymentFail() {
    alert("पेमेंट अयशस्वी झाले! कृपया पुन्हा क्यूआर कोड स्कॅन करून प्रयत्न करा.");
}

// 5. INVOICE RENDERING
function renderInvoice(order) {
    document.getElementById('inv-order-id').innerText = `#${order.id}`;
    document.getElementById('inv-date').innerText = new Date(order.rawDate).toLocaleDateString('mr-IN');
    document.getElementById('inv-cust-name').innerText = order.customer.name;
    document.getElementById('inv-cust-phone').innerText = order.customer.mobile;
    document.getElementById('inv-cust-alt-phone').innerText = order.customer.altMobile;
    document.getElementById('inv-cust-address').innerText = order.address;

    const tbody = document.getElementById('invoice-items-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    order.items.forEach(item => {
        const itemTotal = item.price * item.qty;
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${item.name}</td>
                <td>${item.size}</td>
                <td class="text-right">₹${item.price}</td>
                <td class="text-center">${item.qty}</td>
                <td class="text-right">₹${itemTotal}</td>
            </tr>
        `);
    });

    document.getElementById('inv-subtotal').innerText = `₹${order.total}`;
    document.getElementById('inv-grand-total').innerText = `₹${order.total}`;
}

// 6. ORDER TRACKING
function searchOrderTracking() {
    const input = document.getElementById('track-search-input').value.trim();
    const errorEl = document.getElementById('tracking-search-error');

    if (!input) {
        alert("कृपया ऑर्डर नंबर टाका!");
        return;
    }

    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');
    // Match case-insensitive
    const foundOrder = orders.find(o => o.id.toLowerCase() === input.toLowerCase());

    if (foundOrder) {
        errorEl.classList.add('hidden');
        renderTrackingDetails(foundOrder);
        navigateTo('tracking-details');
    } else {
        errorEl.classList.remove('hidden');
    }
}

function viewOrderTracking(orderId) {
    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');
    const foundOrder = orders.find(o => o.id === orderId);
    if(foundOrder) {
        renderTrackingDetails(foundOrder);
        navigateTo('tracking-details');
    }
}

function renderTrackingDetails(order) {
    document.getElementById('track-order-id').innerText = `#${order.id}`;
    document.getElementById('track-courier-id').innerText = order.courierId || `EK${order.customer.mobile}`;
    document.getElementById('track-delivery-address').innerText = order.address;
    
    // Sidebar list
    const itemsList = document.getElementById('track-items-list');
    itemsList.innerHTML = '';
    order.items.forEach(item => {
        itemsList.insertAdjacentHTML('beforeend', `
            <div class="checkout-item-row" style="font-size: 0.8rem; margin-bottom: 6px;">
                <span>${item.name} (${item.size}) x ${item.qty}</span>
                <span>₹${item.price * item.qty}</span>
            </div>
        `);
    });
    document.getElementById('track-total-price').innerText = `₹${order.total}`;

    // Estimated delivery (usually 3 days after ordering)
    const orderDate = new Date(order.rawDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 4);
    document.getElementById('track-est-days').innerText = deliveryDate.toLocaleDateString('mr-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Reset all stepper states
    const steps = ['ordered', 'packed', 'shipped', 'delivered'];
    steps.forEach(s => {
        const el = document.getElementById(`step-${s}`);
        el.className = 'step'; // Reset class
    });

    // Translate Status
    let statusText = 'कन्फर्म';
    let activeStepIndex = 0;

    if (order.status === 'Ordered') {
        statusText = 'ऑर्डर कन्फर्म झाली';
        activeStepIndex = 0;
    } else if (order.status === 'Packed') {
        statusText = 'पॅकिंग पूर्ण';
        activeStepIndex = 1;
    } else if (order.status === 'Shipped') {
        statusText = 'कुरियरकडे रवाना (In Transit)';
        activeStepIndex = 2;
    } else if (order.status === 'Delivered') {
        statusText = 'डिलिव्हर झाली';
        activeStepIndex = 3;
    }

    document.getElementById('track-status-badge').innerText = statusText;

    // Apply Stepper Classes
    for (let i = 0; i < steps.length; i++) {
        const el = document.getElementById(`step-${steps[i]}`);
        if (i < activeStepIndex) {
            el.classList.add('completed');
        } else if (i === activeStepIndex) {
            el.classList.add('active');
        }
    }
    // If completed fully
    if(order.status === 'Delivered') {
        document.getElementById('step-delivered').className = 'step completed';
    }

    // Populate Time Labels in stepper
    const orderedLog = order.statusLogs.find(l => l.status === 'Ordered');
    const packedLog = order.statusLogs.find(l => l.status === 'Packed');
    const shippedLog = order.statusLogs.find(l => l.status === 'Shipped');
    const deliveredLog = order.statusLogs.find(l => l.status === 'Delivered');

    document.getElementById('time-ordered').innerText = orderedLog ? orderedLog.time : '';
    document.getElementById('time-packed').innerText = packedLog ? packedLog.time : 'प्रतीक्षेत...';
    document.getElementById('time-shipped').innerText = shippedLog ? shippedLog.time : 'प्रतीक्षेत...';
    document.getElementById('time-delivered').innerText = deliveredLog ? deliveredLog.time : 'प्रतीक्षेत...';

    // Populate E-Kart logs
    const logsList = document.getElementById('tracking-logs-list');
    logsList.innerHTML = '';
    
    // Generate courier log history based on current status
    const logs = [];
    if (order.statusLogs) {
        order.statusLogs.forEach(l => {
            logs.push({
                time: l.time,
                desc: l.desc
            });
        });
    }

    logs.reverse().forEach((log, index) => {
        const isActive = index === 0 ? 'active' : '';
        logsList.insertAdjacentHTML('beforeend', `
            <div class="log-item ${isActive}">
                <span>${log.desc}</span>
                <span style="font-size: 0.75rem; white-space: nowrap; margin-left: 10px;">${log.time}</span>
            </div>
        `);
    });
}

// 8. ADMIN LOGIN & AUTH
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
        navigateTo('admin-login');
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('admin-username').value;
    const pass = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error-msg');

    if (user === 'admin' && pass === 'admin123') {
        errorMsg.classList.add('hidden');
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('nav-admin').innerHTML = '<i class="fa-solid fa-gauge-high"></i> डॅशबोर्ड';
        showNotification('अ‍ॅडमिन लॉगिन यशस्वी!');
        navigateTo('admin-dashboard');
    } else {
        errorMsg.classList.remove('hidden');
    }
}

function handleAdminLogout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('nav-admin').innerHTML = '<i class="fa-solid fa-lock"></i> अ‍ॅडमिन लॉगिन';
    showNotification('यशस्वीरीत्या लॉगआउट झाले!');
    navigateTo('shop');
}

// 9. ADMIN DASHBOARD OPERATIONS
function renderAdminDashboard() {
    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');

    // Calculate stats
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => o.status !== 'Delivered').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    
    // Revenue is the sum of paid orders
    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + o.total, 0);

    // Update stats text
    document.getElementById('admin-stat-total-orders').innerText = totalOrders;
    document.getElementById('admin-stat-active-orders').innerText = activeOrders;
    document.getElementById('admin-stat-completed-orders').innerText = completedOrders;
    document.getElementById('admin-stat-total-revenue').innerText = `₹${totalRevenue}`;

    // Filter and render table
    renderAdminOrdersTable(orders);
}

function filterAdminOrders(filterType) {
    activeAdminFilter = filterType;
    
    // Highlight active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-filter-${filterType}`).classList.add('active');

    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');
    let filteredOrders = orders;

    if (filterType === 'pending') {
        filteredOrders = orders.filter(o => o.status !== 'Delivered');
    } else if (filterType === 'delivered') {
        filteredOrders = orders.filter(o => o.status === 'Delivered');
    }

    renderAdminOrdersTable(filteredOrders);
}

function renderAdminOrdersTable(ordersList) {
    const tbody = document.getElementById('admin-orders-table-body');
    const noOrdersMsg = document.getElementById('no-orders-msg');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (ordersList.length === 0) {
        noOrdersMsg.classList.remove('hidden');
        return;
    }

    noOrdersMsg.classList.add('hidden');

    // Sort: Newest orders first
    ordersList.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));

    ordersList.forEach(order => {
        // Items formatted
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `<div>${item.name} (${item.size}) x ${item.qty}</div>`;
        });

        // Location GPS link if available
        let locationLink = 'GPS: N/A';
        if (order.coordinates && order.coordinates.lat !== 'N/A') {
            const mapURL = `https://www.google.com/maps/search/?api=1&query=${order.coordinates.lat},${order.coordinates.lng}`;
            locationLink = `<a href="${mapURL}" target="_blank" class="btn-location-detect btn-sm" style="display:inline-flex; padding: 2px 8px; margin-top:5px;"><i class="fa-solid fa-map-location-dot"></i> मॅप पहा</a>`;
        }

        // Status select drop-down
        const statusOptions = [
            { val: 'Ordered', label: 'Ordered (कन्फर्म)' },
            { val: 'Packed', label: 'Packed (पॅक)' },
            { val: 'Shipped', label: 'Shipped (कुरियर)' },
            { val: 'Delivered', label: 'Delivered (पोहोचली)' }
        ];

        let selectHTML = `<select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">`;
        statusOptions.forEach(opt => {
            const isSelected = order.status === opt.val ? 'selected' : '';
            selectHTML += `<option value="${opt.val}" ${isSelected}>${opt.label}</option>`;
        });
        selectHTML += `</select>`;

        const trHTML = `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td style="font-size: 0.75rem;">${new Date(order.rawDate).toLocaleDateString('mr-IN')}</td>
                <td>
                    <strong>${order.customer.name}</strong><br>
                    <a href="tel:${order.customer.mobile}"><i class="fa-solid fa-phone"></i> ${order.customer.mobile}</a>
                    ${order.customer.altMobile !== '-' ? `<br><span style="font-size:0.75rem;color:var(--text-muted);">Alt: ${order.customer.altMobile}</span>` : ''}
                </td>
                <td style="font-size: 0.75rem;">
                    ${order.address}
                    <br>${locationLink}
                </td>
                <td class="admin-order-items">${itemsHTML}</td>
                <td><strong>₹${order.total}</strong><br><span class="badge-paid" style="font-size: 0.65rem;">${order.paymentStatus}</span></td>
                <td>${selectHTML}</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="viewOrderDetailsInAdmin('${order.id}')"><i class="fa-solid fa-eye"></i> पहा</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', trHTML);
    });
}

// Update Order Status from Admin Panel
function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex > -1) {
        orders[orderIndex].status = newStatus;
        
        // Define standard logs descriptions in Marathi
        let desc = '';
        if (newStatus === 'Packed') {
            desc = 'तुमची रवी अगरबत्ती ऑर्डर पॅक करण्यात आली आहे आणि कुरियरकडे पाठवण्यासाठी तयार आहे.';
        } else if (newStatus === 'Shipped') {
            desc = 'ऑर्डर ई-कार्ट कुरियर सर्व्हिसद्वारे शिंकावून रवाना करण्यात आली आहे. (In Transit)';
        } else if (newStatus === 'Delivered') {
            desc = 'ऑर्डर तुमच्या घरपोच सुरक्षित डिलिव्हर करण्यात आली आहे. खरेदीबद्दल धन्यवाद!';
        } else {
            desc = 'ऑर्डर पुन्हा कन्फर्म स्टेटसवर सेट केली आहे.';
        }

        // Add log
        const timeStr = new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }) + ' | ' + new Date().toLocaleDateString('mr-IN');
        orders[orderIndex].statusLogs.push({
            status: newStatus,
            time: timeStr,
            desc: desc
        });

        // Save back
        localStorage.setItem('ravi_orders', JSON.stringify(orders));
        showNotification(`ऑर्डर #${orderId} चे स्टेटस बदलून '${newStatus}' केले गेले!`);
        
        // Re-render
        renderAdminDashboard();
    }
}

// View details helper (switches back to customer view tracking for detail inspection)
function viewOrderDetailsInAdmin(orderId) {
    const orders = JSON.parse(localStorage.getItem('ravi_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if(order) {
        renderTrackingDetails(order);
        navigateTo('tracking-details');
    }
}
