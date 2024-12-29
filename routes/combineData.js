// api/routes/combinedData.js
const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise"); // Menggunakan mysql2 dengan Promise
// Membuat pool koneksi
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Menunggu jika tidak ada koneksi
  connectionLimit: 10, // Maksimal 10 koneksi sekaligus
  queueLimit: 0, // Tidak ada batas antrian koneksi
});

// Endpoint untuk mengambil artikel, cerita, dan quotes terbaru
router.get("/", async (req, res) => {
  try {
    // Menjalankan query untuk artikel
    const [artikelResults] = await db.query(`
      SELECT judul, foto, hook, created_at, slug FROM artikel ORDER BY created_at DESC LIMIT 1;
    `);

    // Menjalankan query untuk cerita islami
    const [ceritaResults] = await db.query(`
      SELECT judul, foto, hook, created_at, slug FROM cerita ORDER BY created_at DESC LIMIT 1;
    `);

    // Menjalankan query untuk quotes
    const [quotesResults] = await db.query(`
      SELECT judul, foto, hook, created_at FROM quotes ORDER BY created_at DESC LIMIT 1;
    `);

    // Gabungkan semua data dari artikel, cerita, dan quotes
    const combinedData = [...artikelResults.map((item) => ({ ...item, type: "artikel" })), ...ceritaResults.map((item) => ({ ...item, type: "cerita" })), ...quotesResults.map((item) => ({ ...item, type: "quotes" }))];

    // Urutkan semua data berdasarkan created_at
    const sortedCombinedData = combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Kirimkan data yang telah digabung dan diurutkan
    res.status(200).json(sortedCombinedData);
  } catch (error) {
    console.error("Error:", error);
    // Kirimkan response error jika ada masalah
    res.status(500).json({ message: "Gagal mengambil data", error: error.message });
  }
});

module.exports = router;
