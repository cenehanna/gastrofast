// --- СТАН ДОДАТКУ (ГЛОБАЛЬНІ ЗМІННІ) ---
let cart = [];
let currentRestaurantId = null;
let currentRestaurantName = "";
let isMobileCartOpen = false; // Додаємо назад цей прапорець
let ordersPollingInterval = null;
let adminPollingInterval = null;
const ORDERS_POLLING_DELAY = 8000; // 8 секунд для polling


// --- РОЗДІЛЕННЯ ЗАПУСКУ ЗАЛЕЖНО ВІД СТОРІНКИ ---
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  renderAuthHeader();

  if (path.includes("index.html") || path.endsWith("/")) {
    renderAuthHeader();
    renderSavedAddressesOnWelcome();
  } else if (path.includes("catalog.html")) {
    restorePageState();
    configureOrderForm();
  } else if (path.includes("orders.html")) {
    renderAuthHeader();
    updateDisplayAddress();
    initOrdersPage();
    startOrdersPolling();
  } else if (path.includes("login.html") || path.includes("register.html")) {
    redirectIfAuthenticatedForAuthPages();
  } else if (path.includes("admin.html")) {
    initAdminPanel();
    startAdminPolling();
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

  updateDisplayAddress();

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
  stopOrdersPolling();
  stopAdminPolling();
  window.location.href = "index.html";
}

function startOrdersPolling() {
  stopOrdersPolling();
  ordersPollingInterval = setInterval(() => {
    if (window.location.pathname.includes("orders.html")) {
      initOrdersPage();
    }
  }, ORDERS_POLLING_DELAY);
}

function stopOrdersPolling() {
  if (ordersPollingInterval) {
    clearInterval(ordersPollingInterval);
    ordersPollingInterval = null;
  }
}

function startAdminPolling() {
  stopAdminPolling();
  adminPollingInterval = setInterval(() => {
    if (window.location.pathname.includes("admin.html")) {
      initAdminPanel();
    }
  }, ORDERS_POLLING_DELAY);
}

function stopAdminPolling() {
  if (adminPollingInterval) {
    clearInterval(adminPollingInterval);
    adminPollingInterval = null;
  }
}

function updateDisplayAddress() {
  const address = localStorage.getItem("userAddress") || "";
  const displayElement = document.getElementById("display-address");
  if (displayElement) {
    displayElement.innerText = address;
  }
}

// --- ЛОГІКА СТОРІНКИ ПРИВІТАННЯ (index.html) ---
const MAX_SAVED_ADDRESSES = 5;
const SAVED_ADDRESSES_KEY = "savedAddresses";

