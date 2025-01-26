const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'recruitment_system',
  password: '1111',
  port: 5432,
});

module.exports = pool;