// --- СТАН ДОДАТКУ (ГЛОБАЛЬНІ ЗМІННІ) ---
let cart = [];
let currentRestaurantId = null;
let currentRestaurantName = "";
let isMobileCartOpen = false;

// --- ТЕСТОВІ ДАНІ (БАЗА ДАНИХ MVP) ---
const restaurants = [
  {
    id: 1,
    name: "Піцерія Bella Italia",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    desc: "Справжня італійська піца на дровах",
  },
  {
    id: 2,
    name: "Burger Club",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    desc: "Соковиті бургери та картопля фрі",
  },
];

const dishes = {
  1: [
    {
      id: "p1",
      name: "Піца Капрічоза",
      price: 190,
      desc: "Томати, моцарела, шинка, гриби",
      img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
    },
    {
      id: "p2",
      name: "Піца Маргарита",
      price: 150,
      desc: "Класична піца з томатами та сиром",
      img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200",
    },
  ],
  2: [
    {
      id: "b1",
      name: "Бургер Класичний",
      price: 140,
      desc: "Яловича котлета, сир чеддер, соус",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
    },
    {
      id: "b2",
      name: "Картопля Фрі",
      price: 60,
      desc: "Хрустка картопля з сіллю",
      img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200",
    },
  ],
};

// --- РОЗДІЛЕННЯ ЗАПУСКУ ЗАЛЕЖНО ВІД СТОРІНКИ ---
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("index.html") || path.endsWith("/")) {
    // Запуск логіки для Головної сторінки
    checkUserAuth();
  } else if (path.includes("catalog.html")) {
    // Запуск логіки відновлення стану для Каталогу
    restorePageState();
  } else if (path.includes("admin.html")) {
    // Запуск логіки для Адмінки
    initAdminPanel();
  }
});

// --- СИСТЕМА ЗБЕРЕЖЕННЯ ТА ВІДНОВЛЕННЯ СТАНУ (F5 PROTECT) ---

function savePageState() {
  sessionStorage.setItem("cart", JSON.stringify(cart));
  sessionStorage.setItem("currentRestaurantId", currentRestaurantId);
  sessionStorage.setItem("currentRestaurantName", currentRestaurantName);
  sessionStorage.setItem("isMobileCartOpen", isMobileCartOpen);
}

function restorePageState() {
  const address = localStorage.getItem("userAddress");
  if (!address) {
    window.location.href = "index.html";
    return;
  }

  if (document.getElementById("display-address")) {
    document.getElementById("display-address").innerText = address;
  }

  // Зчитуємо кошик з пам'яті
  const savedCart = sessionStorage.getItem("cart");
  if (savedCart && savedCart !== "undefined") {
    cart = JSON.parse(savedCart);
  }

  // Зчитуємо обраний ресторан
  const savedRestId = sessionStorage.getItem("currentRestaurantId");

  if (savedRestId && savedRestId !== "null" && savedRestId !== "undefined") {
    currentRestaurantId = Number(savedRestId);
    currentRestaurantName =
      sessionStorage.getItem("currentRestaurantName") || "";
    isMobileCartOpen = sessionStorage.getItem("isMobileCartOpen") === "true";

    // Завантажуємо сторінку страв (передаємо false, щоб кошик НЕ очищався!)
    loadRestaurantMenu(currentRestaurantId, currentRestaurantName, false);
  } else {
    // Якщо ресторану в пам'яті немає — показуємо звичайну сітку закладів
    initCatalog();
  }
}

function goBackToWelcome() {
  localStorage.removeItem("userAddress");
  sessionStorage.clear();
  window.location.href = "index.html";
}

// --- ЛОГІКА СТОРІНКИ ПРИВІТАННЯ (index.html) ---

function saveAddressAndGo() {
  const addressInput = document.getElementById("user-address").value;
  if (!addressInput.trim()) {
    alert("Будь ласка, введіть адресу!");
    return;
  }
  localStorage.setItem("userAddress", addressInput);
  sessionStorage.removeItem("currentRestaurantId"); // Чистимо старий бренд для нової адреси
  window.location.href = "catalog.html";
}

function selectSavedAddress(address) {
  const input = document.getElementById("user-address");
  if (input) input.value = address;
  saveAddressAndGo();
}

// --- АВТОРИЗАЦІЯ ТА ПРОФІЛЬ КОРИСТУВАЧА ---

function simulateLogin() {
  const userMock = {
    name: "Олександр",
    token: "jwt-secret-token-xyz",
    savedAddresses: ["вул. Соборності, 10", "вул. Котляревського, 4"],
  };
  localStorage.setItem("user", JSON.stringify(userMock));
  window.location.reload();
}

