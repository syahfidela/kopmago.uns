// DATA PRODUK DEFAULT KOPMA
const defaultProducts = [
    { id: '1', name: "Buku Tulis Sidu (5 Pcs)", category: "Alat Tulis", price: 18000, stock: 50, image: "https://sidu.id/documents/287278/309575/SiDU+Small+Opened+Reg.png/0733411c-2c83-d77b-10a8-959617cff9aa?t=1708678659796" },
    { id: '2', name: "Pulpen Standard AE7", category: "Alat Tulis", price: 3000, stock: 100, image: "https://image.gramedia.net/rs:fit:0:0/f:webp/plain/https://cdn.gramedia.com/uploads/items/DSC_0240.JPG" },
    { id: '3', name: "Oreo Chocolate Creme", category: "Snack & Minuman", price: 2000, stock: 20, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9kBxmcGZ4jnKPC9CqknRgQSS0aVaFBZdxx_5TXP3S762DDUfhSf4IQ2E&s=10" },
    { id: '4', name: "Ultra Milk Full Cream", category: "Snack & Minuman", price: 8000, stock: 10, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-zSKXT-q8ZYILOI1KOPIEhxLakgBVWVYqSp-qY7PHeg&s=10" },
    { id: '5', name: "UNS T-Shirt Lengan Pendek", category: "Semar Souvenir Center", price: 90000, stock: 10, image: "https://i.ibb.co.com/fY2Ts5V6/Screenshot-20261012-083933-Shopee.jpg" },
    { id: '6', name: "Sewa Proyektor (Hari)", category: "Kopma Rent", price: 55000, stock: 5, image: "https://mediaserver.goepson.com/adaptivemedia/rendition?id=fc76cca61bce0e890e56a30b67d1e9473724731c&vid=fc76cca61bce0e890e56a30b67d1e9473724731c&prid=515Wx515H&clid=SAPDAM&prclid=productpictures&assetDescr=W53_W_STD_03" },
    { id: '7', name: "Shampo Zinc", category: "Sembako & Kebutuhan Lainnya", price: 65000, stock: 15, image: "https://placehold.co/200x200/ecfdf5/059669?text=Beras" },
    { id: '8', name: "Print Dokumen HVS Warna", category: "Fotocopy & Print", price: 1500, stock: 999, image: "https://placehold.co/200x200/fff1f2/e11d48?text=Print" },
    { id: '9', name: "Ganci UNS", category: "Semar Souvenir Center", price: 10000, stock: 50, image: "https://i.ibb.co.com/tyW9sgm/Screenshot-20261012-083603-Instagram.jpg" },
];

// Inisialisasi Database Lokal (LocalStorage)
if (!localStorage.getItem('kopma_products')) {
    localStorage.setItem('kopma_products', JSON.stringify(defaultProducts));
}
if (!localStorage.getItem('kopma_orders')) {
    localStorage.setItem('kopma_orders', JSON.stringify([]));
}

// STATE APLIKASI
window.userRole = localStorage.getItem('kopma_role') || null; 
window.products = JSON.parse(localStorage.getItem('kopma_products'));
window.orders = JSON.parse(localStorage.getItem('kopma_orders'));
window.cart = [];
window.activeCategory = 'Semua';
window.searchQuery = '';

const el = {
    loading: document.getElementById('loadingOverlay'),
    authView: document.getElementById('authView'),
    catalogView: document.getElementById('catalogView'),
    adminView: document.getElementById('adminView'),
    btnAdminDashboard: document.getElementById('btnAdminDashboard'),
    btnOrderHistory: document.getElementById('btnOrderHistory'),
    btnCart: document.getElementById('btnCart'),
    btnLogout: document.getElementById('btnLogout'),
    userProfileBadge: document.getElementById('userProfileBadge'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    navSearch: document.getElementById('navSearch')
};

// SAAT APLIKASI DIMUAT
document.addEventListener("DOMContentLoaded", () => {
    // Matikan loading screen setelah 0.5 detik (animasi palsu)
    setTimeout(() => {
        el.loading.classList.add('hidden-important');
        if (window.userRole) {
            updateNavActions();
            window.navigate('home');
        } else {
            el.authView.classList.remove('hidden');
        }
    }, 500);
});

// FUNGSI AUTENTIKASI (LOGIN / LOGOUT)
window.login = (role) => {
    window.userRole = role;
    localStorage.setItem('kopma_role', role);
    
    el.authView.classList.add('hidden');
    el.loading.classList.remove('hidden-important');
    
    setTimeout(() => {
        el.loading.classList.add('hidden-important');
        updateNavActions();
        window.navigate('home');
    }, 500);
};

window.logout = () => {
    localStorage.removeItem('kopma_role');
    window.userRole = null;
    window.cart = [];
    updateCartUI();
    
    el.catalogView.classList.add('hidden');
    el.adminView.classList.add('hidden');
    el.authView.classList.remove('hidden');
    hideNavActions();
};

function hideNavActions() {
    el.btnAdminDashboard.classList.add('hidden');
    el.btnOrderHistory.classList.add('hidden');
    el.btnCart.classList.add('hidden');
    el.btnLogout.classList.add('hidden');
    el.userProfileBadge.classList.add('hidden');
    el.navSearch.classList.remove('md:flex');
    el.navSearch.classList.add('hidden');
}

function updateNavActions() {
    el.btnLogout.classList.remove('hidden');
    el.userProfileBadge.classList.remove('hidden');
    el.userNameDisplay.innerText = window.userRole === 'admin' ? 'Admin Kopma' : 'Mahasiswa';
    
    if (window.userRole === 'admin') {
        el.btnAdminDashboard.classList.remove('hidden');
        el.btnOrderHistory.classList.add('hidden');
        el.btnCart.classList.add('hidden');
        el.navSearch.classList.remove('md:flex');
        el.navSearch.classList.add('hidden');
        renderAdminProducts();
        renderAdminOrders();
    } else {
        el.btnAdminDashboard.classList.add('hidden');
        el.btnOrderHistory.classList.remove('hidden');
        el.btnCart.classList.remove('hidden');
        el.navSearch.classList.add('md:flex');
        el.navSearch.classList.remove('hidden');
        renderCatalog();
        renderBuyerOrders();
    }
}

window.navigate = (view) => {
    if (!window.userRole) return;
    if (view === 'home') {
        if (window.userRole === 'buyer') {
            el.catalogView.classList.remove('hidden');
            el.adminView.classList.add('hidden');
        } else {
            el.catalogView.classList.add('hidden');
            el.adminView.classList.remove('hidden');
        }
    } else if (view === 'admin' && window.userRole === 'admin') {
        el.catalogView.classList.add('hidden');
        el.adminView.classList.remove('hidden');
    }
};

// KATALOG PEMBELI
window.filterCategory = (cat) => {
    window.activeCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if(btn.dataset.cat === cat) {
            btn.className = 'cat-btn px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-kopma-600 text-white shadow-md shadow-kopma-500/20 whitespace-nowrap';
        } else {
            btn.className = 'cat-btn px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 whitespace-nowrap';
        }
    });
    renderCatalog();
};

window.handleSearch = () => {
    window.searchQuery = document.getElementById('searchInput').value.toLowerCase();
    renderCatalog();
};

function renderCatalog() {
    const grid = document.getElementById('productGrid');
    const empty = document.getElementById('emptyCatalog');
    
    let filtered = window.products;
    if (window.activeCategory !== 'Semua') {
        filtered = filtered.filter(p => p.category === window.activeCategory);
    }
    if (window.searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(window.searchQuery));
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    
    empty.classList.add('hidden');
    grid.innerHTML = filtered.map(p => `
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-kopma-300 transition-all flex flex-col h-full">
            <div class="aspect-square bg-slate-100 relative">
                <img src="${p.image}" class="w-full h-full object-cover">
                ${p.stock < 5 ? `<span class="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">Sisa ${p.stock}</span>` : ''}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${p.category}</span>
                <h3 class="font-bold text-sm text-slate-900 leading-tight mb-2 flex-grow">${p.name}</h3>
                <div class="flex justify-between items-end mt-2">
                    <span class="font-extrabold text-kopma-600 text-sm">Rp ${Number(p.price).toLocaleString('id-ID')}</span>
                    <button onclick="addToCart('${p.id}')" class="w-8 h-8 rounded-full bg-kopma-50 text-kopma-600 hover:bg-kopma-600 hover:text-white flex items-center justify-center transition-colors">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Menampilkan atau menyembunyikan Barcode QRIS
window.togglePaymentMethod = () => {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const qrisContainer = document.getElementById('qrisContainer');
    
    if (paymentMethod === 'QRIS') {
        qrisContainer.classList.remove('hidden');
    } else {
        qrisContainer.classList.add('hidden');
    }
};

// Pastikan memanggil toggle ini saat checkout dibuka agar status awalnya sesuai
const originalOpenCheckout = window.openCheckout;
window.openCheckout = () => {
    originalOpenCheckout();
    window.togglePaymentMethod(); 
};

// KERANJANG
window.addToCart = (id) => {
    const product = window.products.find(p => p.id === id);
    if (!product) return;
    if (product.stock <= 0) {
        showToast("Stok produk habis", "error");
        return;
    }

    const existing = window.cart.find(item => item.id === id);
    if (existing) {
        if (existing.qty < product.stock) {
            existing.qty += 1;
        } else {
            showToast("Maksimal stok tercapai", "error");
            return;
        }
    } else {
        window.cart.push({ ...product, qty: 1 });
    }
    
    updateCartUI();
    showToast("Ditambahkan ke keranjang");
};

window.updateCartQty = (id, delta) => {
    const item = window.cart.find(i => i.id === id);
    if(!item) return;
    const product = window.products.find(p => p.id === id);
    
    item.qty += delta;
    if(item.qty <= 0) {
        window.cart = window.cart.filter(i => i.id !== id);
    } else if (product && item.qty > product.stock) {
         item.qty = product.stock;
         showToast("Maksimal stok tercapai", "error");
    }
    updateCartUI();
};

function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const totalQty = window.cart.reduce((sum, item) => sum + item.qty, 0);
    
    if (totalQty > 0) {
        badge.innerText = totalQty;
        badge.classList.remove('scale-0');
    } else {
        badge.classList.add('scale-0');
    }

    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    const btnProceed = document.getElementById('btnProceedCheckout');

    if (window.cart.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-400"><i class="fa-solid fa-cart-shopping text-3xl mb-2 opacity-50"></i><p class="text-sm">Keranjang kosong</p></div>`;
        subtotalEl.innerText = 'Rp 0';
        totalEl.innerText = 'Rp 0';
        btnProceed.disabled = true;
        return;
    }

    btnProceed.disabled = false;
    let subtotal = 0;
    container.innerHTML = window.cart.map(item => {
        subtotal += item.price * item.qty;
        return `
        <div class="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-xl">
            <img src="${item.image}" class="w-14 h-14 rounded-lg object-cover">
            <div class="flex-grow">
                <h4 class="text-xs font-bold text-slate-800 line-clamp-1">${item.name}</h4>
                <div class="text-kopma-600 text-xs font-bold mt-1">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 bg-slate-100 rounded text-xs font-bold text-slate-600">-</button>
                    <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
                    <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 bg-slate-100 rounded text-xs font-bold text-slate-600">+</button>
                </div>
            </div>
        </div>
    `}).join('');

    subtotalEl.innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    totalEl.innerText = `Rp ${subtotal.toLocaleString('id-ID')} - Rp ${(subtotal + 3000).toLocaleString('id-ID')}`;
}

window.toggleCartModal = (show) => {
    const m = document.getElementById('cartModal');
    show ? m.classList.remove('hidden-important') : m.classList.add('hidden-important');
};

window.openCheckout = () => {
    toggleCartModal(false);
    document.getElementById('checkoutModal').classList.remove('hidden-important');
};
window.closeCheckout = () => {
    document.getElementById('checkoutModal').classList.add('hidden-important');
};

window.toggleDeliveryFields = () => {
    const isPickup = document.querySelector('input[name="deliveryMethod"]:checked').value === 'Pickup';
    const addressFields = document.getElementById('addressFields');
    const deliveryTimeContainer = document.getElementById('deliveryTimeContainer'); // BARU
    const coArea = document.getElementById('coArea');
    const coRoom = document.getElementById('coRoom');
    const coTime = document.getElementById('coTime'); // BARU
    
    if (isPickup) {
        addressFields.classList.add('hidden');
        deliveryTimeContainer.classList.add('hidden'); // BARU
        coArea.removeAttribute('required');
        coRoom.removeAttribute('required');
        coTime.removeAttribute('required'); // BARU
    } else {
        addressFields.classList.remove('hidden');
        deliveryTimeContainer.classList.remove('hidden'); // BARU
        coArea.setAttribute('required', 'required');
        coRoom.setAttribute('required', 'required');
        coTime.setAttribute('required', 'required'); // BARU
    }
};

// CHECKOUT KE WHATSAPP (UPDATE WA ADMIN)
window.submitOrder = (e) => {
    e.preventDefault();
    if(window.cart.length === 0) return;

    let subtotal = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
    const isPickup = deliveryMethod === 'Pickup';
    const deliveryFee = isPickup ? 0 : 3000;
    
    const area = isPickup ? 'Ambil Sendiri di Kopma' : document.getElementById('coArea').value;
    const room = isPickup ? '-' : document.getElementById('coRoom').value;

    const orderId = 'KOPMA-' + Math.floor(Math.random() * 10000);
    const orderData = {
        id: orderId,
        buyerName: document.getElementById('coName').value,
        buyerPhone: document.getElementById('coPhone').value,
        deliveryMethod: deliveryMethod,
        area: area,
        room: room,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        notes: document.getElementById('coNotes').value,
        items: window.cart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: subtotal + deliveryFee,
        status: 'Menunggu',
        timestamp: Date.now()
    };

    // Simpan pesanan ke Local Storage
    window.orders.push(orderData);
    localStorage.setItem('kopma_orders', JSON.stringify(window.orders));

    // Update Stok
    window.cart.forEach(cartItem => {
        const prod = window.products.find(p => p.id === cartItem.id);
        if (prod) prod.stock -= cartItem.qty;
    });
    localStorage.setItem('kopma_products', JSON.stringify(window.products));
    renderCatalog();

    // Buat Pesan WA
    const orderText = window.cart.map(i => `- ${i.qty}x ${i.name} (Rp ${(i.price * i.qty).toLocaleString('id-ID')})`).join('\n');
    const locationText = isPickup 
        ? '*Metode:* Ambil Sendiri (Pick-up) di Toko Kopma' 
        : `*Metode:* Diantar ke Dalam Kampus\n*Lokasi Antar:* ${orderData.area} - ${orderData.room}`;

    const waMsg = `Halo Admin Kopma, saya ada pesanan baru dengan detail berikut:\n\n*ID Pesanan:* ${orderId}\n*Nama:* ${orderData.buyerName}\n*No. WA:* ${orderData.buyerPhone}\n${locationText}\n\n*Daftar Pesanan:*\n${orderText}\n\n*Pembayaran:* ${orderData.paymentMethod}\n*Ongkir:* Rp ${orderData.deliveryFee.toLocaleString('id-ID')}\n*Total Pembayaran:* Rp ${orderData.total.toLocaleString('id-ID')}\n*Catatan:* ${orderData.notes || '-'}\n\nMohon segera diproses ya. Terima kasih!`;
    
    // Kirim WA
    const waUrl = `https://wa.me/6289652428042?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');

    showToast("Pesanan berhasil dibuat!");
    window.cart = [];
    updateCartUI();
    e.target.reset();
    closeCheckout();
    renderBuyerOrders();
    openHistoryModal();
};

// RIWAYAT PESANAN PEMBELI
window.openHistoryModal = () => {
    document.getElementById('historyModal').classList.remove('hidden-important');
    renderBuyerOrders();
};
window.closeHistoryModal = () => {
    document.getElementById('historyModal').classList.add('hidden-important');
};

function renderBuyerOrders() {
    const list = document.getElementById('buyerOrderHistoryList');
    if (!list) return;

    if (window.orders.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-400"><i class="fa-solid fa-receipt text-3xl mb-2"></i><p>Belum ada pesanan.</p></div>`;
        return;
    }

    list.innerHTML = [...window.orders].reverse().map(o => `
        <div class="border border-slate-200 rounded-2xl p-4 bg-slate-50">
            <div class="flex justify-between items-start mb-3 border-b border-slate-200 pb-3">
                <div>
                    <span class="text-[10px] font-bold text-slate-500">${new Date(o.timestamp).toLocaleString('id-ID')}</span>
                    <div class="text-sm font-bold text-slate-900 mt-1">${o.area} - ${o.room}</div>
                </div>
                ${getStatusBadge(o.status)}
            </div>
            <div class="space-y-1 mb-3">
                ${o.items.map(i => `<div class="flex justify-between text-xs text-slate-600"><span>${i.qty}x ${i.name}</span><span>Rp ${(i.price * i.qty).toLocaleString('id-ID')}</span></div>`).join('')}
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-slate-200">
                <span class="text-xs font-bold text-slate-500">${o.paymentMethod}</span>
                <span class="text-sm font-bold text-kopma-600">Total: Rp ${o.total.toLocaleString('id-ID')}</span>
            </div>
        </div>
    `).join('');
}

