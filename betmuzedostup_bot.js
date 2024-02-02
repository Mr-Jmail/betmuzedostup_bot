const path = require("path")
require("dotenv").config({path: path.join(__dirname, ".env")})
const { Telegraf, Scenes, session } = require("telegraf")
const bot = new Telegraf(process.env.botToken)
const chatIdToSendMessage = -4096151300
const fetch = require("node-fetch")

const updateLinkScene = require("./updateLinkScene")
const { getLink, updateLink } = require("./functions")

const stage = new Scenes.Stage([updateLinkScene])

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => ctx.reply("To see what link is checking now use /getLink\nTo update link use /updateLink").catch(err => console.log(err)))

bot.command("getLink", ctx => ctx.reply(`Actual link is: "${getLink()}"`).catch(err => console.log(err)))

bot.command("updateLink", ctx => ctx.scene.enter("updateLinkScene"))

bot.command("getId", ctx => {
    ctx.reply(ctx.chat.id.toString()).catch(err => console.log(err))
    console.log(ctx.from.username)
})

setInterval(async() => {
    var url = getLink()
    if(url == "") return
    var status = await sendRequest(url)
    if(status == 200) return
    updateLink("")
    bot.telegram.sendMessage(chatIdToSendMessage, `⛔️Site "${url}" was blocked. To update the link use /updateLink`).catch(err => console.log(err))
}, 1000 * 60 * 1);

async function sendRequest(url) {
    var response = await fetch(url, {method: "get"})
    return response.status
}

bot.launch()