function simulateLogout() {
  localStorage.removeItem("user");
  localStorage.removeItem("userAddress");
  sessionStorage.clear();
  window.location.reload();
}

function checkUserAuth() {
  const authHeader = document.getElementById("auth-header");
  const welcomeTitle = document.getElementById("welcome-title");
  const savedAddressesBlock = document.getElementById("saved-addresses-block");

  if (!authHeader || !welcomeTitle) return;

  const userJson = localStorage.getItem("user");

  if (userJson) {
    const user = JSON.parse(userJson);
    welcomeTitle.innerText = `🍕 Вітаємо, ${user.name}!`;
    authHeader.innerHTML = `
            <span style="color: white; margin-right: 15px; font-weight: bold;">👤 ${user.name}</span>
            <button onclick="simulateLogout()" style="padding: 5px 10px; border-radius: 5px; cursor: pointer;">Вийти</button>
        `;

    if (
      user.savedAddresses &&
      user.savedAddresses.length > 0 &&
      savedAddressesBlock
    ) {
      savedAddressesBlock.classList.remove("hidden");
      const container = document.getElementById("addresses-buttons-container");
      if (container) {
        let buttonsHtml = "";
        user.savedAddresses.forEach((addr) => {
          buttonsHtml += `
                        <button onclick="selectSavedAddress('${addr}')" style="background: #edf2f7; border: 1px solid #cbd5e0; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: 0.2s;">
                            📍 ${addr}
                        </button>
                    `;
        });
        container.innerHTML = buttonsHtml;
      }
    }
  } else {
    authHeader.innerHTML = `
            <button onclick="simulateLogin()" style="background: #ff5722; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer;">
                Увійти (Демо)
            </button>
        `;
    if (savedAddressesBlock) savedAddressesBlock.classList.add("hidden");
  }
}

// --- ЛОГІКА КАТАЛОГУ ТА МЕНЮ СТРАВ (catalog.html) ---

function initCatalog() {
  currentRestaurantId = null;
  currentRestaurantName = "";
  isMobileCartOpen = false;
  savePageState();

  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  if (document.getElementById("cart-sidebar"))
    document.getElementById("cart-sidebar").classList.add("hidden");
  if (document.getElementById("mobile-cart-bar"))
    document.getElementById("mobile-cart-bar").classList.add("hidden");

  let html = `<h1>Оберіть заклад у Полтаві</h1><div class="restaurant-grid">`;
  restaurants.forEach((res) => {
    html += `
            <div class="restaurant-card" onclick="loadRestaurantMenu(${res.id}, '${res.name}', true)">
                <img src="${res.img}" alt="${res.name}">
                <h3>${res.name}</h3>
                <p>${res.desc}</p>
            </div>
        `;
  });
  html += `</div>`;
  mainContent.innerHTML = html;
}

function loadRestaurantMenu(
  restaurantId,
  restaurantName,
  shouldResetCart = false,
) {
  currentRestaurantId = restaurantId;
  currentRestaurantName = restaurantName;

  if (shouldResetCart) {
    cart = []; // Очищаємо кошик ТІЛЬКИ якщо перейшли на новий ресторан з каталогу вручну
  }
  savePageState();

  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  if (document.getElementById("cart-sidebar"))
    document.getElementById("cart-sidebar").classList.remove("hidden");

  let html = `
        <button onclick="initCatalog()" class="btn-back">⬅ Назад до закладів</button>
        <h1>${restaurantName}</h1>
        <div class="dishes-list">
    `;

  const menuItems = dishes[restaurantId] || [];
  menuItems.forEach((dish) => {
    html += `
            <div class="dish-item-card">
                <img src="${dish.img}" alt="${dish.name}">
                <div class="dish-info">
                    <h3>${dish.name}</h3>
                    <p>${dish.desc}</p>
                    <strong>${dish.price} грн</strong>
                </div>
                <button onclick="addToCart('${dish.id}', '${dish.name}', ${dish.price}, '${dish.img}')">Додати</button>
            </div>
        `;
  });
  html += `</div>`;
  mainContent.innerHTML = html;

  updateCartUI();

  // Якщо на мобільному кошик мав бути відкритим — відновлюємо його розгорнутий стан
  if (isMobileCartOpen && window.innerWidth <= 900) {
    toggleMobileCart(true);
  }
}

// --- КЕРУВАННЯ КОШИКОМ ---

function addToCart(id, name, price, img) {
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }
  updateCartUI();
}

