const path = require("path")
require("dotenv").config({path: path.join(__dirname, ".env")})
const { Telegraf, Scenes, session } = require("telegraf")
const bot = new Telegraf(process.env.botToken)
const chatIdToSendMessage = 1386450473
const fetch = require("node-fetch")

const updateLinkScene = require("./updateLinkScene")
const { getLink, updateLink } = require("./functions")

const stage = new Scenes.Stage([updateLinkScene])

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => ctx.reply("Если хотите обновить ссылку используйте команду /updateLink"))

bot.command("updateLink", ctx => ctx.scene.enter("updateLinkScene"))

setInterval(async() => {
    var url = getLink()
    if(url == "") return
    var status = await sendRequest(url)
    if(status == 200) return
    updateLink("")
    bot.telegram.sendMessage(chatIdToSendMessage, `Сайт "${url}" заблокирован. Чтобы обновить ссылку используйте команду /updateLink`)
}, 1000 * 60 * 5);

async function sendRequest(url) {
    var response = await fetch(url, {method: "get"})
    return response.status
}

bot.launch()