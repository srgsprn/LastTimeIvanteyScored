const { Telegraf } = require('telegraf');
const express = require('express');
require('dotenv').config();

// Константы
const START_DATE = new Date('2024-10-05T00:00:00'); // Новая точка отсчета
const PLAYER_NAME = 'Ивантей';

// Проверка токена
if (!process.env.BOT_TOKEN) {
    console.error('❌ ОШИБКА: BOT_TOKEN не найден в .env файле!');
    console.error('Создайте файл .env и добавьте: BOT_TOKEN=ваш_токен');
    process.exit(1);
}

// Инициализация
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Keep-alive для Replit/Render
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>⚽ Бот Ивайтея</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    text-align: center;
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    margin: 0;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 600px;
                }
                h1 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                }
                .emoji {
                    font-size: 3em;
                    animation: bounce 2s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .status {
                    font-size: 1.2em;
                    margin: 20px 0;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 15px;
                    border-radius: 10px;
                }
                .command {
                    background: white;
                    color: #333;
                    padding: 10px 20px;
                    border-radius: 10px;
                    margin: 10px;
                    display: inline-block;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 0.9em;
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="emoji">⚽</div>
                <h1>⚽ Бот Ивайтея</h1>
                <div class="status">
                    <p><strong>✅ Статус:</strong> Бот активен и работает</p>
                    <p><strong>📅 Последний гол:</strong> 05.10.2024</p>
                    <p><strong>⏰ Текущее время:</strong> <span id="currentTime">${new Date().toLocaleString('ru-RU')}</span></p>
                </div>
                <p>Используйте команду в Telegram:</p>
                <div class="command">/gol</div>
                <p>чтобы узнать, сколько времени прошло с последнего гола ${PLAYER_NAME}</p>
                <div class="footer">
                    <p>Бот автоматически обновляется для поддержания активности</p>
                    <p>Страница обновляется каждые 4 минуты</p>
                </div>
            </div>
            <script>
                // Обновление времени
                function updateTime() {
                    document.getElementById('currentTime').textContent = new Date().toLocaleString('ru-RU');
                }
                setInterval(updateTime, 1000);
                
                // Авто-обновление страницы каждые 4 минуты (для keep-alive)
                setTimeout(() => location.reload(), 240000);
            </script>
        </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'active',
        bot: PLAYER_NAME,
        last_goal: START_DATE.toISOString(),
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Функция для расчета прошедшего времени
function calculateTimeSinceGoal() {
    const now = new Date();
    const start = new Date(START_DATE);
    
    // Разница в миллисекундах
    let diff = now.getTime() - start.getTime();
    
    // Рассчитываем компоненты времени
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // Года (приблизительно)
    const years = Math.floor(days / 365);
    const remainingDaysAfterYears = days % 365;
    
    // Месяцы (приблизительно)
    const months = Math.floor(remainingDaysAfterYears / 30);
    const remainingDaysAfterMonths = remainingDaysAfterYears % 30;
    
    // Оставшиеся дни
    const remainingDays = remainingDaysAfterMonths;
    
    // Оставшиеся часы
    const remainingHours = hours % 24;
    
    // Оставшиеся минуты
    const remainingMinutes = minutes % 60;
    
    // Оставшиеся секунды
    const remainingSeconds = seconds % 60;
    
    return {
        years: years,
        months: months,
        days: remainingDays,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds
    };
}

// Функция для правильного склонения
function getNoun(number, one, two, five) {
    const n = Math.abs(number);
    
    if (n % 10 === 1 && n % 100 !== 11) {
        return one;
    }
    
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) {
        return two;
    }
    
    return five;
}

// Функция форматирования времени (точно по формату)
function formatTime(timeObj) {
    const parts = [];
    
    // Добавляем только не нулевые значения
    if (timeObj.years > 0) {
        parts.push(`${timeObj.years} ${getNoun(timeObj.years, 'год', 'года', 'лет')}`);
    }
    
    if (timeObj.months > 0) {
        parts.push(`${timeObj.months} ${getNoun(timeObj.months, 'месяц', 'месяца', 'месяцев')}`);
    }
    
    if (timeObj.days > 0) {
        parts.push(`${timeObj.days} ${getNoun(timeObj.days, 'день', 'дня', 'дней')}`);
    }
    
    if (timeObj.hours > 0) {
        parts.push(`${timeObj.hours} ${getNoun(timeObj.hours, 'час', 'часа', 'часов')}`);
    }
    
    if (timeObj.minutes > 0) {
        parts.push(`${timeObj.minutes} ${getNoun(timeObj.minutes, 'минута', 'минуты', 'минут')}`);
    }
    
    // Секунды всегда добавляем
    parts.push(`${timeObj.seconds} ${getNoun(timeObj.seconds, 'секунда', 'секунды', 'секунд')}`);
    
    // Форматируем с "и" перед последним элементом (как в примере)
    if (parts.length === 1) {
        return parts[0];
    }
    
    const lastPart = parts.pop();
    return parts.join(' ') + ' и ' + lastPart;
}

// Команда /start
bot.command('start', (ctx) => {
    const welcomeMessage = `⚽ Привет! Я бот, который отслеживает время с последнего гола ${PLAYER_NAME}!\n\n` +
                          `📅 Последний гол был забит: 05.10.2024\n\n` +
                          `Доступные команды:\n` +
                          `/gol - узнать, сколько времени прошло\n` +
                          `/info - информация о боте\n` +
                          `/help - помощь\n\n` +
                          `⚽ Используй /gol чтобы начать!`;
    
    ctx.reply(welcomeMessage);
});

// Основная команда /gol
bot.command('gol', (ctx) => {
    try {
        const timePassed = calculateTimeSinceGoal();
        const formattedTime = formatTime(timePassed);
        
        // Создаем сообщение в точном формате
        const message = `последний раз ${PLAYER_NAME} забивал ${formattedTime}`;
        
        ctx.reply(message);
    } catch (error) {
        console.error('Ошибка при расчете времени:', error);
        ctx.reply(`Произошла ошибка при расчете времени. Попробуйте позже.`);
    }
});

// Команда /info
bot.command('info', (ctx) => {
    const infoMessage = `⚽ Информация о боте:\n\n` +
                       `• Футболист: ${PLAYER_NAME}\n` +
                       `• Точка отсчета: 05.10.2024\n` +
                       `• Текущая дата: ${new Date().toLocaleDateString('ru-RU')}\n` +
                       `• Время работы: ${Math.floor(process.uptime() / 3600)} часов\n\n` +
                       `Используйте /gol чтобы узнать точное время с последнего гола`;
    
    ctx.reply(infoMessage);
});

// Команда /help
bot.command('help', (ctx) => {
    const helpMessage = `⚽ Помощь по командам:\n\n` +
                       `/start - начать работу с ботом\n` +
                       `/gol - основная команда, показывает время с последнего гола\n` +
                       `/info - информация о боте\n` +
                       `/help - эта справка\n\n` +
                       `⚽ Бот автоматически обновляется каждые 4 минуты`;
    
    ctx.reply(helpMessage);
});

// Обработка простых сообщений
bot.on('text', (ctx) => {
    const text = ctx.message.text.toLowerCase();
    
    if (text.includes('ивантей') || text.includes('гол') || text.includes('goal') || text.includes('футбол')) {
        ctx.reply(`⚽ Используйте команду /gol чтобы узнать время с последнего гола!`);
    }
});

// Запуск HTTP сервера (для keep-alive)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`⚽ HTTP сервер запущен на порту ${PORT}`);
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log(`⚽ Бот запущен успешно!`);
        console.log(`🤖 Имя бота: @${bot.botInfo.username}`);
        console.log(`📅 Точка отсчета: ${START_DATE.toLocaleDateString('ru-RU')}`);
        console.log(`⏰ Текущее время: ${new Date().toLocaleString('ru-RU')}`);
        console.log(`🌐 Web URL: http://localhost:${PORT}`);
        
        // Автоматический keep-alive (если на Replit/Render)
        if (process.env.REPL_ID || process.env.RENDER) {
            console.log('🔄 Keep-alive активирован');
            setInterval(() => {
                require('https').get(`http://localhost:${PORT}/health`, () => {
                    console.log(`✅ Keep-alive ping: ${new Date().toLocaleTimeString('ru-RU')}`);
                }).on('error', () => {});
            }, 240000); // Каждые 4 минуты
        }
    })
    .catch((err) => {
        console.error('❌ Ошибка запуска бота:', err);
    });

// Graceful shutdown
process.once('SIGINT', () => {
    console.log('\n⚽ Завершение работы бота...');
    bot.stop('SIGINT');
    process.exit(0);
});

process.once('SIGTERM', () => {
    console.log('\n⚽ Завершение работы бота...');
    bot.stop('SIGTERM');
    process.exit(0);
});