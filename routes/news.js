const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Membuat koneksi ke database MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint untuk mengambil semua artikel terbaru dari tabel blog_artikel
router.get("/", (req, res) => {
  const query = `
      SELECT 
        judul, 
        foto, 
        hook, 
        created_at
      FROM artikel
      ORDER BY created_at DESC
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

module.exports = router;
