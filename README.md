# Телефонная книга(внешний сервис для районов) с использованием технологий MongoDB и Mongoose с Next.js

Данная телефонная книга использует базу данных MongoDB в Next.js приложении.

**Телефонная книга** приложение позволяющее пользователям районов добавлять/удалять и редактировать информацию в телефонной книги организации (можно редактировать такие поля как ФИО, должность, городской номер телефона, мобильный номер телефона, структурное подразделение(управление, отдел, сектор, руководство администрации)). Аутентификация происходит по e-mail адресу организации(в ответ приходит письмо с одноразовой ссылкой для входа). Приложение имеет модуль парсинга и преобразования мобильных телефонных номеров из украинской кодировки телефонов +380 в кодировку телефонов РФ +7(модуль xlsxParser)

## Конфигурация

### Шаг 1. Получите строку подключения к вашему MongoDB серверу

В случае с MongoDB Atlas, это должна быть строка типа:

```
mongodb+srv://<username>:<password>@my-project-abc123.mongodb.net/test?retryWrites=true&w=majority
```

Для больших деталей, следуйте [MongoDB Guide](https://docs.mongodb.com/guides/server/drivers/) как подключиться к MongoDB.

### Шаг 2. Задайте переменные окружения

Создайте файл `.env.local` (который будет проигнорирован Git):

Потом установите каждую переменную(MONGODB_URI,
SMTP_USER, SMTP_PASS, APP_URL, и ENC_KEY) в `.env.local`:

- `MONGODB_URI` should be the MongoDB connection string you got from step 1.

### Шаг 3. Запустите Next.js в режиме разработки

```bash
npm install
npm run dev

# or

yarn install
yarn dev
```

Приложение должно подняться и запуститься на [http://localhost:3000](http://localhost:3000)! 