// DASHBOARD ADMIN
window.switchAdminTab = (tab) => {
    const tProd = document.getElementById('tabAdminProducts');
    const tOrd = document.getElementById('tabAdminOrders');
    const sProd = document.getElementById('adminProductsSection');
    const sOrd = document.getElementById('adminOrdersSection');

    if (tab === 'products') {
        tProd.className = 'px-4 py-2 rounded-lg text-sm font-semibold bg-white text-kopma-600 shadow-sm transition-all';
        tOrd.className = 'px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all';
        sProd.classList.remove('hidden');
        sOrd.classList.add('hidden');
    } else {
        tOrd.className = 'px-4 py-2 rounded-lg text-sm font-semibold bg-white text-kopma-600 shadow-sm transition-all';
        tProd.className = 'px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all';
        sOrd.classList.remove('hidden');
        sProd.classList.add('hidden');
    }
};

function renderAdminProducts() {
    const tbody = document.getElementById('adminProductsTable');
    if(!tbody) return;
    tbody.innerHTML = window.products.map(p => `
        <tr class="hover:bg-slate-50 border-b border-slate-100 last:border-0">
            <td class="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                <img src="${p.image}" class="w-10 h-10 rounded object-cover">
                <span class="line-clamp-1">${p.name}</span>
            </td>
            <td class="px-4 py-3 text-slate-500">${p.category}</td>
            <td class="px-4 py-3 text-slate-900 font-medium">Rp ${Number(p.price).toLocaleString('id-ID')}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 bg-${p.stock < 5 ? 'rose' : 'emerald'}-100 text-${p.stock < 5 ? 'rose' : 'emerald'}-700 rounded-lg text-xs font-bold">${p.stock}</span>
            </td>
            <td class="px-4 py-3 text-right">
                <button onclick="editProduct('${p.id}')" class="text-kopma-500 hover:text-kopma-700 p-2"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="text-rose-400 hover:text-rose-600 p-2"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.openProductForm = () => {
    document.getElementById('adminProductForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('productFormTitle').innerText = 'Tambah Produk';
    document.getElementById('productFormModal').classList.remove('hidden-important');
};
window.closeProductForm = () => {
    document.getElementById('productFormModal').classList.add('hidden-important');
};

window.saveProduct = (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const data = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCat').value,
        price: Number(document.getElementById('prodPrice').value),
        stock: Number(document.getElementById('prodStock').value),
        image: document.getElementById('prodImg').value || `https://placehold.co/200x200/e2e8f0/64748b?text=${encodeURIComponent(document.getElementById('prodName').value.substring(0,5))}`
    };

    if (id) {
        const index = window.products.findIndex(x => x.id === id);
        window.products[index] = { ...window.products[index], ...data };
        showToast("Produk diperbarui");
    } else {
        data.id = Date.now().toString();
        window.products.push(data);
        showToast("Produk ditambahkan");
    }
    
    localStorage.setItem('kopma_products', JSON.stringify(window.products));
    renderAdminProducts();
    closeProductForm();
};

