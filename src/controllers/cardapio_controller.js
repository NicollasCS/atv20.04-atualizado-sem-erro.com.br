const Cardapio = require('../models/cardapio')

class CardapioController {
  static async index(req, res) {
    return await Cardapio.getAll()
  }

  static async show(req, res) {
    const id = Number(req.params.id)
    const item = await Cardapio.getById(id)
    if (!item) return { error: 'Item não encontrado' }
    return item
  }

  static async create(req, res) {
    const { name, categoria, descricao, preco, disponivel = true } = req.body
    if (!name || !categoria || preco === undefined) {
      return { error: 'name, categoria e preco são obrigatórios' }
    }

    return await Cardapio.create({
      name,
      categoria,
      descricao: descricao || '',
      preco: Number(preco),
      disponivel: Boolean(disponivel)
    })
  }

  static async update(req, res) {
    const id = Number(req.params.id)
    const item = await Cardapio.update(id, req.body)
    if (!item) return { error: 'Item não encontrado' }
    return item
  }

  static async delete(req, res) {
    const id = Number(req.params.id)
    const success = await Cardapio.delete(id)
    if (!success) return { error: 'Item não encontrado' }
    return { success: true }
  }
}

module.exports = CardapioController