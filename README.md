# Recruitment System

Этот проект представляет собой систему для управления рекрутингом, состоящую из бэкенда на Node.js и фронтенда на React.

## Требования

- Node.js (рекомендуется версия 16 или выше)
- PostgreSQL
- npm или yarn

## Настройка проекта

### 1. Настройка базы данных

1. Перейдите в папку `backend/config` и откройте файл `db.js`.
2. Укажите свои настройки для подключения к базе данных PostgreSQL:

   ```javascript
   const pool = new Pool({
     user: 'postgres',
     host: 'localhost',
     database: 'recruitment_system',
     password: '1111',
     port: 5432,
   });
   ```

3. Создайте базу данных в PostgreSQL с именем, указанным в `db.js`.

### 2. Установка зависимостей

1. Перейдите в папку `backend` и установите зависимости:

   ```bash
   cd backend
   npm install
   ```

2. Перейдите в папку `recruitment-system-frontend` и установите зависимости:

   ```bash
   cd ../recruitment-system-frontend
   npm install
   ```

### 3. Запуск бэкенда

1. Перейдите в папку `backend` и запустите сервер:

   ```bash
   cd backend
   node index.js
   ```

   Сервер запустится по умолчанию на `http://localhost:5000`.

### 4. Запуск фронтенда

1. Перейдите в папку `recruitment-system-frontend` и запустите фронтенд:

   ```bash
   cd recruitment-system-frontend
   npm run start
   ```

   Фронтенд запустится по умолчанию на `http://localhost:3000`.

## Использование

- Откройте браузер и перейдите по адресу `http://localhost:3000`, чтобы начать использовать приложение.
- Бэкенд будет обрабатывать запросы на `http://localhost:5000`.

---

## Структура проекта

- `backend/` — серверная часть приложения (Node.js, Express)
- `recruitment-system-frontend/` — клиентская часть приложения (React).

---

## Лицензия

Этот проект распространяется под лицензией MIT.