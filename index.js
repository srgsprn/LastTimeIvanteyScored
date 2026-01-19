const { Telegraf } = require('telegraf');
require('dotenv').config();

const START_DATE = new Date('2025-01-01T00:00:00');
const PLAYER_NAME = 'Ивантей';

const bot = new Telegraf(process.env.BOT_TOKEN);

function getTimePassed(startDate) {
    const now = new Date();
    let diff = Math.abs(now - startDate);
    
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    diff -= years * 1000 * 60 * 60 * 24 * 365;
    
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    diff -= months * 1000 * 60 * 60 * 24 * 30;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    
    const seconds = Math.floor(diff / 1000);
    
    return { years, months, days, hours, minutes, seconds };
}

function formatTime(time) {
    const parts = [];
    if (time.years > 0) parts.push(`${time.years} год${getEnding(time.years, '', 'а', 'ов')}`);
    if (time.months > 0) parts.push(`${time.months} месяц${getEnding(time.months, '', 'а', 'ев')}`);
    if (time.days > 0) parts.push(`${time.days} ден${getEnding(time.days, 'ь', 'я', 'ей')}`);
    if (time.hours > 0) parts.push(`${time.hours} час${getEnding(time.hours, '', 'а', 'ов')}`);
    if (time.minutes > 0) parts.push(`${time.minutes} минут${getEnding(time.minutes, 'а', 'ы', '')}`);
    parts.push(`${time.seconds} секунд${getEnding(time.seconds, 'а', 'ы', '')}`);
    
    return parts.join(' ');
}

function getEnding(number, one, two, five) {
    n = Math.abs(number) % 100;
    if (n >= 5 && n <= 20) return five;
    n = n % 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
}

bot.command('gol', (ctx) => {
    const time = getTimePassed(START_DATE);
    const text = `Последний раз ${PLAYER_NAME} забивал ${formatTime(time)} назад`;
    ctx.reply(text);
});

bot.launch();
console.log('Бот запущен!');