const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
          if (err) {
              console.error('Database query error:', err);
              return res.status(500).send('Server error');
          }
          res.status(201).send('User registered');
      });
  } catch (err) {
      console.error('Error hashing password:', err);
      res.status(500).send('Server error');
  }
});
// ユーザーログインルート
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt with:', { username, password });

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) {
          console.error('Database query error:', err);
          return res.status(500).send('Server error');
      }
      console.log('Database query results:', results);

      if (results.length === 0) {
          console.log('No user found with username:', username);
          return res.status(401).send('Incorrect username or password');
      }

      const user = results[0];
      
      // パスワードを比較
      try {
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
              console.log('Password mismatch for user:', username);
              return res.status(401).send('Incorrect username or password');
          }
          // トークンを生成
          const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
          console.log('Login successful for user:', username);
          res.status(200).json({ token });
      } catch (err) {
          console.error('Error comparing password:', err);
          res.status(500).send('Server error');
      }
  });
});
// 認証ミドルウェア
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
      console.log('No authorization header present');
      return res.status(401).send('Access denied');
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).send('Access denied');
  }
  try {
      const decoded = jwt.verify(token, 'secretkey');
      req.user = decoded;
      next();
  } catch (err) {
      console.error('Invalid token:', err);
      res.status(400).send('Invalid token');
  }
};

// タスク取得ルート
app.get('/tasks', authenticate, (req, res) => {
  db.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY FIELD(priority, "high", "medium", "low")', [req.user.id], (err, results) => {
      if (err) {
          console.error('Error fetching tasks:', err);
          return res.status(500).send('Server error');
      }
      console.log('Fetched tasks:', results);
      res.status(200).json(results);
  });
});
// タスク作成ルート
app.post('/tasks', authenticate, (req, res) => {
  const { title, description, due_date, priority } = req.body;
  db.query('INSERT INTO tasks (user_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?)', [req.user.id, title, description, due_date, priority], (err, result) => {
      if (err) {
          console.error('Error creating task:', err);
          return res.status(500).send('Server error');
      }
      console.log('Task created:', result);
      res.status(201).send('Task created');
  });
});
// タスク編集ルート
app.put('/tasks/:id', authenticate, (req, res) => {
  const { title, description, due_date, status, priority } = req.body;
  db.query('UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ?, priority = ? WHERE id = ? AND user_id = ?', [title, description, due_date, status, priority, req.params.id, req.user.id], (err, result) => {
      if (err) {
          console.error('Error updating task:', err);
          return res.status(500).send('Server error');
      }
      console.log('Task updated:', result);
      res.status(200).send('Task updated');
  });
});
// タスク削除ルート
app.delete('/tasks/:id', authenticate, (req, res) => {
  db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, result) => {
      if (err) {
          console.error('Error deleting task:', err);
          return res.status(500).send('Server error');
      }
      console.log('Task deleted:', result);
      res.status(200).send('Task deleted');
  });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Server error');
});


app.listen(3001, () => {
    console.log('Server running on port 3001');
});

