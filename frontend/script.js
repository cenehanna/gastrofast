// --- СТАН ДОДАТКУ (ГЛОБАЛЬНІ ЗМІННІ) ---
let cart = [];
let currentRestaurantId = null;
let currentRestaurantName = "";
let isMobileCartOpen = false; // Додаємо назад цей прапорець

// --- РОЗДІЛЕННЯ ЗАПУСКУ ЗАЛЕЖНО ВІД СТОРІНКИ ---
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  renderAuthHeader();

  if (path.includes("index.html") || path.endsWith("/")) {
    renderAuthHeader();
  } else if (path.includes("catalog.html")) {
    restorePageState();
    configureOrderForm();
  } else if (path.includes("login.html") || path.includes("register.html")) {
    redirectIfAuthenticatedForAuthPages();
  } else if (path.includes("admin.html")) {
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

  const savedCart = sessionStorage.getItem("cart");
  if (savedCart && savedCart !== "undefined") {
    cart = JSON.parse(savedCart);
  }

  const savedRestId = sessionStorage.getItem("currentRestaurantId");

  if (savedRestId && savedRestId !== "null" && savedRestId !== "undefined") {
    currentRestaurantId = Number(savedRestId);
    currentRestaurantName =
      sessionStorage.getItem("currentRestaurantName") || "";
    isMobileCartOpen = sessionStorage.getItem("isMobileCartOpen") === "true"; // Відновлюємо прапорець

    loadRestaurantMenuFromAPI(
      currentRestaurantId,
      currentRestaurantName,
      false,
    );
  } else {
    fetchRestaurants();
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
  sessionStorage.removeItem("currentRestaurantId");
  window.location.href = "catalog.html";
}

function selectSavedAddress(address) {
  const input = document.getElementById("user-address");
  if (input) input.value = address;
  saveAddressAndGo();
}

// --- АУТЕНТИФІКАЦІЯ ТА ПРОФІЛЬ КОРИСТУВАЧА ---
function getAuthUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

function getAuthToken() {
  return localStorage.getItem("token");
}

function isAuthenticated() {
  return !!getAuthToken();
}

function renderAuthHeader() {
  const authHeader = document.getElementById("auth-header");
  const savedAddressesBlock = document.getElementById("saved-addresses-block");
  const welcomeTitle = document.getElementById("welcome-title");

  if (!authHeader) return;

  const user = getAuthUser();

  if (user) {
    authHeader.innerHTML = `
      <span style="color: white; margin-right: 15px; font-weight: bold;">👤 ${user.name}</span>
      <button onclick="logout()" style="background: #ff5722; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer;">
        Вийти
      </button>
    `;

    if (welcomeTitle) welcomeTitle.innerText = `🍕 Вітаємо, ${user.name}!`;

    if (user.savedAddresses && user.savedAddresses.length > 0 && savedAddressesBlock) {
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
    } else if (savedAddressesBlock) {
      savedAddressesBlock.classList.add("hidden");
    }
  } else {
    authHeader.innerHTML = `
      <button onclick="window.location.href='login.html'" style="background: #ff5722; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; margin-right: 10px;">
          Увійти
      </button>
      <button onclick="window.location.href='register.html'" style="background: white; color: #ff5722; border: 1px solid #ff5722; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer;">
          Реєстрація
      </button>
    `;
    if (savedAddressesBlock) savedAddressesBlock.classList.add("hidden");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();
  if (window.location.pathname.includes("catalog.html")) {
    window.location.href = "index.html";
  } else {
    renderAuthHeader();
  }
}

function configureOrderForm() {
  const user = getAuthUser();
  const fieldsWrapper = document.getElementById("order-user-fields");
  const noteElement = document.getElementById("order-user-note");
  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");

  if (!fieldsWrapper || !noteElement || !nameInput || !phoneInput) return;

  if (user) {
    fieldsWrapper.style.display = "none";
    nameInput.disabled = true;
    phoneInput.disabled = true;

    noteElement.style.display = "block";
    noteElement.innerText = `Ім'я: ${user.name}, Телефон: ${user.phone}. Ці дані будуть використані для оформлення замовлення.`;
  } else {
    fieldsWrapper.style.display = "block";
    nameInput.disabled = false;
    phoneInput.disabled = false;

    noteElement.style.display = "none";
    noteElement.innerText = "";
  }
}

async function loginUser(event) {
  event.preventDefault();
  const errorElement = document.getElementById("login-error");
  if (errorElement) errorElement.innerText = "";

  const email = document.getElementById("login-email")?.value || "";
  const password = document.getElementById("login-password")?.value || "";

  if (!email.trim() || !password.trim()) {
    if (errorElement) errorElement.innerText = "Будь ласка, введіть email та пароль.";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Неправильний email або пароль");
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "catalog.html";
  } catch (error) {
    if (errorElement) errorElement.innerText = error.message || "Помилка під час входу";
  }
}

async function registerUser(event) {
  event.preventDefault();
  const errorElement = document.getElementById("register-error");
  const successElement = document.getElementById("register-success");
  if (errorElement) errorElement.innerText = "";
  if (successElement) successElement.innerText = "";

  const name = document.getElementById("register-name")?.value || "";
  const email = document.getElementById("register-email")?.value || "";
  const phone = document.getElementById("register-phone")?.value || "";
  const password = document.getElementById("register-password")?.value || "";

  if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
    if (errorElement) errorElement.innerText = "Усі поля є обов'язковими для заповнення.";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Помилка під час реєстрації");
    }

    if (successElement) {
      successElement.innerText = "Реєстрація пройшла успішно. Тепер можете увійти.";
    }
  } catch (error) {
    if (errorElement) errorElement.innerText = error.message || "Помилка під час реєстрації";
  }
}