window.editProduct = (id) => {
    const p = window.products.find(x => x.id === id);
    if(!p) return;
    document.getElementById('prodId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCat').value = p.category;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodStock').value = p.stock;
    document.getElementById('prodImg').value = p.image || '';
    document.getElementById('productFormTitle').innerText = 'Edit Produk';
    document.getElementById('productFormModal').classList.remove('hidden-important');
};

window.deleteProduct = (id) => {
    if(confirm("Yakin ingin menghapus produk ini?")) {
        window.products = window.products.filter(p => p.id !== id);
        localStorage.setItem('kopma_products', JSON.stringify(window.products));
        renderAdminProducts();
        showToast("Produk dihapus");
    }
};

function renderAdminOrders() {
    const list = document.getElementById('adminOrdersList');
    if(!list) return;
    if (window.orders.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-400">Belum ada pesanan masuk.</div>`;
        return;
    }

    list.innerHTML = [...window.orders].reverse().map(o => `
        <div class="border border-slate-200 rounded-2xl p-5 hover:border-kopma-300 transition-colors">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h4 class="font-bold text-slate-900">${o.buyerName} <span class="text-xs font-normal text-slate-500">(${o.buyerPhone})</span></h4>
                    <p class="text-xs text-slate-600 mt-1"><i class="fa-solid fa-location-dot text-rose-500 mr-1"></i>${o.area} - ${o.room}</p>
                    <p class="text-[10px] text-slate-400 mt-1">${new Date(o.timestamp).toLocaleString('id-ID')}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="text-lg font-bold text-kopma-600">Rp ${o.total.toLocaleString('id-ID')}</span>
                    <select onchange="updateOrderStatus('${o.id}', this.value)" class="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-kopma-500 cursor-pointer">
                        <option value="Menunggu" ${o.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
                        <option value="Diproses" ${o.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                        <option value="Dikirim" ${o.status === 'Dikirim' ? 'selected' : ''}>Dikirim</option>
                        <option value="Selesai" ${o.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                    </select>
                </div>
            </div>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-2 space-y-1">
                ${o.items.map(i => `<div class="flex justify-between"><span>${i.qty}x ${i.name}</span><span>Rp ${(i.price*i.qty).toLocaleString('id-ID')}</span></div>`).join('')}
            </div>
            ${o.notes ? `<div class="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg"><i class="fa-solid fa-note-sticky mr-1"></i>${o.notes}</div>` : ''}
        </div>
    `).join('');
}

window.updateOrderStatus = (orderId, newStatus) => {
    const order = window.orders.find(o => o.id === orderId);
    if(order) {
        order.status = newStatus;
        localStorage.setItem('kopma_orders', JSON.stringify(window.orders));
        showToast("Status pesanan diperbarui");
    }
};

function getStatusBadge(status) {
    const colors = {
        'Menunggu': 'bg-amber-100 text-amber-700',
        'Diproses': 'bg-blue-100 text-blue-700',
        'Dikirim': 'bg-purple-100 text-purple-700',
        'Selesai': 'bg-emerald-100 text-emerald-700'
    };
    const c = colors[status] || 'bg-slate-100 text-slate-700';
    return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${c}">${status}</span>`;
}

function showToast(msg, type = "success") {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    const icon = document.getElementById('toastIcon');
    icon.className = type === 'error' ? 'fa-solid fa-circle-exclamation text-rose-400' : 'fa-solid fa-circle-check text-emerald-400';
    
    t.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        t.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}