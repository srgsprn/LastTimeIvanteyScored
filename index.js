const { Telegraf } = require('telegraf');
const express = require('express');
const http = require('http');

const START_DATE = new Date('2025-01-01T00:00:00');
const PLAYER_NAME = 'Ивантей';

// Получаем токен
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('❌ ОШИБКА: BOT_TOKEN не найден!');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// Middleware для логирования
app.use(express.json());

// Keep-alive endpoint
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Бот Ивайтея</title>
            <meta http-equiv="refresh" content="300">
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                .status { color: green; font-size: 24px; }
            </style>
        </head>
        <body>
            <h1>🤖 Бот Ивайтея работает!</h1>
            <p class="status">✅ Статус: Активен</p>
            <p>Последний гол был забит: 01.01.2025</p>
            <p>Используйте команду /gol в Telegram</p>
            <p>Страница обновляется каждые 5 минут для поддержания активности</p>
        </body>
        </html>
    `);
});

// Health check для мониторинга
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        bot: 'active'
    });
});

// Ping endpoint
app.get('/ping', (req, res) => {
    console.log('Ping received at', new Date().toISOString());
    res.send('pong');
});

// Расчет времени
function calculateTimePassed() {
    const now = new Date();
    const diff = now - START_DATE;
    
    const totalSeconds = Math.floor(diff / 1000);
    const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
    let remaining = totalSeconds % (365 * 24 * 60 * 60);
    
    const months = Math.floor(remaining / (30 * 24 * 60 * 60));
    remaining = remaining % (30 * 24 * 60 * 60);
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    remaining = remaining % (24 * 60 * 60);
    
    const hours = Math.floor(remaining / (60 * 60));
    remaining = remaining % (60 * 60);
    
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    return { years, months, days, hours, minutes, seconds };
}

function formatTime(time) {
    const parts = [];
    if (time.years > 0) parts.push(`${time.years} ${getNoun(time.years, 'год', 'года', 'лет')}`);
    if (time.months > 0) parts.push(`${time.months} ${getNoun(time.months, 'месяц', 'месяца', 'месяцев')}`);
    if (time.days > 0) parts.push(`${time.days} ${getNoun(time.days, 'день', 'дня', 'дней')}`);
    if (time.hours > 0) parts.push(`${time.hours} ${getNoun(time.hours, 'час', 'часа', 'часов')}`);
    if (time.minutes > 0) parts.push(`${time.minutes} ${getNoun(time.minutes, 'минута', 'минуты', 'минут')}`);
    parts.push(`${time.seconds} ${getNoun(time.seconds, 'секунда', 'секунды', 'секунд')}`);
    
    return parts.join(' ');
}

function getNoun(number, one, two, five) {
    const n = Math.abs(number);
    if (n % 10 === 1 && n % 100 !== 11) return one;
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return two;
    return five;
}

// Команды бота
bot.command('start', (ctx) => {
    ctx.reply(`⚽ Привет! Я отслеживаю, сколько времени прошло с последнего гола ${PLAYER_NAME}.\n\nКоманды:\n/gol - узнать время\n/help - помощь\n/status - статус бота`);
});

bot.command('gol', (ctx) => {
    const time = calculateTimePassed();
    const text = `⏰ Последний раз ${PLAYER_NAME} забивал ${formatTime(time)} назад`;
    ctx.reply(text);
});

bot.command('status', (ctx) => {
    ctx.reply(`✅ Бот активен!\n🕐 Работает с: ${new Date().toLocaleString('ru-RU')}\n🌐 Replit URL: ${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'Неизвестно'}`);
});

bot.command('help', (ctx) => {
    ctx.reply('📋 Доступные команды:\n/start - начать\n/gol - узнать время с последнего гола\n/status - статус бота\n/help - помощь');
});

// Запуск
const PORT = process.env.PORT || 3000;

// Запускаем сервер
const server = app.listen(PORT, () => {
    console.log(`🌐 HTTP сервер запущен на порту ${PORT}`);
    console.log(`👉 Откройте: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});

// Запускаем бота
bot.launch()
    .then(() => {
        console.log('🤖 Telegram бот запущен!');
        console.log(`👤 Бот: @${bot.botInfo.username}`);
    })
    .catch(err => {
        console.error('❌ Ошибка запуска бота:', err);
        server.close();
    });

// Keep-alive пинг каждые 5 минут
setInterval(() => {
    const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/ping`;
    fetch(url).catch(() => {});
    console.log('🔄 Keep-alive ping отправлен:', new Date().toLocaleTimeString());
}, 5 * 60 * 1000); // 5 минут

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));