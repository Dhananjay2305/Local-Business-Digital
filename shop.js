const params = new URLSearchParams(window.location.search);
const shopId = params.get("shopId");
const shop = shopId ? JSON.parse(localStorage.getItem(shopId) || "null") : null;

if (!shop) {
    document.body.innerHTML = "<main class='main-content'><div class='container'><p style='text-align:center; padding:3rem;'>Shop not found. Please open this page from a valid link.</p></div></main>";
} else {

    // Set background based on business type
    if (shop && shop.business_type) {
        document.body.classList.add("business-" + shop.business_type);
    }

    document.getElementById("shopName").innerText = shop.shopName;
    document.getElementById("shopAddress").innerText = shop.address;

    if (shop.logo) {
        document.getElementById("shopLogo").src = shop.logo;
    }

    const itemsContainer = document.getElementById("itemsContainer");
    const cartBar = document.getElementById("cartBar");
    const cartCountEl = document.getElementById("cartCount");
    let cart = {};

    (shop.items || []).forEach(item => {
        cart[item.name] = 0;

        // Generate consistent pastel color based on item name
        let hash = 0;
        for (let i = 0; i < item.name.length; i++) {
            hash = item.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        const bgColor = `linear-gradient(135deg, hsl(${hue}, 70%, 96%) 0%, hsl(${hue}, 70%, 92%) 100%)`;
        const borderColor = `hsl(${hue}, 40%, 80%)`;

        const card = document.createElement("div");
        card.className = "product-card";
        card.style.background = bgColor;
        card.style.borderColor = borderColor;

        const stockText = typeof item.stock !== "undefined" ? `<p class="product-stock">In stock: ${item.stock}</p>` : "";

        card.innerHTML = `
        <h3 class="product-name">${escapeHtml(item.name)}</h3>
        <p class="product-price">₹${escapeHtml(item.price)}</p>
        ${stockText}
        <div class="qty-controls">
            <button type="button" class="qty-btn" data-action="decrease" data-item="${escapeAttr(item.name)}" aria-label="Decrease quantity">−</button>
            <span class="qty-display" id="qty-${escapeAttr(item.name)}">0</span>
            <button type="button" class="qty-btn" data-action="increase" data-item="${escapeAttr(item.name)}" aria-label="Increase quantity">+</button>
        </div>
    `;

        itemsContainer.appendChild(card);
    });

    // Event delegation for quantity buttons
    itemsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;
        const action = btn.dataset.action;
        const itemName = btn.dataset.item;
        if (!itemName) return;
        updateQty(itemName, action === "increase" ? 1 : -1);
    });

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function updateQty(name, change) {
        const item = shop.items.find(i => i.name === name);
        const maxStock = item && typeof item.stock !== "undefined" ? parseInt(item.stock, 10) : null;

        let newQty = (cart[name] || 0) + change;
        if (newQty < 0) newQty = 0;
        if (maxStock !== null && !isNaN(maxStock) && newQty > maxStock) {
            newQty = maxStock;
        }

        cart[name] = newQty;
        const displayEl = document.getElementById("qty-" + escapeAttr(name));
        if (displayEl) displayEl.textContent = cart[name];

        updateCartUI();
    }

    function getTotalItems() {
        return Object.values(cart).reduce((sum, n) => sum + n, 0);
    }

    function updateCartUI() {
        const totalItems = getTotalItems();
        const totalPrice = getTotalPrice();
        const msg = buildWhatsAppMessage();

        const whatsappUrl = `https://wa.me/91${shop.phone}?text=${encodeURIComponent(msg)}`;

        document.getElementById("whatsappBtn").href = whatsappUrl;
        document.getElementById("cartWhatsAppBtn").href = whatsappUrl;
        document.getElementById("modalWhatsAppBtn").href = whatsappUrl;

        if (totalItems > 0) {
            cartBar.classList.remove("hidden");
            cartCountEl.textContent = totalItems === 1 ? "1 item" : `${totalItems} items`;

            const totalEl = document.getElementById("cartTotal");
            if (totalEl) totalEl.textContent = `₹${totalPrice}`;
        } else {
            cartBar.classList.add("hidden");
        }
    }

    function getTotalPrice() {
        return Object.keys(cart).reduce((sum, itemName) => {
            const count = cart[itemName];
            const item = shop.items.find(i => i.name === itemName);
            const price = item ? parseInt(item.price, 10) : 0;
            return sum + (price * count);
        }, 0);
    }

    function buildWhatsAppMessage() {
        let msg = `Hi, I want to order from ${shop.shopName}:\n\n`;
        let total = 0;
        for (const itemName in cart) {
            if (cart[itemName] > 0) {
                const item = shop.items.find(i => i.name === itemName);
                const price = item ? parseInt(item.price, 10) : 0;
                const itemTotal = price * cart[itemName];
                total += itemTotal;
                msg += `• ${itemName} x ${cart[itemName]} = ₹${itemTotal}\n`;
            }
        }
        msg += `\nTotal: ₹${total}`;
        return msg;
    }

    // Modal Logic
    const cartModal = document.getElementById("cartModal");
    const viewCartBtn = document.getElementById("viewCartBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cartItemsList = document.getElementById("cartItemsList");
    const modalTotal = document.getElementById("modalTotal");

    if (viewCartBtn) {
        viewCartBtn.addEventListener("click", () => {
            renderCartItems();
            cartModal.classList.remove("hidden");
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            cartModal.classList.add("hidden");
        });
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === cartModal) {
            cartModal.classList.add("hidden");
        }
    });

    function renderCartItems() {
        cartItemsList.innerHTML = "";
        let total = 0;

        for (const itemName in cart) {
            if (cart[itemName] > 0) {
                const item = shop.items.find(i => i.name === itemName);
                const price = item ? parseInt(item.price, 10) : 0;
                const itemTotal = price * cart[itemName];
                total += itemTotal;

                const li = document.createElement("li");
                li.className = "cart-item-row";
                li.innerHTML = `
                    <span class="cart-item-name">${escapeHtml(itemName)}</span>
                    <div class="cart-item-details">
                        ${cart[itemName]} x ₹${price} = <strong>₹${itemTotal}</strong>
                    </div>
                `;
                cartItemsList.appendChild(li);
            }
        }

        modalTotal.textContent = `₹${total}`;
    }

    updateCartUI();
} // end if (shop)
