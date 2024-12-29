const express = require("express");
const bcrypt = require("bcrypt"); // Untuk hash password
const mysql = require("mysql2"); // Koneksi database
const router = express.Router();

// Koneksi database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Endpoint registrasi
router.post("/register", async (req, res) => {
  const { nama, password } = req.body;

  // Validasi input
  if (!nama || !password) {
    return res.status(400).json({ message: "Nama dan password wajib diisi." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    // Simpan data ke database
    const query = "INSERT INTO users (nama, password) VALUES (?, ?)";
    db.query(query, [nama, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
      }

      res.status(201).json({ message: "Registrasi berhasil!" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat memproses data." });
  }
});

module.exports = router;
