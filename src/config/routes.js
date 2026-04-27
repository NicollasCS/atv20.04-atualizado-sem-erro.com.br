const pedidos_controller = require('../controllers/pedidos_controller')
const cardapio_controller = require('../controllers/cardapio_controller')

function routes(app) {
  // ============ PEDIDOS ============
  app.get('/pedidos', async (req, res) => {
    const result = await pedidos_controller.index(req, res)
    res.json(result)
  })

  app.get('/pedidos/:id', async (req, res) => {
    const result = await pedidos_controller.show(req, res)
    if (result.error) return res.status(404).json(result)
    res.json(result)
  })

  app.post('/pedidos', async (req, res) => {
    const result = await pedidos_controller.create(req, res)
    if (result.error) return res.status(400).json(result)
    res.status(201).json(result)
  })

  app.put('/pedidos/:id', async (req, res) => {
    const result = await pedidos_controller.update(req, res)
    if (result.error) return res.status(404).json(result)
    res.json(result)
  })

  app.delete('/pedidos/:id', async (req, res) => {
    const result = await pedidos_controller.delete(req, res)
    if (result.error) return res.status(404).json(result)
    res.json({ success: true })
  })

  // ============ CARDÁPIO ============
  app.get('/cardapio', async (req, res) => {
    const result = await cardapio_controller.index(req, res)
    res.json(result)
  })

  app.get('/cardapio/:id', async (req, res) => {
    const result = await cardapio_controller.show(req, res)
    if (result.error) return res.status(404).json(result)
    res.json(result)
  })

  app.post('/cardapio', async (req, res) => {
    const result = await cardapio_controller.create(req, res)
    if (result.error) return res.status(400).json(result)
    res.status(201).json(result)
  })

  app.put('/cardapio/:id', async (req, res) => {
    const result = await cardapio_controller.update(req, res)
    if (result.error) return res.status(404).json(result)
    res.json(result)
  })

  app.delete('/cardapio/:id', async (req, res) => {
    const result = await cardapio_controller.delete(req, res)
    if (result.error) return res.status(404).json(result)
    res.json({ success: true })
  })
}

module.exports = routes