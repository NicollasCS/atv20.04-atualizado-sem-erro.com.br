// Importa o modelo de Pedidos para operações com a tabela de pedidos
const Pedidos = require('../models/pedidos')
const Cardapio = require('../models/cardapio')

async function buildPedidoItems(items) {
  if (!Array.isArray(items)) return []

  return Promise.all(
    items.map(async (item) => {
      const itemId = Number(item.id || item.itemId)
      
      // Se o ID for válido, busca o item no cardápio; caso contrário, retorna null
      const menuItem = itemId ? await Cardapio.getById(itemId) : null
      
      // Retorna o objeto do item formatado com os campos padronizados
      return {
        id: itemId,
        nome: item.nome || (menuItem ? menuItem.name : null),
        quantidade: item.quantidade !== undefined ? Number(item.quantidade) : 1, 
        observacao: item.observacao || '', 
        preco: item.preco !== undefined ? Number(item.preco) : (menuItem ? Number(menuItem.preco) : 0)  // Preço: prioriza o enviado, senão busca no cardápio
      }
    })
  )
}

// Calcula o valor total do pedido aplicando uma taxa de 27%
function calculateTotal(items) {
  if (!Array.isArray(items)) return 0
  
  // Calcula o subtotal somando (preço * quantidade) de cada item
  const subtotal = items.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
  
  // Aplica o fator de 1.27 (27% de acréscimo) e fixa em 2 casas decimais
  return Number((subtotal * 1.27).toFixed(2))
}

// Controller responsável por gerenciar as operações relacionadas a pedidos
class PedidosController {
  
  // Retorna todos os pedidos cadastrados no sistema
  static async index(req, res) {
    return await Pedidos.getAll()
  }

  // Busca um pedido pelo ID fornecido nos parâmetros da requisição
  static async show(req, res) {
    // Converte o parâmetro 'id' para número e busca no banco
    const pedido = await Pedidos.getById(Number(req.params.id))
    
    // Se não encontrar, retorna objeto com erro
    if (!pedido) return { error: 'Pedido não encontrado' }
    
    // Retorna o pedido encontrado
    return pedido
  }

  // Cria um novo pedido com os dados fornecidos no corpo da requisição
  static async create(req, res) {
    // Extrai os campos do corpo da requisição
    const { mesa, cliente, itens, observacao, metodoPagamento } = req.body
    
    // Validação: pelo menos um item deve ser informado
    if (!Array.isArray(itens) || itens.length === 0) {
      return { error: 'É necessário informar pelo menos um item no pedido' }
    }

    // Constrói a lista de itens com dados completos (busca preço/nome no cardápio se necessário)
    const pedidoItems = await buildPedidoItems(itens)
    
    // Cria o objeto do pedido com os dados formatados e salva no banco
    const pedido = await Pedidos.create({
      mesa: mesa || null,  // Mesa: se não informada, define como null
      cliente: cliente || null,  // Cliente: se não informado, define como null
      itens: pedidoItems,  // Lista de itens já processada
      observacao: observacao || '',  // Observação geral do pedido
      status: 'Pendente',
      metodoPagamento: metodoPagamento || null,  // Método de pagamento: opcional
      total: calculateTotal(pedidoItems)  // Calcula o total com taxa de 27%
    })

    // Retorna o pedido criado
    return pedido
  }

  // Atualiza os dados de um pedido existente identificado pelo ID
  static async update(req, res) {
    // Converte o ID da URL para número
    const id = Number(req.params.id)
    
    // Verifica se o pedido existe antes de tentar atualizar
    const existing = await Pedidos.getById(id)
    if (!existing) return { error: 'Pedido não encontrado' }

    // Extrai os campos que podem ser atualizados do corpo da requisição
    const { mesa, cliente, itens, observacao, status, metodoPagamento } = req.body
    
    // Prepara o objeto com os dados atualizados
    // Mantém os valores existentes para campos não informados
    const updatedData = {
      mesa: mesa !== undefined ? mesa : existing.mesa,
      cliente: cliente !== undefined ? cliente : existing.cliente,
      observacao: observacao !== undefined ? observacao : existing.observacao,
      status: status !== undefined ? status : existing.status,
      metodoPagamento: metodoPagamento !== undefined ? metodoPagamento : existing.metodo_pagamento,
      itens: existing.itens,  // Inicialmente mantém os itens existentes
      total: existing.total    // Inicialmente mantém o total existente
    }

    // Se a lista de itens foi fornecida para atualização
    if (itens !== undefined) {
      // Reconstrói os itens (buscando dados atuais do cardápio)
      const pedidoItems = await buildPedidoItems(itens)
      updatedData.itens = pedidoItems
      // Recalcula o total com a nova lista de itens
      updatedData.total = calculateTotal(pedidoItems)
    }

    // Executa a atualização no banco de dados
    const pedido = await Pedidos.update(id, updatedData)
    
    // Retorna o pedido atualizado
    return pedido
  }

  // Remove um pedido do sistema pelo ID
  static async delete(req, res) {
    const id = Number(req.params.id)
    
    const success = await Pedidos.delete(id)
    
    // Se não conseguiu deletar (pedido não encontrado)
    if (!success) return { error: 'Pedido não encontrado' }
    
    // Retorna sucesso
    return { success: true }
  }
}

// Exporta a classe para ser utilizada nas rotas
module.exports = PedidosController
