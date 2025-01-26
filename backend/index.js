const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Роуты
const competitionsRouter = require('./routes/competitions');
const testsRouter = require('./routes/tests');
const authRouter = require('./routes/auth');
const testHistoryRouter = require('./routes/testHistory');
const reviewsRouter = require('./routes/reviews'); // Добавляем импорт

app.use('/api/competitions', competitionsRouter);
app.use('/api/tests', testsRouter);
app.use('/api/auth', authRouter);
app.use('/api/test-history', testHistoryRouter);
app.use('/api/reviews', reviewsRouter); // Регистрируем новый роут

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});