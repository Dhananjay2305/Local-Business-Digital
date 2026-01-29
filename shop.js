
const params = new URLSearchParams(window.location.search);
const shopId = params.get("shopId");
const shop = JSON.parse(localStorage.getItem(shopId));

document.getElementById("shopName").innerText = shop.shopName;
document.getElementById("shopAddress").innerText = shop.address;

if (shop.logo) {
    document.getElementById("shopLogo").src = shop.logo;
}

const itemsContainer = document.getElementById("itemsContainer");
let cart = {};

shop.items.forEach(item => {
    cart[item.name] = 0;

    const div = document.createElement("div");
    div.className = "item-card";

    const stockText = typeof item.stock !== "undefined" ? `<p>Available: ${item.stock}</p>` : "";

    div.innerHTML = `
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        ${stockText}
        <button onclick="updateQty('${item.name}', -1)">-</button>
        <span id="${item.name}">0</span>
        <button onclick="updateQty('${item.name}', 1)">+</button>
    `;

    itemsContainer.appendChild(div);
});

function updateQty(name, change) {
    const item = shop.items.find(i => i.name === name);
    const maxStock = item && typeof item.stock !== "undefined" ? parseInt(item.stock, 10) : null;

    let newQty = (cart[name] || 0) + change;
    if (newQty < 0) newQty = 0;
    if (maxStock !== null && !isNaN(maxStock) && newQty > maxStock) {
        newQty = maxStock;
    }

    cart[name] = newQty;
    document.getElementById(name).innerText = cart[name];
    updateWhatsApp();
}

function updateWhatsApp() {
    let msg = `Hi, I want to order from ${shop.shopName}:\n`;
    for (let item in cart) {
        if (cart[item] > 0) {
            msg += `${item} x ${cart[item]}\n`;
        }
    }
    document.getElementById("whatsappBtn").href =
        `https://wa.me/91${shop.phone}?text=${encodeURIComponent(msg)}`;
}
