// server.js - Servidor simples com JSON Server
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware de autenticação admin
server.use((req, res, next) => {
  if (req.path.includes('/admin') && req.method !== 'GET') {
    const token = req.headers['authorization'];
    if (!token || token !== 'Bearer admin123') {
      return res.status(401).json({ error: 'Não autorizado' });
    }
  }
  next();
});

server.use(middlewares);
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
});
