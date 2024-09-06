const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

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
  const { tag_id } = req.query;
  let query = 'SELECT t.* FROM tasks t';
  const params = [req.user.id];

  if (tag_id) {
    query += ' JOIN task_tags tt ON t.id = tt.task_id WHERE tt.tag_id = ? AND t.user_id = ?';
    params.unshift(tag_id);
  } else {
    query += ' WHERE t.user_id = ?';
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Server error');
    }
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
app.put('/tasks/:id', authenticate, async (req, res) => {
  const { title, description, due_date, status, priority, tags } = req.body;
  const taskId = req.params.id;

  try {
    // タスクの更新
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ?, priority = ? WHERE id = ? AND user_id = ?',
        [title, description, due_date, status, priority, taskId, req.user.id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    // タグの削除
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM task_tags WHERE task_id = ?', [taskId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // タグの追加
    if (tags && tags.length > 0) {
      const tagQueries = tags.map(tagId => {
        return new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
            [taskId, tagId],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });
      });
      await Promise.all(tagQueries);
    }

    res.status(200).send('Task updated');
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).send('Server error');
  }
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

// タスク詳細取得ルート
app.get('/tasks/:id', authenticate, (req, res) => {
  db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, results) => {
      if (err) {
          console.error('Error fetching task:', err);
          return res.status(500).send('Server error');
      }
      if (results.length === 0) {
          return res.status(404).send('Task not found');
      }
      res.status(200).json(results[0]);
  });
});

// コメント取得ルート
app.get('/comments/:task_id', authenticate, (req, res) => {
  db.query('SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.task_id = ?', [req.params.task_id], (err, results) => {
      if (err) {
          console.error('Error fetching comments:', err);
          return res.status(500).send('Server error');
      }
      console.log('Fetched comments:', results);
      res.status(200).json(results);
  });
});

// コメント追加ルート
app.post('/comments', authenticate, (req, res) => {
  const { task_id, comment } = req.body;
  db.query('INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)', [task_id, req.user.id, comment], (err, result) => {
      if (err) {
          console.error('Error adding comment:', err);
          return res.status(500).send('Server error');
      }
      console.log('Comment added:', result);
      res.status(201).send('Comment added');
  });
});

// ファイルストレージ設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); // uploads フォルダにファイルを保存
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ファイル名にタイムスタンプを付ける
    }
});

const upload = multer({ storage });

// ファイルアップロードルート
app.post('/tasks/:id/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.filename;
    const taskId = req.params.id;
    
    db.query('INSERT INTO task_files (task_id, file_path) VALUES (?, ?)', [taskId, filePath], (err, result) => {
        if (err) {
            console.error('Error saving file info:', err);
            return res.status(500).send('Server error');
        }
        res.status(201).send('File uploaded');
    });
});

// ファイルダウンロードルート
app.get('/tasks/:id/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.sendFile(filePath);
});

// タスクに関連するファイルのリスト取得ルート
app.get('/tasks/:id/files', authenticate, (req, res) => {
    const taskId = req.params.id;
    db.query('SELECT * FROM task_files WHERE task_id = ?', [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching files:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).json(results);
    });
});

// タグを取得するルート
app.get('/tags', authenticate, (req, res) => {
  db.query('SELECT * FROM tags', (err, results) => {
    if (err) {
      console.error('Error fetching tags:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).json(results);
  });
});

// タグを追加するルート
app.post('/tags', authenticate, (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO tags (name) VALUES (?)', [name], (err, result) => {
    if (err) {
      console.error('Error adding tag:', err);
      return res.status(500).send('Server error');
    }
    res.status(201).send('Tag added');
  });
});

// タグを削除するルート
app.delete('/tags/:id', authenticate, (req, res) => {
  const tagId = req.params.id;

  // タグがどのタスクにも関連付けられていないか確認
  db.query('SELECT * FROM task_tags WHERE tag_id = ?', [tagId], (err, results) => {
    if (err) {
      console.error('Error checking tag associations:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      return res.status(400).send('Tag cannot be deleted because it is associated with tasks.');
    }

    // タグの削除
    db.query('DELETE FROM tags WHERE id = ?', [tagId], (err, result) => {
      if (err) {
        console.error('Error deleting tag:', err);
        return res.status(500).send('Server error');
      }
      res.status(200).send('Tag deleted');
    });
  });
});

// タスクにタグを追加するルート
app.post('/tasks/:id/tags', authenticate, (req, res) => {
  const { tag_id } = req.body;
  db.query('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [req.params.id, tag_id], (err, result) => {
    if (err) {
      console.error('Error adding tag to task:', err);
      return res.status(500).send('Server error');
    }
    res.status(201).send('Tag added to task');
  });
});

// タスクからタグを削除するルート
app.delete('/tasks/:id/tags/:tag_id', authenticate, (req, res) => {
  db.query('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?', [req.params.id, req.params.tag_id], (err, result) => {
    if (err) {
      console.error('Error removing tag from task:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send('Tag removed from task');
  });
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});