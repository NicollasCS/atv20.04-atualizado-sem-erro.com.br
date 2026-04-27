const Pedidos = require('../models/pedidos')
const Cardapio = require('../models/cardapio')

async function buildPedidoItems(items) {
  if (!Array.isArray(items)) return []

  return Promise.all(
    items.map(async (item) => {
      const itemId = Number(item.id || item.itemId)
      const menuItem = itemId ? await Cardapio.getById(itemId) : null
      return {
        id: itemId,
        nome: item.nome || (menuItem ? menuItem.name : null),
        quantidade: item.quantidade !== undefined ? Number(item.quantidade) : 1,
        observacao: item.observacao || '',
        preco: item.preco !== undefined ? Number(item.preco) : (menuItem ? Number(menuItem.preco) : 0)
      }
    })
  )
}

function calculateTotal(items) {
  if (!Array.isArray(items)) return 0
  const subtotal = items.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
  return Number((subtotal * 1.27).toFixed(2))
}

class PedidosController {
  static async index(req, res) {
    return await Pedidos.getAll()
  }

  static async show(req, res) {
    const pedido = await Pedidos.getById(Number(req.params.id))
    if (!pedido) return { error: 'Pedido não encontrado' }
    return pedido
  }

  static async create(req, res) {
    const { mesa, cliente, itens, observacao, metodoPagamento } = req.body
    if (!Array.isArray(itens) || itens.length === 0) {
      return { error: 'É necessário informar pelo menos um item no pedido' }
    }

    const pedidoItems = await buildPedidoItems(itens)
    const pedido = await Pedidos.create({
      mesa: mesa || null,
      cliente: cliente || null,
      itens: pedidoItems,
      observacao: observacao || '',
      status: 'Pendente',
      metodoPagamento: metodoPagamento || null,
      total: calculateTotal(pedidoItems)
    })

    return pedido
  }

  static async update(req, res) {
    const id = Number(req.params.id)
    const existing = await Pedidos.getById(id)
    if (!existing) return { error: 'Pedido não encontrado' }

    const { mesa, cliente, itens, observacao, status, metodoPagamento } = req.body
    const updatedData = {
      mesa: mesa !== undefined ? mesa : existing.mesa,
      cliente: cliente !== undefined ? cliente : existing.cliente,
      observacao: observacao !== undefined ? observacao : existing.observacao,
      status: status !== undefined ? status : existing.status,
      metodoPagamento: metodoPagamento !== undefined ? metodoPagamento : existing.metodo_pagamento,
      itens: existing.itens,
      total: existing.total
    }

    if (itens !== undefined) {
      const pedidoItems = await buildPedidoItems(itens)
      updatedData.itens = pedidoItems
      updatedData.total = calculateTotal(pedidoItems)
    }

    const pedido = await Pedidos.update(id, updatedData)
    return pedido
  }

  static async delete(req, res) {
    const id = Number(req.params.id)
    const success = await Pedidos.delete(id)
    if (!success) return { error: 'Pedido não encontrado' }
    return { success: true }
  }
}

module.exports = PedidosController