import fs from "fs";
import path from "path";
import { Product } from "@/types/product";
import { Order, Contact } from "@/types/order";
import { User } from "@/types/user";
import { Subscriber } from "@/types/subscriber";
import { sanitiseObject } from "./sanitise";

const dataDir = path.join(process.cwd(), "data");

function readJSON<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[db] Failed to read ${filename}:`, error);
    // Return empty array or object based on typical usage
    return (filename.endsWith('.json') ? [] : {}) as T;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  try {
    const filePath = path.join(dataDir, filename);
    // Sanitise data before writing
    let sanitised: T;
    if (Array.isArray(data)) {
      sanitised = data.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitiseObject(item as Record<string, unknown>)
          : item
      ) as T;
    } else if (typeof data === 'object' && data !== null) {
      sanitised = sanitiseObject(data as Record<string, unknown>) as T;
    } else {
      sanitised = data;
    }
    fs.writeFileSync(filePath, JSON.stringify(sanitised, null, 2), "utf-8");
  } catch (error) {
    console.error(`[db] Failed to write ${filename}:`, error);
    throw error;
  }
}

// Products
export function getProducts(): Product[] {
  return readJSON<Product[]>("products.json");
}

export function getProduct(id: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.id === id);
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  products.push(product);
  writeJSON("products.json", products);
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates };
  writeJSON("products.json", products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  writeJSON("products.json", filtered);
  return true;
}

// Normalise a raw order from JSON — converts legacy flat format to items[] format
function normaliseOrder(raw: Record<string, unknown>): Order {
  const o = raw as Order & Record<string, unknown>;
  if (!o.items || !Array.isArray(o.items) || o.items.length === 0) {
    const unitPrice = (o.price as number) || 0;
    const qty = o.quantity || 1;
    o.items = [{
      productId: o.productId || "",
      productName: o.productName || (o.product as string) || "",
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
    }];
    o.totalAmount = (o.totalPrice as number) || (o.amountPaid ? (o.amountPaid as number) / 100 : unitPrice * qty);
  }
  // Normalise paymentStatus for legacy orders
  if (!o.paymentStatus) {
    o.paymentStatus = o.paymentId ? "paid" : "pending";
  }
  // Normalise discount fields
  if (o.discountAmount === undefined) o.discountAmount = null;
  if (o.couponCode === undefined) o.couponCode = null;
  if (o.roleDiscountPercentage === undefined) o.roleDiscountPercentage = null;
  if (o.sgstAmount === undefined) o.sgstAmount = null;
  if (o.cgstAmount === undefined) o.cgstAmount = null;
  if (o.handlingCharge === undefined) o.handlingCharge = null;
  return o as Order;
}

// Orders
export function getOrders(): Order[] {
  const raw = readJSON<Record<string, unknown>[]>("orders.json");
  return raw.map(normaliseOrder);
}

export function getOrder(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find((o) => o.id === id);
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.push(order);
  writeJSON("orders.json", orders);
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...updates };
  writeJSON("orders.json", orders);
  return orders[index];
}

export function getOrdersByUserId(userId: string): Order[] {
  return getOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Contacts
export function getContacts(): Contact[] {
  return readJSON<Contact[]>("contacts.json")
    .map((c) => ({ ...c, isRead: c.isRead ?? false })) // graceful fallback for existing entries without isRead
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveContact(contact: Contact): void {
  const contacts = readJSON<Contact[]>("contacts.json");
  contacts.push(contact);
  writeJSON("contacts.json", contacts);
}

export function deleteContact(id: string): boolean {
  const contacts = readJSON<Contact[]>("contacts.json");
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length === contacts.length) return false;
  writeJSON("contacts.json", filtered);
  return true;
}

export function markContactAsRead(id: string): Contact | null {
  const contacts = readJSON<Contact[]>("contacts.json");
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  contacts[index] = { ...contacts[index], isRead: true };
  writeJSON("contacts.json", contacts);
  return contacts[index];
}

// Users
export function getUsers(): User[] {
  const raw = readJSON<User[]>("users.json");
  return raw.map((u) => {
    // Normalise businessStatus from legacy isBusinessVerified
    if (!u.businessStatus && (u.role === "wholesaler" || u.role === "clinic")) {
      u.businessStatus = u.isBusinessVerified ? "verified" : "pending";
    }
    if (!u.verificationHistory) u.verificationHistory = null;
    return u;
  });
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function getUserByPhone(phone: string): User | undefined {
  return getUsers().find((u) => u.phone === phone);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function saveUser(user: User): void {
  const users = getUsers();
  users.push(user);
  writeJSON("users.json", users);
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  writeJSON("users.json", users);
  return users[index];
}

// Subscribers
export function getSubscribers(): Subscriber[] {
  return readJSON<Subscriber[]>("subscribers.json");
}

export function addSubscriber(email: string, source: "Newsletter" | "Signup" = "Newsletter", role?: string): { subscriber: Subscriber; isNew: boolean; wasInactive: boolean } {
  const subscribers = getSubscribers();
  const existing = subscribers.find((s) => s.email === email);

  if (existing) {
    if (existing.isActive) {
      return { subscriber: existing, isNew: false, wasInactive: false };
    }
    const index = subscribers.findIndex((s) => s.email === email);
    subscribers[index].isActive = true;
    if (role) subscribers[index].role = role as Subscriber["role"];
    writeJSON("subscribers.json", subscribers);
    return { subscriber: subscribers[index], isNew: false, wasInactive: true };
  }

  const subscriber: Subscriber = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    subscribedAt: new Date().toISOString(),
    isActive: true,
    source,
    role: (role as Subscriber["role"]) || null,
  };
  subscribers.push(subscriber);
  writeJSON("subscribers.json", subscribers);
  return { subscriber, isNew: true, wasInactive: false };
}

export function unsubscribeByEmail(email: string): boolean {
  const subscribers = getSubscribers();
  const index = subscribers.findIndex((s) => s.email === email);
  if (index === -1) return false;
  subscribers[index].isActive = false;
  writeJSON("subscribers.json", subscribers);
  return true;
}

export function deleteSubscriberById(id: string): boolean {
  const subscribers = getSubscribers();
  const filtered = subscribers.filter((s) => s.id !== id);
  if (filtered.length === subscribers.length) return false;
  writeJSON("subscribers.json", filtered);
  return true;
}

export function updateSubscriberStatus(id: string, isActive: boolean): Subscriber | null {
  const subscribers = getSubscribers();
  const index = subscribers.findIndex((s) => s.id === id);
  if (index === -1) return null;
  subscribers[index].isActive = isActive;
  writeJSON("subscribers.json", subscribers);
  return subscribers[index];
}

// Business users (wholesaler + clinic)
export function getBusinessUsers(): User[] {
  return getUsers()
    .filter((u) => u.role === "wholesaler" || u.role === "clinic")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Newsletter conversion: mark subscriber as converted when they sign up
export function markSubscriberConverted(email: string): void {  const subscribers = readJSON<Subscriber[]>("subscribers.json");
  const index = subscribers.findIndex((s) => s.email === email);
  if (index === -1) return;
  if (subscribers[index].source === "Newsletter") {
    subscribers[index].source = "Newsletter → Signup";
    subscribers[index].convertedAt = new Date().toISOString();
    writeJSON("subscribers.json", subscribers);
  }
}

// Coupons
import { Coupon } from "@/types/coupon";

export function getCoupons(): Coupon[] {
  try { return readJSON<Coupon[]>("coupons.json"); } catch { return []; }
}

export function getCouponByCode(code: string): Coupon | undefined {
  return getCoupons().find((c) => c.code === code.toUpperCase());
}

export function createCoupon(coupon: Coupon): void {
  const coupons = getCoupons();
  coupons.push(coupon);
  writeJSON("coupons.json", coupons);
}

export function updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
  const coupons = getCoupons();
  const index = coupons.findIndex((c) => c.id === id);
  if (index === -1) return null;
  coupons[index] = { ...coupons[index], ...updates };
  writeJSON("coupons.json", coupons);
  return coupons[index];
}

export function deleteCoupon(id: string): boolean {
  const coupons = getCoupons();
  const filtered = coupons.filter((c) => c.id !== id);
  if (filtered.length === coupons.length) return false;
  writeJSON("coupons.json", filtered);
  return true;
}

export function incrementCouponUsage(code: string): void {
  const coupons = getCoupons();
  const index = coupons.findIndex((c) => c.code === code.toUpperCase());
  if (index === -1) return;
  coupons[index].usageCount = (coupons[index].usageCount || 0) + 1;
  writeJSON("coupons.json", coupons);
}

// Settings
export interface RoleDiscountSettings {
  roleDiscounts: {
    customer: { percentage: number; isActive: boolean };
    wholesaler: { percentage: number; isActive: boolean };
    clinic: { percentage: number; isActive: boolean };
  };
}

export function getSettings(): RoleDiscountSettings {
  try { return readJSON<RoleDiscountSettings>("settings.json"); }
  catch { return { roleDiscounts: { customer: { percentage: 0, isActive: false }, wholesaler: { percentage: 0, isActive: false }, clinic: { percentage: 0, isActive: false } } }; }
}

export function saveSettings(settings: RoleDiscountSettings): void {
  writeJSON("settings.json", settings);
}

// Restock Notifications
import { RestockNotification } from "@/types/restock";

export function getRestockNotifications(): RestockNotification[] {
  try { return readJSON<RestockNotification[]>("restock-notifications.json"); } catch { return []; }
}

export function addRestockNotification(data: RestockNotification): void {
  const all = getRestockNotifications();
  all.push(data);
  writeJSON("restock-notifications.json", all);
}

export function getRestockNotificationsByProduct(productId: string): RestockNotification[] {
  return getRestockNotifications().filter((n) => n.productId === productId && !n.isNotified);
}

export function getRestockNotificationsByUser(userId: string): RestockNotification[] {
  return getRestockNotifications().filter((n) => n.userId === userId && !n.isNotified);
}

export function markRestockNotified(id: string): void {
  const all = getRestockNotifications();
  const idx = all.findIndex((n) => n.id === id);
  if (idx === -1) return;
  all[idx].isNotified = true;
  all[idx].notifiedAt = new Date().toISOString();
  writeJSON("restock-notifications.json", all);
}

export function upsertRestockNotification(userId: string, productId: string, updates: Partial<RestockNotification>): RestockNotification {
  const all = getRestockNotifications();
  const idx = all.findIndex((n) => n.userId === userId && n.productId === productId && !n.isNotified);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    writeJSON("restock-notifications.json", all);
    return all[idx];
  }
  const entry = updates as RestockNotification;
  all.push(entry);
  writeJSON("restock-notifications.json", all);
  return entry;
}

export function deleteRestockNotification(userId: string, productId: string): boolean {
  const all = getRestockNotifications();
  const filtered = all.filter((n) => !(n.userId === userId && n.productId === productId && !n.isNotified));
  if (filtered.length === all.length) return false;
  writeJSON("restock-notifications.json", filtered);
  return true;
}

// Sync subscriber role when a user registers or updates their role
export function syncSubscriberRole(email: string, role: string): void {
  const subscribers = readJSON<Subscriber[]>("subscribers.json");
  const index = subscribers.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return;
  if (subscribers[index].role !== role) {
    subscribers[index].role = role as Subscriber["role"];
    writeJSON("subscribers.json", subscribers);
  }
}

// Categories
import { Category } from "@/types/product";

export function getCategories(): Category[] {
  try {
    const all = readJSON<Category[]>("categories.json");
    return all.filter((c) => c.isActive && c.isPublic);
  } catch { return []; }
}

export function getAllCategories(): Category[] {
  try { return readJSON<Category[]>("categories.json"); } catch { return []; }
}

export function updateCategory(id: string, data: Partial<Category>): Category | null {
  try {
    const all = readJSON<Category[]>("categories.json");
    const index = all.findIndex((c) => c.id === id);
    if (index === -1) return null;
    all[index] = { ...all[index], ...data };
    writeJSON("categories.json", all);
    return all[index];
  } catch { return null; }
}

export function createCategory(data: Omit<Category, "id">): Category {
  const id = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const newCategory: Category = { id, ...data };
  const all = getAllCategories();
  all.push(newCategory);
  writeJSON("categories.json", all);
  return newCategory;
}
