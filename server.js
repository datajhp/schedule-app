const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./schedule.db');

app.use(express.json());
app.use(cors());

// DB 초기화
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS schedules (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, datetime TEXT, completed INTEGER DEFAULT 0)");
});

// 일정 추가
app.post('/api/schedules', (req, res) => {
  const { title, datetime } = req.body;
  db.run("INSERT INTO schedules (title, datetime, completed) VALUES (?, ?, 0)", [title, datetime], function(err) {
    if (err) return res.status(500).send(err);
    res.json({ id: this.lastID });
  });
});

// 일정 조회
app.get('/api/schedules', (req, res) => {
  db.all("SELECT * FROM schedules", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// 일정 삭제
app.delete('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM schedules WHERE id = ?", id, (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// 일정 수정
app.patch('/api/schedules/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  db.run("UPDATE schedules SET title = ? WHERE id = ?", [title, id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// 완료 상태 토글
app.patch('/api/schedules/:id/completed', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  db.run("UPDATE schedules SET completed = ? WHERE id = ?", [completed, id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
