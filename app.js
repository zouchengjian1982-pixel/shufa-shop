const products = [
    { id: 1, name: '狼毫毛笔套装', price: 168, category: 'brush', icon: '🖌️', desc: '精选狼毫，弹性好' },
    { id: 2, name: '兼毫书法笔', price: 88, category: 'brush', icon: '🖌️', desc: '软硬适中，初学首选' },
    { id: 3, name: '羊毫大楷笔', price: 128, category: 'brush', icon: '🖌️', desc: '纯羊毫，书写流畅' },
    { id: 4, name: '紫毫小楷笔', price: 98, category: 'brush', icon: '🖌️', desc: '笔锋细腻，适合小楷' },
    { id: 5, name: '一得阁墨汁500ml', price: 45, category: 'ink', icon: '🖤', desc: '浓黑发亮，书画通用' },
    { id: 6, name: '曹素功墨汁250ml', price: 35, category: 'ink', icon: '🖤', desc: '传统配方，墨色纯正' },
    { id: 7, name: '红星宣纸100张', price: 158, category: 'paper', icon: '📜', desc: '生宣，吸墨性好' },
    { id: 8, name: '半生熟宣纸50张', price: 68, category: 'paper', icon: '📜', desc: '初学练习推荐' },
    { id: 9, name: '毛边纸500张', price: 28, category: 'paper', icon: '📜', desc: '日常练习专用' },
    { id: 10, name: '端砚原石砚台', price: 298, category: 'inkstone', icon: '🪨', desc: '肇庆端砚，收藏级' },
    { id: 11, name: '学生砚台', price: 58, category: 'inkstone', icon: '🪨', desc: '实用型，适合练习' },
    { id: 12, name: '文房四宝套装', price: 388, category: 'all', icon: '🎁', desc: '笔墨纸砚齐全，送礼佳品' }
];

let cart = JSON.parse(localStorage.getItem('shuhua_cart')) || [];
let orderInfo = {};

document.addEventListener('DOMContentLoaded', function() {
    renderProducts('all');
    updateCartCount();
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.category);
        });
    });
});

function renderProducts(category) {
    const list = document.getElementById('productList');
    const filtered = category === 'all' ? products : products.filter(p => p.category === category || p.category === 'all');
    list.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-image">${p.icon}</div>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.desc}</div>
                <div class="product-bottom">
                    <span class="product-price">¥${p.price}</span>
                    <button class="add-btn" onclick="addToCart(${p.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) { existing.quantity++; } 
    else { cart.push({ ...product, quantity: 1 }); }
    saveCart();
    updateCartCount();
    showToast('已加入购物车');
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCart() { localStorage.setItem('shuhua_cart', JSON.stringify(cart)); }

function showCart() {
    renderCart();
    document.getElementById('cartModal').classList.add('show');
}

function hideCart() { document.getElementById('cartModal').classList.remove('show'); }

function renderCart() {
    const list = document.getElementById('cartList');
    if (cart.length === 0) {
        list.innerHTML = '<div class="empty-cart"><div style="font-size:60px">🛒</div><p>购物车是空的</p></div>';
        document.getElementById('totalPrice').textContent = '¥0';
        return;
    }
    list.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-icon">${item.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">¥${item.price}</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
    document.getElementById('totalPrice').textContent = '¥' + cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) { cart = cart.filter(i => i.id !== id); }
        saveCart();
        updateCartCount();
        renderCart();
    }
}

function checkout() {
    if (cart.length === 0) { showToast('购物车是空的'); return; }
    hideCart();
    document.getElementById('addressModal').classList.add('show');
}

function hideAddressModal() { document.getElementById('addressModal').classList.remove('show'); }

function submitAddress() {
    const name = document.getElementById('receiverName').value.trim();
    const phone = document.getElementById('receiverPhone').value.trim();
    const address = document.getElementById('receiverAddress').value.trim();
    const remark = document.getElementById('orderRemark').value.trim();
    if (!name) { showToast('请输入收件人姓名'); return; }
    if (!phone) { showToast('请输入联系电话'); return; }
    if (!address) { showToast('请输入收货地址'); return; }
    orderInfo = { name, phone, address, remark };
    document.getElementById('payAmount').textContent = '¥' + cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    hideAddressModal();
    document.getElementById('payModal').classList.add('show');
}

function hidePayModal() { document.getElementById('payModal').classList.remove('show'); }

function copyWechat() {
    const wechat = document.getElementById('sellerWechat').textContent;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(wechat).then(() => showToast('已复制微信号'));
    } else {
        const input = document.createElement('input');
        input.value = wechat;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('已复制微信号');
    }
}

function confirmPay() {
    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        receiver: orderInfo,
        status: 'paid',
        time: new Date().toLocaleString()
    };
    let orders = JSON.parse(localStorage.getItem('shuhua_orders')) || [];
    orders.unshift(order);
    localStorage.setItem('shuhua_orders', JSON.stringify(orders));
    showToast('订单已提交，请等待卖家确认');
    cart = [];
    saveCart();
    updateCartCount();
    hidePayModal();
    document.getElementById('receiverName').value = '';
    document.getElementById('receiverPhone').value = '';
    document.getElementById('receiverAddress').value = '';
    document.getElementById('orderRemark').value = '';
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;z-index:999;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}
