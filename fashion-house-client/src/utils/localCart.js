const CART_KEY = "infinity_store_cart";

export function getLocalCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter(
      (item) => item.productId && item.price !== undefined && item.price !== null
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function setLocalCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToLocalCart(item) {
  const cart = getLocalCart();
  const existing = cart.find(
    (c) => c.productId === item.productId && (c.size || "") === (item.size || "")
  );
  if (existing) {
    existing.quantity += item.quantity;
    existing.title = item.title || existing.title;
    existing.thumbnail = item.thumbnail || existing.thumbnail;
    existing.price = item.price || existing.price;
    existing.stock = item.stock ?? existing.stock;
    existing.category = item.category || existing.category;
  } else {
    cart.push({ ...item, quantity: item.quantity });
  }
  setLocalCart(cart);
  return cart;
}

export function updateLocalCartItem(productId, quantity, size = "") {
  let cart = getLocalCart();
  if (quantity <= 0) {
    cart = cart.filter(
      (c) => !(c.productId === productId && (c.size || "") === (size || ""))
    );
  } else {
    cart = cart.map((c) =>
      c.productId === productId && (c.size || "") === (size || "")
        ? { ...c, quantity }
        : c
    );
  }
  setLocalCart(cart);
  return cart;
}

export function removeFromLocalCart(productId, size = "") {
  const cart = getLocalCart().filter(
    (c) => !(c.productId === productId && (c.size || "") === (size || ""))
  );
  setLocalCart(cart);
  return cart;
}

export function getLocalCartCount() {
  return getLocalCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
}
