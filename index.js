const express = require("express")
const routes = require("./src/config/routes")
const { initDatabase } = require("./src/config/db")

let app = express()
app.use(express.json())

// Rota inicial de teste
app.get('/', (req, res) => {
  res.json({
    sistema: "Lanches & Cia API",
    versao: "1.0.0",
    status: "online",
    endpoints: {
      cardapio: "/cardapio",
      pedidos: "/pedidos"
    }
  })
})

routes(app)

;(async () => {
  try {
    await initDatabase()
    app.listen(3000, () => {
      console.log("🍔 Server is running on http://127.0.0.1:3000")
      console.log("📋 Teste com Thunder Client!")
    })
  } catch (error) {
    console.error("Failed to initialize database:", error)
    process.exit(1)
  }
})()