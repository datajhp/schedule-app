const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL 연결 (Supabase connection string 사용)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Supabase requires SSL
  }
});

// DB 초기화: schedules 테이블 생성
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      datetime TIMESTAMP NOT NULL,
      type TEXT NOT NULL,
      completed BOOLEAN DEFAULT false
    );
  `);
  console.log('Postgres schedules table ensured.');
})();

// 일정 조회
app.get('/api/schedules', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedules ORDER BY datetime ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching schedules');
  }
});

// 일정 추가
app.post('/api/schedules', async (req, res) => {
  const { title, datetime, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO schedules (title, datetime, type) VALUES ($1, $2, $3) RETURNING *',
      [title, datetime, type]
    );

    // 메일 알림
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_NOTIFY_TO,
      subject: '📅 새 일정 추가 알림',
      text: `제목: ${title}\n날짜: ${datetime}\n유형: ${type}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error('메일 발송 실패:', error);
      else console.log('메일 발송 성공:', info.response);
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding schedule');
  }
});

// 일정 수정
app.patch('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  const { title, datetime, type } = req.body;
  try {
    await pool.query(
      'UPDATE schedules SET title = $1, datetime = $2, type = $3 WHERE id = $4',
      [title, datetime, type, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating schedule');
  }
});

// 완료 상태 토글
app.patch('/api/schedules/:id/completed', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    await pool.query(
      'UPDATE schedules SET completed = $1 WHERE id = $2',
      [completed, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error toggling completed');
  }
});

// 일정 삭제
app.delete('/api/schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting schedule');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
