const express = require("express");
const router = express.Router();
const mysql = require("mysql2"); // Import koneksi database (sesuaikan dengan path)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

router.get("/", (req, res) => {
  const query = `
    SELECT 
      judul, 
      foto, 
      penulis, 
      created_at, 
      hook 
    FROM artikel
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Gagal mengambil artikel" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Endpoint untuk mengambil artikel berdasarkan slug
router.get("/:slug", (req, res) => {
  const slug = req.params.slug; // Mendapatkan slug dari URL parameter
  const query = `
    SELECT 
      judul, 
      foto, 
      penulis, 
      created_at, 
      hook, 
      isiArtikel,
      footnote
    FROM artikel 
    WHERE slug = ?  -- Pastikan tabel artikel memiliki kolom slug
  `;

  db.query(query, [slug], (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Gagal mengambil artikel" });
    } else {
      if (results.length > 0) {
        res.status(200).json(results[0]); // Mengirimkan artikel pertama jika ditemukan
      } else {
        res.status(404).json({ message: "Artikel tidak ditemukan" });
      }
    }
  });
});

module.exports = router;
