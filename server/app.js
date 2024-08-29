// 必要なモジュールをインポート
const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");

// MySQLデータベースへの接続を設定
const db = mysql.createPool({
  host: "localhost", // データベースのホスト名
  user: "root", // データベースのユーザー名
  password: "rootroot", // データベースのパスワード
  database: "express_d" // 使用するデータベースの名前
});

// ミドルウェアを設定
app.use(express.json()); // JSONデータを解析するミドルウェア
app.use(cors()); // CORSを許可するミドルウェア

// ユーザーのデータを取得するためのGETリクエストハンドラー
app.get("/api/get/users", (req, res) => {
  const sqlSelect = "SELECT * FROM users ORDER BY id"; // SQLクエリで全ユーザーをID順に取得
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.error(err); // エラーがあればコンソールに表示
      res.status(500).send("Error retrieving users from the database"); // エラーメッセージを返す
    } else {
      res.send(result); // 取得したユーザー情報を返す
    }
  });
});

// 新しいユーザーを追加するためのPOSTリクエストハンドラー
app.post("/api/insert/user", (req, res) => {
  const { name, email } = req.body; // リクエストボディからnameとemailを取得
  const sqlInsert = "INSERT INTO users (name, email) VALUES (?, ?)"; // SQLクエリで新しいユーザーを追加
  db.query(sqlInsert, [name, email], (err, result) => {
    if (err) {
      console.error(err); // エラーがあればコンソールに表示
      res.status(500).send("Failed to insert new user"); // エラーメッセージを返す
    } else {
      res.status(200).send("User added successfully"); // 成功メッセージを返す
    }
  });
});

// サーバーをポート3001で起動
app.listen(3001, () => {
  console.log('Server running on port 3001');
});
