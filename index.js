const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Initialize SQLite database
const db = new sqlite3.Database('./recipes.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the recipes database.');
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  making_time TEXT,
  serves TEXT,
  ingredients TEXT,
  cost INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/recipes', async (req, res) => {
    const { title, making_time, serves, ingredients, cost } = req.body;
    const sql = `INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [title, making_time, serves, ingredients, cost], function (err) {
        if (err) {
            return res.status(400).json({ message: "Recipe creation failed!", error: err.message });
        }
        res.json({ message: "Recipe successfully created!", recipe: { id: this.lastID, ...req.body } });
    });
});

app.get('/recipes', (req, res) => {
    db.all(`SELECT * FROM recipes`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ recipes: rows });
    });
});

app.get('/recipes/:id', (req, res) => {
    const sql = `SELECT * FROM recipes WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(404).json({ message: "No recipe found", error: err.message });
        }
        if (row) {
            res.json({ message: "Recipe details by id", recipe: row });
        } else {
            res.status(404).json({ message: "No recipe found" });
        }
    });
});

app.patch('/recipes/:id', (req, res) => {
    const { title, making_time, serves, ingredients, cost } = req.body;
    const sql = `UPDATE recipes SET title = ?, making_time = ?, serves = ?, ingredients = ?, cost = ? WHERE id = ?`;
    db.run(sql, [title, making_time, serves, ingredients, cost, req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ message: "Update failed", error: err.message });
        }
        if (this.changes) {
            res.json({ message: "Recipe successfully updated!" });
        } else {
            res.status(404).json({ message: "No recipe found" });
        }
    });
});

app.delete('/recipes/:id', (req, res) => {
    const sql = `DELETE FROM recipes WHERE id = ?`;
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return res.status(404).json({ message: "No recipe found", error: err.message });
        }
        if (this.changes) {
            res.json({ message: "Recipe successfully removed!" });
        } else {
            res.status(404).json({ message: "No recipe found" });
        }
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
