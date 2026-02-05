
const shopId = localStorage.getItem("currentShopId");
const shop = shopId ? JSON.parse(localStorage.getItem(shopId)) : null;

// If someone opens this page without a shop created, show a simple warning.
if (!shop) {
    alert("No shop found. Please go back to the main website and submit your shop details first.");
}

// Set background image based on business type (kirana → kirana picture, salon → salon picture, etc.)
if (shop && shop.business_type) {
    document.body.classList.add("business-" + shop.business_type);
}

// Prefill shop name input if available
const shopNameInput = document.getElementById("shopNameInput");
if (shop && shopNameInput && shop.shopName) {
    shopNameInput.value = shop.shopName;
}

// Items list element for showing all added items
const itemsList = document.getElementById("itemsList");

function renderItems() {
    if (!itemsList || !shop) return;

    itemsList.innerHTML = "";

    if (!shop.items || shop.items.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No items added yet.";
        itemsList.appendChild(li);
        return;
    }

    shop.items.forEach((item, index) => {
        const li = document.createElement("li");
        const stockText = item.stock ? ` (Stock: ${item.stock})` : "";
        li.textContent = `${index + 1}. ${item.name} - ₹${item.price}${stockText}`;
        itemsList.appendChild(li);
    });

    const countEl = document.getElementById("itemsCount");
    if (countEl) {
        countEl.textContent = `(${shop.items.length})`;
    }
}

function saveShopName() {
    if (!shop || !shopNameInput) return;

    const newName = shopNameInput.value.trim();
    if (!newName) {
        alert("Please enter a shop name");
        return;
    }

    shop.shopName = newName;
    localStorage.setItem(shopId, JSON.stringify(shop));
    alert("Shop name saved");
}

function addItem() {
    if (!shop) return;

    const name = itemName.value.trim();
    const price = itemPrice.value.trim();
    const stockValue = (typeof itemStock !== "undefined" && itemStock) ? itemStock.value.trim() : "";

    if (!name || !price) {
        alert("Please enter item name and price");
        return;
    }

    const item = { name, price };

    // Optional stock/quantity
    const stockNumber = stockValue ? parseInt(stockValue, 10) : null;
    if (!isNaN(stockNumber) && stockNumber !== null) {
        item.stock = stockNumber;
    }

    shop.items.push(item);
    localStorage.setItem(shopId, JSON.stringify(shop));

    itemName.value = "";
    itemPrice.value = "";
    if (typeof itemStock !== "undefined" && itemStock) {
        itemStock.value = "";
    }

    alert("Item added");
    renderItems();
}

function saveLogo() {
    if (!shop) return;

    const file = logoInput.files[0];
    if (!file) {
        alert("Please select a logo image");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        shop.logo = reader.result;
        localStorage.setItem(shopId, JSON.stringify(shop));
        alert("Logo saved");
    };
    reader.readAsDataURL(file);
}

function openShop() {
    if (!shopId) return;
    window.location.href = `shop.html?shopId=${shopId}`;
}

// Initial render of items when page loads
renderItems();
