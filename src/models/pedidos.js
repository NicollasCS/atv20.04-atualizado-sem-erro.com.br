const db = require('../config/db')

module.exports = {
  async getAll() {
    const result = await db.query('SELECT * FROM pedidos ORDER BY id')
    return result.rows
  },

  async getById(id) {
    if (!id) return null
    const result = await db.query('SELECT * FROM pedidos WHERE id = $1', [id])
    return result.rows[0] || null
  },

  async create({ mesa, cliente, itens, observacao, status, metodoPagamento, total }) {
    const result = await db.query(
      'INSERT INTO pedidos (mesa, cliente, itens, observacao, status, metodo_pagamento, total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [mesa, cliente, JSON.stringify(itens), observacao, status, metodoPagamento, Number(total)]
    )
    return result.rows[0]
  },

  async update(id, data) {
    const existing = await this.getById(id)
    if (!existing) return null

    const mesa = data.mesa !== undefined ? data.mesa : existing.mesa
    const cliente = data.cliente !== undefined ? data.cliente : existing.cliente
    const itens = data.itens !== undefined ? JSON.stringify(data.itens) : existing.itens
    const observacao = data.observacao !== undefined ? data.observacao : existing.observacao
    const status = data.status !== undefined ? data.status : existing.status
    const metodoPagamento = data.metodoPagamento !== undefined ? data.metodoPagamento : existing.metodo_pagamento
    const total = data.total !== undefined ? Number(data.total) : existing.total

    const result = await db.query(
      'UPDATE pedidos SET mesa = $2, cliente = $3, itens = $4, observacao = $5, status = $6, metodo_pagamento = $7, total = $8 WHERE id = $1 RETURNING *',
      [id, mesa, cliente, itens, observacao, status, metodoPagamento, total]
    )
    return result.rows[0]
  },

  async delete(id) {
    const result = await db.query('DELETE FROM pedidos WHERE id = $1', [id])
    return result.rowCount > 0
  }
}