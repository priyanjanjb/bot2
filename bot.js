const TelegramBot = require("node-telegram-bot-api");
const { connectToDB } = require("./connectMongo");

const token = process.env.botToken;
const bot = new TelegramBot(token);
let mongoClient; // Declare the variable outside functions to keep track of the database connection
let awaitingStockNumber = false; // Variable to track whether the bot is waiting for a stock number
let awaitingContractNumber = false; // Variable to track whether the bot is waiting for a stock number
async function initMongo() {
  try {
    mongoClient = await connectToDB("chatBot", "chatData");
    console.log("initMongo is ok:");
    return mongoClient;
  } catch (e) {
    console.log("Error connecting to MongoDB:", e);
  }
}
/// The handleMessage function is the same as in the previous example
async function handleMessage(msg) {
  try {
    const chatId = msg.chat.id;
    const message = msg.text;
    console.log(message);

    if (!mongoClient) {
      await initMongo();
    }

    if (mongoClient) {
      switch (message) {
        case "/start":
          bot.sendMessage(
            chatId,
            `Welcome to the bot
                   You can type /help to get help
                   You can type /about to know about the bot
                   You can type /stockNumber to save the stock number
                   You can type /contractNumber to save the stock number`
          );
          break;
        case "/help":
          bot.sendMessage(chatId, "How can I help you?");
          bot.sendMessage(
            chatId,
            `     You can type /start to start the bot
                   You can type /help to get help
                   You can type /about to know about the bot
                   You can type /stockNumber to save the stock number
                   You can type /contractNumber to save the stock number`
          );
          break;
        case "/about":
          bot.sendMessage(
            chatId,
            "I am a bot created by black. i can help you to save the stock number and contract number"
          );
          break;
        case "/stockNumber":
          awaitingStockNumber = true;
          bot.sendMessage(chatId, "Enter the stock number");
          break;

        case "/contractNumber":
          awaitingContractNumber = true; // Set the flag to indicate that we're waiting for a contract number
          bot.sendMessage(chatId, "Enter the contract number");
          break;
        default:
          if (awaitingStockNumber) {
            // Handle the stock number input
            bot.sendMessage(chatId, `Saving stock number: ${message}`);
            mongoClient.collection.insertOne({ chatId, stockNumber: message });
            awaitingStockNumber = false; // Reset the flag after processing the stock number
          } else if (awaitingContractNumber) {
            // Handle the stock number input
            bot.sendMessage(chatId, `Saving contract number: ${message}`);
            mongoClient.collection.insertOne({
              chatId,
              contractNumber: message,
            });
            awaitingContractNumber = false; // Reset the flag after processing the stock number
          } else {
            bot.sendMessage(chatId, "I don't understand");
          }
      }
    }
  } catch (e) {
    console.log("Error handling message:", e);
  }
}

async function startBot() {
  await initMongo();
  console.log("mongoClient is ok:");
  if (mongoClient) {
    bot.on("message", handleMessage); // Handle messages
    bot.startPolling(); // Create a bot that uses 'polling' to fetch new updates
  } else {
    console.error("Bot cannot start due to MongoDB connection error");
  }
}

startBot(); // Start the bot
