const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql2");
// Mengimpor koneksi ke database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function createSlugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Hapus karakter non-alfabet dan non-angka
    .replace(/\s+/g, "-") // Ganti spasi dengan tanda hubung
    .replace(/-+/g, "-"); // Ganti tanda hubung ganda dengan satu
}

const router = express.Router();

// Setup storage untuk gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder untuk menyimpan gambar
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Menambahkan waktu ke nama file agar unik
  },
});

// Menyaring file gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Mengizinkan file gambar
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

// Inisialisasi multer dengan pengaturan yang telah dibuat
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Route untuk meng-upload cerita dan foto
router.post("/", upload.single("foto"), (req, res) => {
  const { judul, hook, isiCerita, footnote, penulis } = req.body;
  const slug = createSlugFromTitle(judul);

  // Validasi data
  if (!judul || !hook || !isiCerita || !penulis) {
    return res.status(400).json({ message: "Semua field wajib diisi!" });
  }

  const fotoPath = req.file ? req.file.path : null;

  const query = `
    INSERT INTO cerita (judul, isiCerita, footnote, penulis, foto, hook, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [judul, isiCerita, footnote, penulis, fotoPath, hook, slug], (error, results) => {
    if (error) {
      console.error("Terjadi kesalahan:", error);
      res.status(500).json({ message: "Gagal menyimpan cerita", error });
    } else {
      res.status(200).json({ message: "Cerita berhasil disimpan!", ceritaId: results.insertId });
    }
  });
});

module.exports = router;