function changeQuantity(id, delta) {
  const item = cart.find((item) => item.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((item) => item.id !== id);
  }
  updateCartUI();
}

function updateCartUI() {
  savePageState();

  const cartItemsDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("total-amount");
  const mobileBar = document.getElementById("mobile-cart-bar");
  const mobileCountSpan = document.getElementById("mobile-cart-count");
  const mobileTotalSpan = document.getElementById("mobile-cart-total");

  if (!cartItemsDiv) return;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="empty-cart">Кошик порожній</p>';
    if (totalSpan) totalSpan.innerText = "0";

    if (mobileBar) mobileBar.classList.add("hidden");
    if (window.innerWidth <= 900 && document.getElementById("cart-sidebar")) {
      document.getElementById("cart-sidebar").classList.add("hidden");
      isMobileCartOpen = false;
      savePageState();
    }
    return;
  }

  let html = '<div class="cart-items-list">';
  let totalAmount = 0;
  let totalItemsCount = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    totalItemsCount += item.quantity;

    html += `
            <div class="cart-item-row">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price} грн</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="changeQuantity('${item.id}', -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        `;
  });
  html += "</div>";

  cartItemsDiv.innerHTML = html;
  if (totalSpan) totalSpan.innerText = totalAmount;

  // Керування мобільними плашками
  if (window.innerWidth <= 900 && !isMobileCartOpen && mobileBar) {
    mobileBar.classList.remove("hidden");
  }
  if (mobileCountSpan) mobileCountSpan.innerText = totalItemsCount;
  if (mobileTotalSpan) mobileTotalSpan.innerText = totalAmount + " грн";
}

function toggleMobileCart(open) {
  isMobileCartOpen = open;
  savePageState();

  const cartSidebar = document.getElementById("cart-sidebar");
  const mobileBar = document.getElementById("mobile-cart-bar");

  if (!cartSidebar) return;

  if (open) {
    cartSidebar.classList.remove("hidden");
    if (mobileBar) mobileBar.classList.add("hidden");
  } else {
    cartSidebar.classList.add("hidden");
    if (cart.length > 0 && mobileBar) {
      mobileBar.classList.remove("hidden");
    }
  }
}

function submitOrder(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const orderData = {
    clientName: document.getElementById("client-name").value,
    clientPhone: document.getElementById("client-phone").value,
    address: localStorage.getItem("userAddress"),
    items: cart,
    total: document.getElementById("total-amount").innerText,
  };

  console.log("Дані замовлення відправлено:", orderData);
  alert(
    `Дякуємо, ${orderData.clientName}! Замовлення оформлено на суму ${orderData.total} грн.`,
  );

  cart = [];
  isMobileCartOpen = false;
  initCatalog();
}

// --- ЛОГІКА ПАНЕЛІ АДМІНІСТРАТОРА (admin.html) ---
let mockOrders = [
  {
    id: 101,
    name: "Олексій",
    phone: "+380501112233",
    address: "м. Полтава, вул. Небесної Сотні, 15",
    items: "Піца Капрічоза (1)",
    total: 190,
    status: "Прийнято",
  },
  {
    id: 102,
    name: "Марія",
    phone: "+380669998877",
    address: "м. Полтава, вул. Котляревського, 4",
    items: "Бургер Класичний (2), Картопля Фрі (1)",
    total: 340,
    status: "Готується",
  },
];

function initAdminPanel() {
  const tableBody = document.getElementById("admin-orders-table");
  if (!tableBody) return;

  let html = "";
  mockOrders.forEach((order) => {
    let statusClass = "";
    if (order.status === "Прийнято") statusClass = "status-placed";
    if (order.status === "Готується") statusClass = "status-cooking";
    if (order.status === "Доставлено") statusClass = "status-done";

    html += `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${order.name}</td>
                <td>${order.phone}</td>
                <td>${order.address}</td>
                <td>${order.items}</td>
                <td><strong>${order.total} грн</strong></td>
                <td>
                    <select onchange="changeOrderStatus(${order.id}, this.value)" class="status-select ${statusClass}">
                        <option value="Прийнято" ${order.status === "Прийнято" ? "selected" : ""}>New: Прийнято</option>
                        <option value="Готується" ${order.status === "Готується" ? "selected" : ""}>In Process: Готується</option>
                        <option value="Доставлено" ${order.status === "Доставлено" ? "selected" : ""}>Done: Доставлено</option>
                    </select>
                </td>
            </tr>
        `;
  });
  tableBody.innerHTML = html;
}

function changeOrderStatus(orderId, newStatus) {
  const order = mockOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    initAdminPanel();
  }
}
