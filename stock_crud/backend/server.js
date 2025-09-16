const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Inicializar banco de dados
const db = new sqlite3.Database('./stock.db');

// Criar tabela se não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Rotas da API

// GET - Listar todos os itens
app.get('/api/items', (req, res) => {
    db.all('SELECT * FROM items ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Buscar item por ID
app.get('/api/items/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Item não encontrado' });
            return;
        }
        res.json(row);
    });
});

// POST - Criar novo item
app.post('/api/items', (req, res) => {
    const { name, quantity, price } = req.body;
    
    if (!name || quantity === undefined || price === undefined) {
        res.status(400).json({ error: 'Nome, quantidade e preço são obrigatórios' });
        return;
    }

    db.run('INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)', 
        [name, quantity, price], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ 
                id: this.lastID,
                name,
                quantity,
                price,
                message: 'Item criado com sucesso'
            });
        }
    );
});

// PUT - Atualizar item
app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;
    
    if (!name || quantity === undefined || price === undefined) {
        res.status(400).json({ error: 'Nome, quantidade e preço são obrigatórios' });
        return;
    }

    db.run('UPDATE items SET name = ?, quantity = ?, price = ? WHERE id = ?',
        [name, quantity, price, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Item não encontrado' });
                return;
            }
            res.json({ 
                id,
                name,
                quantity,
                price,
                message: 'Item atualizado com sucesso'
            });
        }
    );
});

// DELETE - Excluir item
app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Item não encontrado' });
            return;
        }
        res.json({ message: 'Item excluído com sucesso' });
    });
});

// Rota para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

// Fechar conexão com o banco ao encerrar o processo
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});

