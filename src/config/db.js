const fs = require('fs')
const path = require('path')

// Caminho do banco JSON
const dbPath = path.join(__dirname, '..', 'database.json')

// Estrutura inicial
const defaultData = {
  cardapio: [
    {
      id: 1,
      name: 'X-Burger',
      categoria: 'Lanches',
      descricao: 'Hambúrguer, queijo, alface e tomate',
      preco: 25.90,
      disponivel: true,
      criado_em: new Date().toISOString()
    },
    {
      id: 2,
      name: 'X-Salada',
      categoria: 'Lanches',
      descricao: 'Hambúrguer, queijo, alface, tomate e maionese',
      preco: 28.90,
      disponivel: true,
      criado_em: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Coca-Cola 350ml',
      categoria: 'Bebidas',
      descricao: 'Lata 350ml',
      preco: 6.50,
      disponivel: true,
      criado_em: new Date().toISOString()
    }
  ],
  pedidos: [],
  nextId: {
    cardapio: 4,
    pedidos: 1
  }
}

// Função auxiliar para ler o banco
function readDB() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2))
      return JSON.parse(JSON.stringify(defaultData))
    }
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao ler banco de dados:', error)
    return JSON.parse(JSON.stringify(defaultData))
  }
}

// Função auxiliar para escrever no banco
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erro ao escrever no banco de dados:', error)
  }
}

// Simula o pool.query do PostgreSQL
const db = {
  query(text, params = []) {
    const database = readDB()

    // Identifica o tipo de operação
    const command = text.trim().split(' ')[0].toUpperCase()
    const tableMatch = text.match(/FROM\s+(\w+)|INTO\s+(\w+)|UPDATE\s+(\w+)/i)
    const table = tableMatch ? (tableMatch[1] || tableMatch[2] || tableMatch[3]) : null

    // SELECT
    if (command === 'SELECT') {
      if (text.includes('WHERE id = $1')) {
        const id = Number(params[0])
        const rows = table ? database[table].filter(item => item.id === id) : []
        return Promise.resolve({ rows, rowCount: rows.length })
      }
      // SELECT all
      const rows = table ? [...database[table]].sort((a, b) => a.id - b.id) : []
      return Promise.resolve({ rows, rowCount: rows.length })
    }

    // INSERT
    if (command === 'INSERT') {
      const newId = database.nextId[table]++
      let newItem = {}

      if (table === 'cardapio') {
        newItem = {
          id: newId,
          name: params[0],
          categoria: params[1],
          descricao: params[2],
          preco: Number(params[3]),
          disponivel: params[4],
          criado_em: new Date().toISOString()
        }
      } else if (table === 'pedidos') {
        newItem = {
          id: newId,
          mesa: params[0],
          cliente: params[1],
          itens: params[2],
          observacao: params[3],
          status: params[4],
          metodo_pagamento: params[5],
          total: Number(params[6]),
          criado_em: new Date().toISOString()
        }
      }

      database[table].push(newItem)
      writeDB(database)
      return Promise.resolve({ rows: [newItem], rowCount: 1 })
    }

    // UPDATE
    if (command === 'UPDATE') {
      const id = Number(params[0])
      const index = database[table].findIndex(item => item.id === id)
      
      if (index === -1) {
        return Promise.resolve({ rows: [], rowCount: 0 })
      }

      if (table === 'cardapio') {
        database[table][index] = {
          ...database[table][index],
          name: params[1],
          categoria: params[2],
          descricao: params[3],
          preco: Number(params[4]),
          disponivel: params[5]
        }
      } else if (table === 'pedidos') {
        database[table][index] = {
          ...database[table][index],
          mesa: params[1],
          cliente: params[2],
          itens: params[3],
          observacao: params[4],
          status: params[5],
          metodo_pagamento: params[6],
          total: Number(params[7])
        }
      }

      writeDB(database)
      return Promise.resolve({ rows: [database[table][index]], rowCount: 1 })
    }

    // DELETE
    if (command === 'DELETE') {
      const id = Number(params[0])
      const index = database[table].findIndex(item => item.id === id)
      
      if (index === -1) {
        return Promise.resolve({ rows: [], rowCount: 0 })
      }

      database[table].splice(index, 1)
      writeDB(database)
      return Promise.resolve({ rows: [], rowCount: 1 })
    }

    return Promise.resolve({ rows: [], rowCount: 0 })
  }
}

async function initDatabase() {
  // Garantir que o arquivo existe
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2))
    console.log('✅ Banco de dados JSON criado com dados iniciais')
  } else {
    console.log('📂 Banco de dados JSON carregado')
  }
}

module.exports = {
  query: (text, params) => db.query(text, params),
  initDatabase,
  pool: db
}