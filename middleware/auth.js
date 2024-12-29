const jwt = require("jsonwebtoken");

// Middleware untuk memverifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Mengambil token setelah 'Bearer'

  if (!token) {
    return res.status(403).json({ message: "Token tidak ditemukan" });
  }

  // Verifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid" });
    }

    // Menyimpan data decoded token di request untuk digunakan di route berikutnya
    req.user = decoded;
    next();
  });
};

// Middleware untuk memverifikasi peran admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Anda tidak memiliki akses ke halaman ini" });
  }
  next();
};

// Ekspor middleware agar bisa digunakan di file lain
module.exports = { verifyToken, verifyAdmin };
