const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'sua_chave_secreta_jwt_aqui';

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    `);
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    stmt.run(name, email, hashedPassword, function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao registrar usuário.' });
        }
        
        const token = jwt.sign({ id: this.lastID }, SECRET_KEY, { expiresIn: '24h' });
        res.status(201).json({ token, name });
    });
    stmt.finalize();
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ token: null, error: 'Senha inválida.' });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
        res.status(200).json({ token, name: user.name });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});