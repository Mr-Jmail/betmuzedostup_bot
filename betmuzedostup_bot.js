const path = require("path")
require("dotenv").config({path: path.join(__dirname, ".env")})
const { Telegraf, Scenes, session } = require("telegraf")
const bot = new Telegraf(process.env.botToken)
const chatIdToSendMessage = -4096151300
// const chatIdToSendMessage = 1386450473
const { getLink, updateLink } = require("./functions")

const updateLinkScene = require("./updateLinkScene")
const siteIsBlocked = require("./siteIsBlocked")

const stage = new Scenes.Stage([updateLinkScene])

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => ctx.reply("To see what link is checking now use /get_link\nTo update link use /update_link").catch(err => console.log(err)))

bot.command("get_link", ctx => ctx.reply(`Actual link is: "${getLink()}"`).catch(err => console.log(err)))

bot.command("update_link", ctx => ctx.scene.enter("updateLinkScene"))

bot.command("get_id", ctx => ctx.reply(ctx.chat.id.toString()).catch(err => console.log(err)))

setInterval(async() => {
    const url = getLink()
    if(url == "") return
    if(!await siteIsBlocked(url).catch(err => console.log(err))) return
    await bot.telegram.sendMessage(chatIdToSendMessage, `⛔️Site "${url}" was blocked. To update the link use /update_link`).catch(err => console.log(err))
    updateLink("")
}, 1000 * 60 * 5);

bot.launch()