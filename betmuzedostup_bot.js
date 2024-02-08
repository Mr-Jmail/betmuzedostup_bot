const path = require("path")
require("dotenv").config({path: path.join(__dirname, ".env")})
const { Telegraf, Scenes, session } = require("telegraf")
const bot = new Telegraf(process.env.botToken)
// const chatIdToSendMessage = -4096151300
const chatIdToSendMessage = 1386450473
const { getLink, updateLink } = require("./functions")

const updateLinkScene = require("./updateLinkScene")
const siteIsBlocked = require("./siteIsBlocked")

const stage = new Scenes.Stage([updateLinkScene])

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => ctx.reply("To see what link is checking now use /getLink\nTo update link use /updateLink").catch(err => console.log(err)))

bot.command("getLink", ctx => ctx.reply(`Actual link is: "${getLink()}"`).catch(err => console.log(err)))

bot.command("updateLink", ctx => ctx.scene.enter("updateLinkScene"))

bot.command("getId", ctx => ctx.reply(ctx.chat.id.toString()).catch(err => console.log(err)))

setInterval(async() => {
// ;(async function() {
    const url = getLink()
    if(url == "") return
    if(!await siteIsBlocked(url)) return
    await bot.telegram.sendMessage(chatIdToSendMessage, `⛔️Site "${url}" was blocked. To update the link use /updateLink`).catch(err => console.log(err))
    updateLink("")
// })()
}, 1000 * 60 * 5);

bot.launch()