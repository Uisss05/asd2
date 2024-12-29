const express = require("express");
const router = express.Router();
const mysql = require("mysql2"); // Import koneksi database (sesuaikan dengan path)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint untuk mengambil semua quotes
router.get("/", (req, res) => {
  const query = `
    SELECT 
      penulis, 
      judul, 
      foto, 
      created_at, 
      hook 
    FROM quotes
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Gagal mengambil quotes" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Endpoint untuk mengambil quotes berdasarkan slug
router.get("/:slug", (req, res) => {
  const slug = req.params.slug; // Mendapatkan slug dari URL parameter
  const query = `
    SELECT 
      penulis, 
      judul, 
      foto, 
      created_at, 
      hook, 
      isiQuotes, 
      footnote
    FROM quotes 
    WHERE slug = ?  -- Pastikan tabel quotes memiliki kolom slug
  `;

  db.query(query, [slug], (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Gagal mengambil quotes" });
    } else {
      if (results.length > 0) {
        res.status(200).json(results[0]); // Mengirimkan quotes pertama jika ditemukan
      } else {
        res.status(404).json({ message: "Quotes tidak ditemukan" });
      }
    }
  });
});

module.exports = router;
