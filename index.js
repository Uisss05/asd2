require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const registerRoute = require("./routes/register");
const artikelRoutes = require("./routes/artikel");
const artikelCard = require("./routes/artikelCard");
const ceritaApi = require("./routes/cerita");
const newsRoutes = require("./routes/news");
const ceritaCardRoutes = require("./routes/certaCard");
const quotesRouter = require("./routes/quotes");
const quotesCardRoutes = require("./routes/quotesCard");
const CombineRoutes = require("./routes/combineData");
const path = require("path");
const jwt = require("jsonwebtoken");
const { verifyToken, verifyAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000; // Gunakan environment variable PORT jika ada

app.use(express.json());
app.use(cors());

// Koneksi ke database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to the database.");
});

app.use("/api", registerRoute);
// Endpoint untuk login
app.post("/api/login", (req, res) => {
  const { nama, password } = req.body;

  // Query untuk mencari pengguna berdasarkan nama
  const query = "SELECT * FROM users WHERE nama = ?";
  db.query(query, [nama], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const user = results[0];

    // Verifikasi apakah password yang dimasukkan cocok dengan hash password yang ada di database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Terjadi kesalahan pada server." });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Password salah." });
      }

      // Jika verifikasi berhasil, buat token JWT
      const payload = { userId: user.id, nama: user.nama, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      // Kirim token JWT ke client
      res.status(200).json({ message: "Login berhasil", token });
    });
  });
});
// Endpoint untuk mengambil  admin
app.get("/api/admin", verifyToken, verifyAdmin, (req, res) => {
  const userId = req.user.userId;

  // Ambil data admin berdasarkan user yang terverifikasi
  const query = "SELECT * FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }

    if (results.length > 0) {
      return res.status(200).json({ admin: results[0] });
    } else {
      return res.status(404).json({ message: "Admin tidak ditemukan." });
    }
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// endpoint upload artike
app.use("/api/artikel", artikelRoutes);
//endpoint news
app.use("/api/news", newsRoutes);
// endpoint get artikel
app.use("/api/artikelCard", artikelCard);
app.use("/api/cerita", ceritaApi); // Menambahkan route API cerita
app.use("/api/ceritaCard", ceritaCardRoutes);
app.use("/api/quotes", quotesRouter);
app.use("/api/quotesCard", quotesCardRoutes);
app.use("/api/combineData", CombineRoutes);
// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
