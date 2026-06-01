import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
// Ensure uploads directory exists and configure multer
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
try { fsSync.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now().toString() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  }
});

const getProducts = async () => {
  const filePath = path.join(dataDir, 'products.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

const saveProducts = async (products) => {
  const filePath = path.join(dataDir, 'products.json');
  await fs.writeFile(filePath, JSON.stringify(products, null, 2));
};

// Get all products (with optional search and filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    let products = await getProducts();

    // Filter by search
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }

    // Filter by price range
    if (minPrice) {
      products = products.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= parseFloat(maxPrice));
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (requires auth)
// Accepts either JSON body with `image` URL or multipart/form-data with file field `imageFile` (png/jpg)
router.post('/', verifyToken, upload.single('imageFile'), async (req, res) => {
  try {
    // If multipart, fields are in req.body and file in req.file
    const { name, description, price, category, image, stock, condition } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Name, description, price, and category are required' });
    }

    const products = await getProducts();

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (image || 'https://via.placeholder.com/300');

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      stock: stock || 1,
      condition: condition || 'New',
      sellerId: req.userId,
      createdAt: new Date().toISOString(),
      rating: 0,
      reviews: []
    };

    products.push(newProduct);
    await saveProducts(products);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (requires auth - only seller)
// Accepts multipart with `imageFile` to replace image
router.put('/:id', verifyToken, upload.single('imageFile'), async (req, res) => {
  try {
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (products[productIndex].sellerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...req.body,
      id: products[productIndex].id,
      sellerId: products[productIndex].sellerId
    };

    // If a new image file was uploaded, update the image path
    if (req.file) {
      updatedProduct.image = `/uploads/${req.file.filename}`;
    }

    products[productIndex] = updatedProduct;
    await saveProducts(products);

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (requires auth - only seller)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (products[productIndex].sellerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    products.splice(productIndex, 1);
    await saveProducts(products);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