function getSavedAddresses() {
  try {
    const raw = localStorage.getItem(SAVED_ADDRESSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedAddresses(addresses) {
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
}

function addSavedAddress(address) {
  const trimmed = address.trim();
  if (!trimmed) return;

  const user = getAuthUser();
  if (user) {
    const userAddresses = Array.isArray(user.savedAddresses)
      ? user.savedAddresses.filter(
          (item) => item.toLowerCase() !== trimmed.toLowerCase(),
        )
      : [];
    userAddresses.unshift(trimmed);
    user.savedAddresses = userAddresses.slice(0, MAX_SAVED_ADDRESSES);
    localStorage.setItem("user", JSON.stringify(user));
    return;
  }

  const localAddresses = getSavedAddresses().filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase(),
  );
  localAddresses.unshift(trimmed);
  saveSavedAddresses(localAddresses.slice(0, MAX_SAVED_ADDRESSES));
}

function getSavedAddressesForWelcome() {
  const user = getAuthUser();
  if (user && Array.isArray(user.savedAddresses)) {
    return user.savedAddresses.slice(0, MAX_SAVED_ADDRESSES);
  }
  return getSavedAddresses();
}

function renderSavedAddressesOnWelcome() {
  const addresses = getSavedAddressesForWelcome();
  const savedAddressesBlock = document.getElementById("saved-addresses-block");
  const container = document.getElementById("addresses-buttons-container");

  if (!savedAddressesBlock || !container) return;

  if (addresses.length === 0) {
    savedAddressesBlock.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  savedAddressesBlock.classList.remove("hidden");
  container.innerHTML = "";

  addresses.forEach((addr) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `📍 ${addr}`;
    button.dataset.address = addr;
    button.style.background = "#edf2f7";
    button.style.border = "1px solid #cbd5e0";
    button.style.padding = "8px 12px";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.fontSize = "0.9rem";
    button.style.fontWeight = "500";
    button.style.transition = "0.2s";
    button.addEventListener("click", () => selectSavedAddress(addr));
    container.appendChild(button);
  });
}

function saveAddressAndGo() {
  const addressInput = document.getElementById("user-address").value;
  if (!addressInput.trim()) {
    alert("Будь ласка, введіть адресу!");
    return;
  }
  addSavedAddress(addressInput);
  localStorage.setItem("userAddress", addressInput);
  sessionStorage.removeItem("currentRestaurantId");
  window.location.href = "catalog.html";
}

function selectSavedAddress(address) {
  const input = document.getElementById("user-address");
  if (input) {
    input.value = address;
    input.focus();
  }
}

// --- АУТЕНТИФІКАЦІЯ ТА ПРОФІЛЬ КОРИСТУВАЧА ---
function getAuthUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

function getAuthToken() {
  return localStorage.getItem("token");
}

function translateOrderStatus(status) {
  switch (status) {
    case "PENDING":
      return "В обробці";
    case "PLACED":
      return "Прийнято";
    case "COOKING":
      return "Готується";
    case "DELIVERED":
      return "Доставляється";
    case "DONE":
      return "Виконано";
    case "CANCELLED":
      return "Скасовано";
    default:
      return status || "В обробці";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "PENDING":
      return "status-placed";
    case "PLACED":
      return "status-confirmed";
    case "COOKING":
      return "status-cooking";
    case "DELIVERED":
      return "status-delivering";
    case "DONE":
      return "status-done";
    case "CANCELLED":
      return "status-cancelled";
    default:
      return "status-placed";
  }
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
      <button onclick="window.location.href='orders.html'" style="background: white; color: #ff5722; border: 1px solid #ff5722; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; margin-right: 10px;">
        Замовлення
      </button>
      <span style="color: #ff5722; margin-right: 15px; font-weight: bold;">👤 ${user.name}</span>
      <button onclick="logout()" style="background: #ff5722; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer;">
        Вийти
      </button>
    `;

    if (welcomeTitle) welcomeTitle.innerText = `🍕 Вітаємо, ${user.name}!`;

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
    } else if (savedAddressesBlock) {
      savedAddressesBlock.classList.add("hidden");
    }
  } else {
    authHeader.innerHTML = `
      <button onclick="window.location.href='orders.html'" style="background: white; color: #ff5722; border: 1px solid #ff5722; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; margin-right: 10px;">
        Замовлення
      </button>
      <span style="color: #ff5722; margin-right: 15px; font-weight: bold;">👤 Гість</span>
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
  stopOrdersPolling();
  stopAdminPolling();
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

  const hasSavedName = user && user.name;
  const hasSavedPhone = user && user.phone;

  if (hasSavedName && hasSavedPhone) {
    fieldsWrapper.style.display = "none";
    nameInput.disabled = true;
    phoneInput.disabled = true;

    noteElement.style.display = "block";
    noteElement.innerText = `Ім'я: ${user.name}, Телефон: ${user.phone}. Ці дані будуть використані для оформлення замовлення.`;
  } else {
    fieldsWrapper.style.display = "block";
    nameInput.disabled = false;
    phoneInput.disabled = false;

    if (hasSavedName) {
      nameInput.value = user.name;
    }
    if (hasSavedPhone) {
      phoneInput.value = user.phone;
    }

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
    if (errorElement)
      errorElement.innerText = "Будь ласка, введіть email та пароль.";
    return;
  }

  try {
    const response = await fetch("https://gastrofast.onrender.com/auth/login", {
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
    if (errorElement)
      errorElement.innerText = error.message || "Помилка під час входу";
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
    if (errorElement)
      errorElement.innerText = "Усі поля є обов'язковими для заповнення.";
    return;
  }

  try {
    const response = await fetch("https://gastrofast.onrender.com/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Помилка під час реєстрації");
    }

    if (data.access_token && data.user) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "catalog.html";
      return;
    }

    if (successElement) {
      successElement.innerText =
        "Реєстрація пройшла успішно. Тепер можете увійти.";
    }
  } catch (error) {
    if (errorElement)
      errorElement.innerText = error.message || "Помилка під час реєстрації";
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
    const response = await fetch("https://gastrofast.onrender.com/restaurants");
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
      `https://gastrofast.onrender.com/restaurants/${restaurantId}`,
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

async function submitOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("🛒 Кошик порожній!");
    return;
  }

  const user = getAuthUser();
  const isGuest = !user;

  // Отримуємо контактні дані
  let guestName, guestPhone, clientName, clientPhone;

  if (isGuest) {
    guestName = document.getElementById("client-name")?.value || "";
    guestPhone = document.getElementById("client-phone")?.value || "";

    if (!guestName || !guestPhone) {
      alert(
        "Будь ласка, заповніть своє ім'я та телефон для оформлення замовлення.",
      );
      return;
    }
  } else {
    clientName = user.name;
    clientPhone = user.phone || "";
  }

  const totalAmount = document.getElementById("total-amount")?.innerText || "0";

  // Формуємо дані для бекенду
  const orderData = {
    address: localStorage.getItem("userAddress") || "",
    restaurantId: currentRestaurantId,
    items: cart.map((item) => ({
      dishId: parseInt(item.id), // id страви - це число в БД
      quantity: item.quantity,
      price: item.price,
    })),
    ...(isGuest ? { guestName, guestPhone, guestEmail: "" } : {}),
  };

  try {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch("https://gastrofast.onrender.com/orders", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Помилка оформлення замовлення");
    }

    const result = await response.json();

    if (!isGuest) {
      alert(
        `✅ Дякуємо, ${user.name}! Замовлення #${result.id} оформлено на суму ${result.total} грн.`,
      );
      window.location.href = "orders.html";
    } else {
      alert(`✅ Дякуємо, ${guestName}! Замовлення оформлено.`);
      window.location.href = `track.html?token=${result.trackingToken}`;
    }

    cart = [];
    isMobileCartOpen = false;
    updateCartUI();
  } catch (error) {
    console.error("Помилка:", error);
    alert(`❌ Сталася помилка: ${error.message}`);
  }
}

// Отримання тільки МОЇХ замовлень (для авторизованого користувача)
async function fetchMyOrders() {
  const token = getAuthToken();

  console.log("Токен для запиту:", token ? "Є токен" : "Немає токена");

  if (!token) {
    console.warn("Немає токена авторизації");
    return [];
  }

  try {
    const response = await fetch("https://gastrofast.onrender.com/orders/my", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Статус відповіді:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Помилка відповіді:", errorText);
      throw new Error(`Помилка ${response.status}: ${errorText}`);
    }

    const orders = await response.json();
    console.log("Отримано замовлень:", orders.length);
    return orders;
  } catch (error) {
    console.error("Помилка завантаження замовлень:", error);
    return [];
  }
}


/* function getStoredOrders() {
  const ordersJson = localStorage.getItem("userOrders");
  const orders = ordersJson ? JSON.parse(ordersJson) : [];
  let changed = false;
  const normalized = orders.map((order, index) => {
    if (order.id == null) {
      changed = true;
      order.id = Date.now() + index;
    }
    return order;
  });
  if (changed) {
    setStoredOrders(normalized);
  }
  return normalized;
}

function setStoredOrders(orders) {
  localStorage.setItem("userOrders", JSON.stringify(orders));
}

function saveStoredOrder(order) {
  if (order.id == null) {
    order.id = generateOrderId();
  }
  const orders = getStoredOrders();
  const existingIndex = orders.findIndex((o) => o.id === order.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  setStoredOrders(orders);
}

function generateOrderId() {
  return Date.now();
} */

async function initOrdersPage() {
  const user = getAuthUser();
  const ordersTable = document.getElementById("orders-table-body");
  const emptyMessage = document.getElementById("orders-empty");
  const userLabel = document.getElementById("orders-user-label");
  const pageTitle = document.getElementById("orders-page-title");

  if (userLabel) {
    userLabel.innerText = user
      ? `Користувач: ${user.name}`
      : "Користувач: Гість";
  }

  if (!ordersTable || !emptyMessage) return;

  // Якщо користувач не авторизований, пропонуємо увійти
  if (!user) {
    emptyMessage.style.display = "block";
    emptyMessage.innerHTML = `
      🔒 Увійдіть в акаунт, щоб переглянути ваші замовлення.
      <br><br>
      <button onclick="window.location.href='login.html'" style="background: #ff5722; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
        Увійти
      </button>
    `;
    ordersTable.innerHTML = "";
    if (pageTitle) pageTitle.innerText = "Мої замовлення";
    return;
  }

  // Перевіряємо чи є токен
  const token = getAuthToken();
  if (!token) {
    console.error("Немає токена!");
    emptyMessage.style.display = "block";
    emptyMessage.innerHTML = "❌ Помилка авторизації. Увійдіть знову.";
    ordersTable.innerHTML = "";
    return;
  }

  try {
    console.log("Завантаження замовлень для користувача:", user.id);
    console.log("Токен:", token.substring(0, 20) + "...");

    const response = await fetch("https://gastrofast.onrender.com/orders/my", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Статус відповіді:", response.status);

    if (response.status === 401) {
      // Токен недійсний - очищаємо і перенаправляємо на логін
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Сесія закінчилась. Увійдіть знову.");
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`Помилка ${response.status}`);
    }

    const orders = await response.json();
    console.log("Отримано замовлень:", orders.length);

    if (!orders || orders.length === 0) {
      emptyMessage.style.display = "block";
      emptyMessage.innerHTML =
        "📭 У вас ще немає замовлень. Перейдіть до каталогу та зробіть перше замовлення!";
      ordersTable.innerHTML = "";
      return;
    }

    emptyMessage.style.display = "none";
    let html = "";

    orders.forEach((order) => {
      let statusClass = "";
      let statusText = "";

      statusText = translateOrderStatus(order.status);
      statusClass = getStatusClass(order.status);

      let itemSummary = "";
      if (order.items && order.items.length > 0) {
        itemSummary = order.items
          .map((item) => `${item.name} x${item.quantity}`)
          .join(", ");
      } else {
        itemSummary = "-";
      }

      const orderDate = new Date(order.createdAt).toLocaleString("uk-UA");

      html += `
        <tr class="${statusClass}">
          <td><strong>#${order.id}</strong></td>
          <td>${orderDate}</td>
          <td>${order.clientName}</td>
          <td>${order.clientPhone}</td>
          <td>${order.address || "-"}</td>
          <td>${itemSummary}</td>
          <td><strong>${order.total} грн</strong></td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        </tr>
      `;
    });

    ordersTable.innerHTML = html;
  } catch (error) {
    console.error("Помилка детально:", error);
    emptyMessage.style.display = "block";
    emptyMessage.innerHTML = `❌ Помилка завантаження замовлень: ${error.message}<br><br>
      <button onclick="initOrdersPage()" style="background: #ff5722; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
        Спробувати ще раз
      </button>
    `;
    ordersTable.innerHTML = "";
  }
}


// Оновлена функція initAdminPanel (для адмінки, отримує замовлення з бекенду)
async function initAdminPanel() {
  const tableBody = document.getElementById("admin-orders-table");
  if (!tableBody) return;

  try {
    const token = getAuthToken();
    
    // Перевірка, чи користувач адмін (тимчасово, поки немає ролей)
    const response = await fetch("https://gastrofast.onrender.com/orders", {
      headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    
    if (!response.ok) {
      throw new Error("Помилка завантаження замовлень");
    }
    
    const orders = await response.json();

    if (orders.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">📭 Немає замовлень</td></tr>';
      return;
    }

    let html = "";
    for (const order of orders) {
      let statusClass = "";
      const statusText = translateOrderStatus(order.status);
      statusClass = getStatusClass(order.status);

      let itemSummary = "";
      const rawItems =
        order.items ||
        (typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : order.itemsJson) ||
        [];
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        itemSummary = rawItems.map(item => `${item.name} x${item.quantity}`).join(", ");
      } else {
        itemSummary = "-";
      }

      html += `
        <tr>
          <td><strong>#${order.id}</strong></td>
          <td>${order.restaurant || "-"}</td>
          <td>${order.clientName}</td>
          <td>${order.clientPhone}</td>
          <td>${order.address || "-"}</td>
          <td>${itemSummary}</td>
          <td><strong>${order.total} грн</strong></td>
          <td>
            <select onchange="changeOrderStatus(${order.id}, this.value)" class="status-select ${statusClass}">
              <option value="PENDING" ${order.status === "PENDING" ? "selected" : ""}>⏳ В обробці</option>
              <option value="PLACED" ${order.status === "PLACED" ? "selected" : ""}>📋 Прийнято</option>
              <option value="COOKING" ${order.status === "COOKING" ? "selected" : ""}>🍳 Готується</option>
              <option value="DELIVERED" ${order.status === "DELIVERED" ? "selected" : ""}>🚚 Доставляється</option>
              <option value="DONE" ${order.status === "DONE" ? "selected" : ""}>✅ Виконано</option>
              <option value="CANCELLED" ${order.status === "CANCELLED" ? "selected" : ""}>❌ Скасовано</option>
            </select>
          </td>
        </tr>
      `;
    }
    tableBody.innerHTML = html;
  } catch (error) {
    console.error("Помилка:", error);
    tableBody.innerHTML = '<tr><td colspan="8" style="color: red; text-align: center;">❌ Помилка завантаження замовлень</td></tr>';
  }
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

// Оновлена функція changeOrderStatus (оновлює статус через бекенд)
async function changeOrderStatus(orderId, newStatus) {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`https://gastrofast.onrender.com/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Order status update failed:", response.status, errorText);
      throw new Error(`Помилка оновлення статусу (${response.status})`);
    }

    // Оновлюємо відображення
    if (window.location.pathname.includes("admin.html")) {
      await initAdminPanel();
    }
    if (window.location.pathname.includes("orders.html")) {
      await initOrdersPage();
    }
  } catch (error) {
    console.error("Помилка:", error);
    alert("❌ Помилка оновлення статусу замовлення");
  }
}

// Отримання замовлень з бекенду
async function fetchUserOrders() {
  const token = getAuthToken();
  
  if (!token) {
    return [];
  }
  
  try {
    const response = await fetch("https://gastrofast.onrender.com/orders", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Помилка завантаження замовлень");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Помилка завантаження замовлень:", error);
    return [];
  }
}



window.addEventListener("storage", (event) => {
  if (event.key !== "userOrders") return;
  if (window.location.pathname.includes("orders.html")) {
    initOrdersPage();
  }
  if (window.location.pathname.includes("admin.html")) {
    initAdminPanel();
  }
});
