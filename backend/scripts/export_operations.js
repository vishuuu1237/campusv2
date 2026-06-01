import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const logsDir = path.join(__dirname, '..', 'logs');

function safeReadJSON(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('Failed to read or parse', filePath, err.message);
        return null;
    }
}

function maskPassword(user) {
    const copy = { ...user };
    if (copy.password) copy.password = '[REDACTED]';
    return copy;
}

function ensureArray(v) {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
}

async function buildWorkbook() {
    const workbook = XLSX.utils.book_new();

    // Users
    const usersPath = path.join(dataDir, 'users.json');
    const users = safeReadJSON(usersPath) || [];
    const safeUsers = users.map(maskPassword);
    const usersSheet = XLSX.utils.json_to_sheet(safeUsers);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');

    // Products
    const productsPath = path.join(dataDir, 'products.json');
    const products = safeReadJSON(productsPath) || [];
    const productsSheet = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

    // Orders (order-level) and Order Items (flattened)
    const ordersPath = path.join(dataDir, 'orders.json');
    const orders = safeReadJSON(ordersPath) || [];
    const orderRows = orders.map(o => ({
        id: o.id,
        userId: o.userId,
        total: o.total,
        paymentMethod: o.paymentMethod,
        status: o.status,
        createdAt: o.createdAt || '',
        cancelledAt: o.cancelledAt || '',
        shipping_street: o.shippingAddress?.street || '',
        shipping_city: o.shippingAddress?.city || '',
        shipping_state: o.shippingAddress?.state || '',
        shipping_zip: o.shippingAddress?.zip || '',
        shipping_campusLocation: o.shippingAddress?.campusLocation || ''
    }));
    const ordersSheet = XLSX.utils.json_to_sheet(orderRows);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');

    // Order items
    const orderItems = [];
    orders.forEach(o => {
        const items = ensureArray(o.items);
        items.forEach(it => {
            orderItems.push({
                orderId: o.id,
                productId: it.productId,
                name: it.name,
                price: it.price,
                quantity: it.quantity,
                image: it.image || ''
            });
        });
    });
    const orderItemsSheet = XLSX.utils.json_to_sheet(orderItems);
    XLSX.utils.book_append_sheet(workbook, orderItemsSheet, 'Order_Items');

    // Carts
    const cartsPath = path.join(dataDir, 'carts.json');
    const carts = safeReadJSON(cartsPath) || {};
    // carts is an object keyed by userId
    const cartRows = [];
    const cartItems = [];
    Object.entries(carts).forEach(([userId, cart]) => {
        cartRows.push({ userId, itemsCount: (cart.items || []).length });
        (cart.items || []).forEach(it => {
            cartItems.push({ userId, productId: it.productId, name: it.name, price: it.price, quantity: it.quantity });
        });
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(cartRows), 'Carts');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(cartItems), 'Cart_Items');

    // Password resets
    const pwPath = path.join(dataDir, 'password_resets.json');
    const pwResets = safeReadJSON(pwPath) || [];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(pwResets), 'Password_Resets');

    // Logs - read all files in logs dir if present
    const logsExist = fs.existsSync(logsDir);
    const logsRows = [];
    if (logsExist) {
        const files = fs.readdirSync(logsDir);
        files.forEach(fname => {
            try {
                const full = path.join(logsDir, fname);
                const content = fs.readFileSync(full, 'utf8');
                // split into lines but keep manageable size
                const lines = content.split(/\r?\n/).filter(Boolean);
                lines.forEach((ln, idx) => logsRows.push({ file: fname, line: idx + 1, text: ln }));
            } catch (e) {
                logsRows.push({ file: fname, line: 0, text: `ERROR: ${e.message}` });
            }
        });
    }
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(logsRows), 'Logs');

    // Build consolidated Operations sheet from available sources
    const operations = [];

    // Registrations (from users.json)
    safeUsers.forEach(u => {
        operations.push({
            timestamp: u.createdAt || '',
            userId: u.id || '',
            action: 'register',
            details: `${u.name || ''} <${u.email || ''}>`
        });
    });

    // Product listings
    (products || []).forEach(p => {
        operations.push({
            timestamp: p.createdAt || '',
            userId: p.sellerId || '',
            action: 'product_listed',
            details: `${p.id} | ${p.name} | price:${p.price}`
        });
    });

    // Orders: created and cancelled
    (orders || []).forEach(o => {
        operations.push({
            timestamp: o.createdAt || '',
            userId: o.userId || '',
            action: 'order_created',
            details: `order:${o.id} total:${o.total}`
        });
        if (o.cancelledAt) {
            operations.push({
                timestamp: o.cancelledAt || '',
                userId: o.userId || '',
                action: 'order_cancelled',
                details: `order:${o.id}`
            });
        }
    });

    // Password reset emails parsed from logs (if present)
    if (logsExist) {
        try {
            const pwLogPath = path.join(logsDir, 'password_reset_emails.log');
            if (fs.existsSync(pwLogPath)) {
                const raw = fs.readFileSync(pwLogPath, 'utf8');
                const lines = raw.split(/\r?\n/).filter(Boolean);
                lines.forEach(ln => {
                    try {
                        const entry = JSON.parse(ln);
                        operations.push({
                            timestamp: entry.timestamp || '',
                            userId: '',
                            action: 'password_reset_email_sent',
                            details: `${entry.email} link:${entry.resetLink || ''}`
                        });
                    } catch (e) {
                        // ignore non-json lines
                    }
                });
            }
        } catch (e) {
            // ignore
        }
    }

    // Carts snapshot (no timestamps available in file storage)
    Object.entries(carts).forEach(([userId, cart]) => {
        operations.push({
            timestamp: '',
            userId,
            action: 'cart_snapshot',
            details: `items:${(cart.items || []).length}`
        });
    });

    // Sort operations by timestamp where possible (empty timestamps will sort last)
    operations.sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return new Date(a.timestamp) - new Date(b.timestamp);
    });

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(operations), 'Operations');

    // Write workbook
    const outPath = path.join(__dirname, '..', 'website_operations.xlsx');
    XLSX.writeFile(workbook, outPath);
    console.log('Exported operations to', outPath);
}

buildWorkbook().catch(err => {
    console.error('Export failed:', err);
    process.exitCode = 1;
});