function redirectIfAuthenticatedForAuthPages() {
  if (isAuthenticated()) {
    window.location.href = "catalog.html";
  }
}

// --- ЛОГІКА КАТАЛОГУ ТА МЕНЮ СТРАВ (catalog.html) ---
async function fetchRestaurants() {
  try {
    const response = await fetch("http://localhost:3000/restaurants");
    if (!response.ok) {
      throw new Error("Помилка завантаження даних із сервера");
    }
    const restaurants = await response.json();
    renderRestaurants(restaurants);
  } catch (error) {
    console.error("Не вдалося завантажити ресторани:", error);
  }
}

function renderRestaurants(restaurantsList) {
  currentRestaurantId = null;
  currentRestaurantName = "";
  savePageState();

  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const cartSidebar = document.getElementById("cart-sidebar");
  if (cartSidebar) cartSidebar.classList.add("hidden");

  let html = `<h1>Оберіть заклад у Полтаві</h1><div class="restaurant-grid">`;

  restaurantsList.forEach((res) => {
    html += `
      <div class="restaurant-card" onclick="loadRestaurantMenuFromAPI(${res.id}, '${res.name}')">
          <img src="${res.image}" alt="${res.name}">
          <h3>${res.name}</h3>
          <p>${res.description}</p>
      </div>
    `;
  });
  html += `</div>`;
  mainContent.innerHTML = html;
}

function initCatalog() {
  fetchRestaurants();
}

async function loadRestaurantMenuFromAPI(
  restaurantId,
  restaurantName,
  shouldResetCart = true,
) {
  currentRestaurantId = restaurantId;
  currentRestaurantName = restaurantName;

  if (shouldResetCart) {
    cart = [];
  }
  savePageState();

  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const cartSidebar = document.getElementById("cart-sidebar");
  if (cartSidebar) cartSidebar.classList.remove("hidden");

  try {
    const response = await fetch(
      `http://localhost:3000/restaurants/${restaurantId}`,
    );
    const restaurant = await response.json();

    let html = `
      <button onclick="initCatalog()" class="btn-back">⬅ Назад до закладів</button>
      <h1>${restaurant.name}</h1>
      <div class="dishes-list">
    `;

    const menuItems = restaurant.dishes || [];

    menuItems.forEach((dish) => {
      html += `
        <div class="dish-item-card">
            <img src="${dish.image}" alt="${dish.name}">
            <div class="dish-info">
                <h3>${dish.name}</h3>
                <p>${dish.description}</p>
                <strong>${dish.price} грн</strong>
            </div>
            <button onclick="addToCart('${dish.id}', '${dish.name}', ${dish.price}, '${dish.image}')">Додати</button>
        </div>
      `;
    });
    html += `</div>`;
    mainContent.innerHTML = html;

    updateCartUI();
  } catch (error) {
    console.error("Не вдалося завантажити меню закладу:", error);
    mainContent.innerHTML = `<p style="color: red; padding: 20px;">Помилка завантаження меню ресторану.</p>`;
  }
}

function loadRestaurantMenu(restaurantId, restaurantName, shouldResetCart) {
  loadRestaurantMenuFromAPI(restaurantId, restaurantName, shouldResetCart);
}

