const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'task_manager'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

// ユーザー登録ルート
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send('User registered');
    });
});

// ユーザーログインルート
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(401).send('Incorrect username or password');
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('Incorrect username or password');
        }
        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

// 認証ミドルウェア
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

// タスク取得ルート
app.get('/tasks', authenticate, (req, res) => {
    db.query('SELECT * FROM tasks WHERE user_id = ?', [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).json(results);
    });
});

// タスク作成ルート
app.post('/tasks', authenticate, (req, res) => {
    const { title, description, due_date } = req.body;
    db.query('INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)', [req.user.id, title, description, due_date], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send('Task created');
    });
});

// タスク編集ルート
app.put('/tasks/:id', authenticate, (req, res) => {
    const { title, description, due_date, status } = req.body;
    db.query('UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ? AND user_id = ?', [title, description, due_date, status, req.params.id, req.user.id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send('Task updated');
    });
});

// タスク削除ルート
app.delete('/tasks/:id', authenticate, (req, res) => {
    db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send('Task deleted');
    });
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});

