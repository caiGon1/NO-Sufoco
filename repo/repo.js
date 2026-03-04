const db = require("../config/database");

class UserRepository {
  async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [ email ]);
    return rows[0] || null;
  }
  async findById(id) {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }
  async create(nome, email, senha_hash) {
    const [result] = await db.execute(
      "INSERT INTO users (nome, email, senha_hash) VALUES (?, ?, ?)",
      [nome, email, senha_hash],
    );
    return result.insertId;
  }
}

module.exports = new UserRepository();
