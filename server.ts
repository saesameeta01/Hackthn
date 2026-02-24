import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("irrigation.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS moisture_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    moisture_level REAL,
    crop_type TEXT,
    irrigation_status INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS farmers (
    id TEXT PRIMARY KEY,
    name TEXT,
    location TEXT,
    area_size REAL,
    area_unit TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM moisture_history ORDER BY timestamp DESC LIMIT 50").all();
    res.json(history);
  });

  app.post("/api/log", (req, res) => {
    const { moisture_level, crop_type, irrigation_status } = req.body;
    const stmt = db.prepare("INSERT INTO moisture_history (moisture_level, crop_type, irrigation_status) VALUES (?, ?, ?)");
    stmt.run(moisture_level, crop_type, irrigation_status ? 1 : 0);
    res.json({ success: true });
  });

  app.post("/api/signup", (req, res) => {
    const { id, name, location, area_size, area_unit } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO farmers (id, name, location, area_size, area_unit) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, name, location, area_size, area_unit);
      res.json({ success: true, profileUrl: `/profile/${id}` });
    } catch (e) {
      res.status(400).json({ error: "Farmer ID already exists or invalid data" });
    }
  });

  app.get("/api/farmer/:id", (req, res) => {
    const farmer = db.prepare("SELECT * FROM farmers WHERE id = ?").get(req.params.id);
    if (farmer) {
      res.json(farmer);
    } else {
      res.status(404).json({ error: "Farmer not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
