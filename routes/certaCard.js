const express = require("express");
const router = express.Router();
const mysql = require("mysql2"); // Import koneksi database (sesuaikan dengan path)

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint untuk mengambil semua cerita
router.get("/", (req, res) => {
  const query = `
    SELECT 
      judul, 
      foto, 
      penulis, 
      created_at, 
      hook 
    FROM cerita
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Gagal mengambil cerita" });
    } else {
      res.status(200).json(results); // Mengirimkan semua data cerita
    }
  });
});

// Endpoint untuk mengambil cerita berdasarkan slug
router.get("/:slug", (req, res) => {
  const slug = req.params.slug; // Mendapatkan slug dari URL parameter
  const query = `
    SELECT 
      judul, 
      foto, 
      penulis, 
      created_at, 
      hook, 
      isiCerita,
      footnote
    FROM cerita 
    WHERE slug = ?  -- Pastikan tabel cerita memiliki kolom slug
  `;

  db.query(query, [slug], (error, results) => {
    if (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Gagal mengambil cerita" });
    } else {
      if (results.length > 0) {
        res.status(200).json(results[0]); // Mengirimkan cerita pertama jika ditemukan
      } else {
        res.status(404).json({ message: "Cerita tidak ditemukan" });
      }
    }
  });
});

module.exports = router;