// --- КЕРУВАННЯ КОШИКОМ ---
function addToCart(id, name, price, image) {
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: Number(price),
      image: image,
      quantity: 1,
    });
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
  const cartSidebar = document.getElementById("cart-sidebar");
  const mobileBar = document.getElementById("mobile-cart-bar");
  const mobileCountSpan = document.getElementById("mobile-cart-count");
  const mobileTotalSpan = document.getElementById("mobile-cart-total");

  if (!cartItemsDiv) return;

  const isMobile = window.innerWidth <= 900;

  // Стан 1: КОШИК ПОРОЖНІЙ
  if (cart.length === 0) {
    cartItemsDiv.innerHTML =
      '<p class="empty-cart" style="text-align: center; color: #a0aec0; padding: 20px 0;">🛒 Кошик порожній</p>';
    if (totalSpan) totalSpan.innerText = "0";

    if (mobileBar) mobileBar.classList.add("hidden");

    // Ховаємо весь кошик при 0 страв ТІЛЬКИ на мобільних
    if (isMobile && cartSidebar) {
      cartSidebar.classList.add("hidden");
      isMobileCartOpen = false;
    }
    return;
  }

  // Стан 2: У КОШИКУ Є СТРАВИ
  let html = '<div class="cart-items-list">';
  let totalAmount = 0;
  let totalItemsCount = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    totalItemsCount += item.quantity;

    html += `
      <div class="cart-item-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #edf2f7;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 10px;">
          <div class="cart-item-details" style="flex: 1;">
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${item.name}</h4>
              <p style="margin: 3px 0 0 0; color: #718096; font-size: 0.85rem;">${item.price} грн</p>
          </div>
          <div class="quantity-controls" style="display: flex; align-items: center; gap: 8px;">
              <button onclick="changeQuantity('${item.id}', -1)" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #edf2f7; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">−</button>
              <span style="font-weight: 600; min-width: 15px; text-align: center;">${item.quantity}</span>
              <button onclick="changeQuantity('${item.id}', 1)" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #edf2f7; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
          </div>
      </div>
    `;
  });
  html += "</div>";

  cartItemsDiv.innerHTML = html;
  if (totalSpan) totalSpan.innerText = totalAmount;

  // Логіка перемикання відображення (Мобільна версія vs Комп'ютерна)
  if (isMobile) {
    if (isMobileCartOpen) {
      if (cartSidebar) cartSidebar.classList.remove("hidden");
      if (mobileBar) mobileBar.classList.add("hidden");
    } else {
      if (cartSidebar) cartSidebar.classList.add("hidden");
      if (mobileBar) mobileBar.classList.remove("hidden");
    }
    if (mobileCountSpan) mobileCountSpan.innerText = totalItemsCount;
    if (mobileTotalSpan) mobileTotalSpan.innerText = totalAmount + " грн";
  } else {
    // На десктопі фіксований кошик завжди видимий, якщо ми всередині меню
    if (currentRestaurantId && cartSidebar) {
      cartSidebar.classList.remove("hidden");
    }
    if (mobileBar) mobileBar.classList.add("hidden");
  }
}

function submitOrder(event) {
  event.preventDefault();
  if (cart.length === 0) return;

  const user = getAuthUser();
  const orderData = {
    clientName: user ? user.name : document.getElementById("client-name").value,
    clientPhone: user ? user.phone : document.getElementById("client-phone").value,
    address: localStorage.getItem("userAddress"),
    items: cart,
    total: document.getElementById("total-amount").innerText,
  };

  if (!orderData.clientName || !orderData.clientPhone) {
    alert("Будь ласка, заповніть своє ім'я та телефон для оформлення замовлення.");
    return;
  }

  console.log("Дані замовлення відправлено:", orderData);
  alert(
    `Дякуємо, ${orderData.clientName}! Замовлення оформлено на суму ${orderData.total} грн.`,
  );

  cart = [];
  initCatalog();
}

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

function toggleMobileCart(open) {
  isMobileCartOpen = open;
  savePageState();
  updateCartUI();
}
// Автоматично виправляємо відображення кошика при зміні розміру екрана
window.addEventListener("resize", () => {
  const isMobile = window.innerWidth <= 900;
  const cartSidebar = document.getElementById("cart-sidebar");

  if (!isMobile) {
    // Якщо користувач розтягнув екран до десктопного розміру:
    // Повертаємо кошик у видимий стан, якщо ми перебуваємо всередині якогось ресторану
    if (currentRestaurantId && cartSidebar) {
      cartSidebar.classList.remove("hidden");
    }
  } else {
    // Якщо екран звузили до мобільного:
    // Синхронізуємо видимість відповідно до стану мобільного прапорця
    updateCartUI();
  }
});

function changeOrderStatus(orderId, newStatus) {
  const order = mockOrders.find((o) => o.id === orderId);
  if (order) {
    order.status = newStatus;
    initAdminPanel();
  }
}
