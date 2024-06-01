const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const botToken = '7117763556:AAFS2w53KzWM846zmcuk316sUygukhaVFhw'; // Replace with your Telegram bot token
const bot = new TelegramBot(botToken, { polling: false });

const admins = ["1909671536", "6920954573"]; // List of admins

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit-form', (req, res) => {
    console.log('Form submitted:', req.body);

    const message = `
    New form submission:
    First Name: ${req.body.first_name}
    Last Name: ${req.body.last_name}
    Phone Number: ${req.body.phone_number}
    WhatsApp Number: ${req.body.whatsapp_number}
    Email: ${req.body.email}
    Skills and Abilities: ${req.body.explain_summary}
    District: ${req.body.district}
    `;

    // Send the message to both chat IDs
    Promise.all([
        bot.sendMessage('1909671536', message),
        bot.sendMessage('6920954573', message)
    ])
    .then(() => {
        console.log('Form data sent to Telegram bot successfully');
        res.json({ success: true }); // Indicate success in the response
    })
    .catch((error) => {
        console.error('Error sending form data to Telegram bot:', error.message);
        res.status(500).json({ success: false }); // Indicate failure in the response
    });
});
bot.onText(/\/allow (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const requester = msg.from.username;
    const allowedUser = match[1];

    if (admins.includes(requester)) {
        // Add logic to grant access to allowedUser
        bot.sendMessage(chatId, `${allowedUser} has been granted access to view submissions.`);
    } else {
        bot.sendMessage(chatId, "You do not have permission to perform this action.");
    }
});

bot.onText(/\/revoke (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const requester = msg.from.username;
    const revokedUser = match[1];

    if (admins.includes(requester)) {
        // Add logic to revoke access from revokedUser
        bot.sendMessage(chatId, `${revokedUser}'s access to view submissions has been revoked.`);
    } else {
        bot.sendMessage(chatId, "You do not have permission to perform this action.");
    }
});

bot.onText(/\/all/, (msg) => {
    const chatId = msg.chat.id;
    const requester = msg.from.username;

    if (admins.includes(requester)) {
        // Add logic to fetch and display all past submissions
        bot.sendMessage(chatId, "Here are all the past submissions:");
        // Example: bot.sendMessage(chatId, JSON.stringify(allSubmissions, null, 2));
    } else {
        bot.sendMessage(chatId, "You do not have permission to perform this action.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
