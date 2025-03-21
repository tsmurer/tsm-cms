import { db } from ".";

export const initializeDatabase = () => {
    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON;');
  
    // Create tables if they don't exist
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
  
    console.log('Database initialized successfully!');
  };