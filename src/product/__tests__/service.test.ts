import { describe, it, expect, beforeEach } from 'bun:test';
import { ProductService } from '../service';
import { Database } from 'bun:sqlite';

const db = new Database(':memory:'); 

const productService = ProductService(db);

const initializeDatabase = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER,
      active BOOLEAN DEFAULT true,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_pairings (
      product_id INTEGER,
      paired_product_id INTEGER,
      PRIMARY KEY (product_id, paired_product_id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (paired_product_id) REFERENCES products(id)
    )
  `);
};

beforeEach(() => {
  initializeDatabase();

  db.run('DELETE FROM product_pairings');
  db.run('DELETE FROM products');
  db.run('DELETE FROM categories');
  db.run('DELETE FROM sqlite_sequence'); 
});

describe('Product Service', () => {
  it('should get all products', async () => {
    db.run(`
      INSERT INTO categories (id, name, description)
      VALUES (1, 'Wine', 'Fine wines from around the world')
    `);
    db.run(`
      INSERT INTO products (id, name, description, category_id, active)
      VALUES (1, 'Cabernet Sauvignon', 'A rich red wine', 1, 1)
    `);

    const products = await productService.getAllProducts();
    expect(products).toEqual([
      {
        id: 1,
        name: 'Cabernet Sauvignon',
        description: 'A rich red wine',
        active: true,
        category: {
          id: 1,
          name: 'Wine',
          description: 'Fine wines from around the world',
        },
        suggestedPairings: [],
      },
    ]);
  });

  it('should create a product', async () => {
    db.run(`
      INSERT INTO categories (id, name, description)
      VALUES (1, 'Wine', 'Fine wines from around the world')
    `);

    const productData = {
      name: 'Cabernet Sauvignon',
      description: 'A rich red wine',
      category_id: 1,
      active: 1, 
    };

    const product = await productService.createProduct(productData);
    expect(product).toMatchObject({
      id: 1,
      name: 'Cabernet Sauvignon',
      description: 'A rich red wine',
      active: true, 
      category: {
        id: 1,
        name: 'Wine',
        description: 'Fine wines from around the world',
      },
      suggestedPairings: [],
    });
  });

  it('should get a product by ID', async () => {
    // Insert a category and product first
    db.run(`
      INSERT INTO categories (id, name, description)
      VALUES (1, 'Wine', 'Fine wines from around the world')
    `);
    db.run(`
      INSERT INTO products (id, name, description, category_id, active)
      VALUES (1, 'Cabernet Sauvignon', 'A rich red wine', 1, 1)
    `);

    const product = await productService.getProductById(1);
    expect(product).toMatchObject({
      id: 1,
      name: 'Cabernet Sauvignon',
      description: 'A rich red wine',
      active: true, // Expect a boolean
      category: {
        id: 1,
        name: 'Wine',
        description: 'Fine wines from around the world',
      },
      suggestedPairings: [],
    });
  });

  it('should return null if product is not found', async () => {
    const product = await productService.getProductById(999);
    expect(product).toBeNull();
  });
  it('should update a product', async () => {
    db.run(`
      INSERT INTO categories (id, name, description)
      VALUES (1, 'Wine', 'Fine wines from around the world')
    `);
  
    db.run(`
      INSERT INTO products (id, name, description, category_id, active)
      VALUES (1, 'Cabernet Sauvignon', 'A rich red wine', 1, 1)
    `);
  
  
    const categoryCheck = db.prepare('SELECT * FROM categories WHERE id = ?').get(1);
    expect(categoryCheck).toBeDefined();
  
    const productCheck = db.prepare('SELECT * FROM products WHERE id = ?').get(1);
    expect(productCheck).toBeDefined();
  
    const updatedProduct = await productService.updateProduct(1, {
      name: 'Updated Cabernet Sauvignon',
      description: 'An updated description',
    });
  
    expect(updatedProduct).toMatchObject({
      id: 1,
      name: 'Updated Cabernet Sauvignon',
      description: 'An updated description',
      active: true,
      category: {
        id: 1,
        name: 'Wine',
        description: 'Fine wines from around the world',
      },
      suggestedPairings: [],
    });
  });

  it('should delete a product', async () => {
    db.run(`
      INSERT INTO categories (id, name, description)
      VALUES (1, 'Wine', 'Fine wines from around the world')
    `);
    db.run(`
      INSERT INTO products (id, name, description, category_id, active)
      VALUES (1, 'Cabernet Sauvignon', 'A rich red wine', 1, 1)
    `);

    const success = await productService.deleteProduct(1);
    expect(success).toBe(true);

    const product = await productService.getProductById(1);
    expect(product).toBeNull();
  });
});