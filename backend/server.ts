import express, { Request, Response } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Inicialización de la base de datos
const db = new sqlite3.Database('./saas-o-matic.db', (err) => {
  if (err) console.error('Error connecting to SQLite:', err);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      companyName TEXT NOT NULL,
      taxId TEXT NOT NULL,
      email TEXT NOT NULL,
      country TEXT NOT NULL,
      plan TEXT NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      activeUsers INTEGER,
      storage INTEGER,
      apiCalls INTEGER,
      baseCost REAL,
      totalCost REAL,
      FOREIGN KEY(customerId) REFERENCES customers(id)
    )
  `);
});

// Algoritmo de validación para documentos españoles
const isValidSpanishTaxId = (taxId: string): boolean => {
  const validChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  const nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  const cifRexp = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;

  const str = taxId.toUpperCase().replace(/\s/g, '');
  
  if (nifRexp.test(str)) {
    const letter = str.slice(-1);
    const number = parseInt(str.slice(0, 8), 10);
    return letter === validChars.charAt(number % 23);
  }
  
  if (nieRexp.test(str)) {
    const niePrefix = str.charAt(0);
    const nieNumber = str.slice(1, 8);
    const nieLetter = str.slice(-1);
    const prefixVal = niePrefix === 'X' ? '0' : niePrefix === 'Y' ? '1' : '2';
    const number = parseInt(prefixVal + nieNumber, 10);
    return nieLetter === validChars.charAt(number % 23);
  }
  
  if (cifRexp.test(str)) {
    return true; // Validación simplificada para el alcance del CIF corporativo
  }
  
  return false;
};

// Endpoints
app.post('/customers', (req: Request, res: Response) => {
  const { companyName, taxId, email, country, plan } = req.body;
  
  if (country.toLowerCase() === 'españa' || country.toLowerCase() === 'spain') {
    if (!isValidSpanishTaxId(taxId)) {
      return res.status(400).json({ error: 'Identificador fiscal (DNI/NIE/CIF) inválido según el algoritmo oficial.' });
    }
  }

  const stmt = db.prepare('INSERT INTO customers (companyName, taxId, email, country, plan) VALUES (?, ?, ?, ?, ?)');
  stmt.run([companyName, taxId, email, country, plan], function(err) {
    if (err) return res.status(500).json({ error: 'Error interno al guardar el cliente.' });
    res.status(201).json({ id: this.lastID, companyName, taxId, email, country, plan });
  });
  stmt.finalize();
});

app.post('/simulations', (req: Request, res: Response) => {
  const { customerId, activeUsers, storage, apiCalls, country } = req.body;
  
  let baseCost = 0;
  
  // Algoritmo de Tramos Acumulativos
  if (activeUsers <= 10) {
    baseCost = activeUsers * 10;
  } else if (activeUsers <= 50) {
    baseCost = (10 * 10) + ((activeUsers - 10) * 8);
  } else {
    baseCost = (10 * 10) + (40 * 8) + ((activeUsers - 50) * 5);
  }

  const taxRate = (country.toLowerCase() === 'españa' || country.toLowerCase() === 'spain') ? 0.21 : 0;
  const totalCost = baseCost + (baseCost * taxRate);

  const stmt = db.prepare('INSERT INTO simulations (customerId, activeUsers, storage, apiCalls, baseCost, totalCost) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run([customerId, activeUsers, storage, apiCalls, baseCost, totalCost], function(err) {
    if (err) return res.status(500).json({ error: 'Error al persistir la simulación.' });
    res.status(201).json({ id: this.lastID, customerId, activeUsers, baseCost, totalCost });
  });
  stmt.finalize();
});

app.listen(port, () => {
  console.log(`SaaS-O-Matic backend operativo en http://localhost:${port}`);
});