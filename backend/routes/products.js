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

const getDataDir = () => {
  const cwdData = path.join(process.cwd(), 'backend', 'data');
  if (fsSync.existsSync(cwdData)) return cwdData;
  return path.join(__dirname, '../data');
};
const dataDir = getDataDir();

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsDir = path.join(process.cwd(), 'backend', 'public', 'uploads');
try { fsSync.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* ignore */ }

const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
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

const defaultProducts = [
  {
    "id": "1764670179360",
    "name": "Math book",
    "description": "New book",
    "price": 200,
    "category": "Textbooks",
    "image": "https://via.placeholder.com/300",
    "stock": 1,
    "condition": "New",
    "sellerId": "1764670128037",
    "createdAt": "2025-12-02T10:09:39.360Z",
    "rating": 0,
    "reviews": []
  },
  {
    "id": "1787202210952",
    "name": "Digital electronics",
    "description": "Clear all concepts of electronic",
    "price": 400,
    "category": "Textbooks",
    "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    "stock": 10,
    "condition": "New",
    "sellerId": "1787202147690",
    "createdAt": "2026-08-20T05:03:30.952Z",
    "rating": 0,
    "reviews": []
  },
  {
    "id": "1790146935222",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "description": "Includes original hard shell carry case, 3.5mm cable, pristine earcups with active noise cancellation.",
    "price": 28000,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    "stock": 2,
    "condition": "Like New",
    "sellerId": "1790146849116",
    "createdAt": "2026-09-23T07:02:15.222Z",
    "rating": 0,
    "reviews": []
  },
  {
    "id": "1791353289072",
    "name": "calculator",
    "description": "new",
    "price": 200,
    "listingFee": 10,
    "category": "Electronics",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    "stock": 1,
    "condition": "Like New",
    "sellerId": "1791353210797",
    "createdAt": "2026-10-07T06:08:09.072Z",
    "rating": 0,
    "reviews": []
  }
];

let inMemoryProducts = null;

const getProducts = async () => {
  if (inMemoryProducts && inMemoryProducts.length > 0) {
    return inMemoryProducts;
  }
  const filePath = path.join(dataDir, 'products.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryProducts = parsed;
      return parsed;
    }
  } catch (err) {
    // If reading file fails, use default products
  }
  inMemoryProducts = [...defaultProducts];
  return inMemoryProducts;
};

const saveProducts = async (products) => {
  inMemoryProducts = products;
  const filePath = path.join(dataDir, 'products.json');
  try {
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
  } catch (err) {
    // Filesystem may be read-only in serverless; inMemoryProducts retains the update
  }
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

export const calculateListingFee = (price) => {
  const p = parseFloat(price) || 0;
  if (p <= 0) return 0;
  if (p <= 100) return 5;
  if (p <= 500) return 10;
  if (p <= 1000) return 25;
  // Above 1000: 50rs + 2rs for each 500rs above 1000rs
  const excess = p - 1000;
  const extraSlabs = Math.ceil(excess / 500);
  return 50 + extraSlabs * 2;
};

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

    const imageUrl = req.file
      ? (req.file.filename ? `/uploads/${req.file.filename}` : `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`)
      : (image || 'https://via.placeholder.com/300');
    const parsedPrice = parseFloat(price);
    const listingFee = calculateListingFee(parsedPrice);

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parsedPrice,
      listingFee,
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

    if (req.body.price !== undefined) {
      updatedProduct.price = parseFloat(req.body.price);
      updatedProduct.listingFee = calculateListingFee(updatedProduct.price);
    }

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
