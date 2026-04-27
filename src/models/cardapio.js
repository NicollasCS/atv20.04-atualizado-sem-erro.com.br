const db = require('../config/db')

module.exports = {
  async getAll() {
    const result = await db.query('SELECT * FROM cardapio ORDER BY id')
    return result.rows
  },

  async getById(id) {
    if (!id) return null
    const result = await db.query('SELECT * FROM cardapio WHERE id = $1', [id])
    return result.rows[0] || null
  },

  async create({ name, categoria, descricao, preco, disponivel }) {
    const result = await db.query(
      'INSERT INTO cardapio (name, categoria, descricao, preco, disponivel) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, categoria, descricao || '', Number(preco), disponivel]
    )
    return result.rows[0]
  },

  async update(id, data) {
    const existing = await this.getById(id)
    if (!existing) return null

    const name = data.name !== undefined ? data.name : existing.name
    const categoria = data.categoria !== undefined ? data.categoria : existing.categoria
    const descricao = data.descricao !== undefined ? data.descricao : existing.descricao
    const preco = data.preco !== undefined ? Number(data.preco) : existing.preco
    const disponivel = data.disponivel !== undefined ? data.disponivel : existing.disponivel

    const result = await db.query(
      'UPDATE cardapio SET name = $2, categoria = $3, descricao = $4, preco = $5, disponivel = $6 WHERE id = $1 RETURNING *',
      [id, name, categoria, descricao, preco, disponivel]
    )
    return result.rows[0]
  },

  async delete(id) {
    const result = await db.query('DELETE FROM cardapio WHERE id = $1', [id])
    return result.rowCount > 0
  }
}