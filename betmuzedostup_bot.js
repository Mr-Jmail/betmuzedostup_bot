const path = require("path")
require("dotenv").config({path: path.join(__dirname, ".env")})
const { Telegraf, Scenes, session } = require("telegraf")
const bot = new Telegraf(process.env.botToken)
const chatIdToSendMessage = -4096151300
const fetch = require("node-fetch")
const fs = require("fs")

const updateLinkScene = require("./updateLinkScene")
const { getLink, updateLink } = require("./functions")

const stage = new Scenes.Stage([updateLinkScene])

bot.use(session())
bot.use(stage.middleware())

bot.start(ctx => ctx.reply("To see what link is checking now use /getLink\nTo update link use /updateLink").catch(err => console.log(err)))

bot.command("getLink", ctx => ctx.reply(`Actual link is: "${getLink().url}"`).catch(err => console.log(err)))

bot.command("updateLink", ctx => ctx.scene.enter("updateLinkScene"))

bot.command("getId", ctx => {
    ctx.reply(ctx.chat.id.toString()).catch(err => console.log(err))
    console.log(ctx.from.username)
})

bot.command("sendRequest", async ctx => {
    var response = await fetch("https://www.betmuze5.com/tr")
    console.log(response.status)
    console.log(response)
    fs.writeFileSync(path.join(__dirname, "index.html"), JSON.stringify(await response.text()), "utf-8")
    await ctx.replyWithDocument({source: path.join(__dirname, "index.html")})
})

setInterval(async() => {
    var { url, numberOfErrors } = getLink()
    if(url == "") return
    var response = await sendRequest(url)
    if(response.status == 200) return updateLink({newLink: url, numberOfErrors: 0})
    fs.writeFileSync(path.join(__dirname, "index.html"), JSON.stringify(await response.text() + "\n\nStatus:" + response.status, null, 4), "utf-8")
    await bot.telegram.sendDocument(1386450473, {source: path.join(__dirname, "index.html")}).catch(err => console.log(err))
    console.log(`numberOfErrors: ${numberOfErrors}`)
    if(numberOfErrors < 1) return updateLink({newLink: url, numberOfErrors: numberOfErrors += 1})
    updateLink({newLink: "", numberOfErrors: 0})
    await bot.telegram.sendMessage(chatIdToSendMessage, `⛔️Site "${url}" was blocked. To update the link use /updateLink`).catch(err => console.log(err))
}, 1000 * 60 * 1);

async function sendRequest(url) {
    var response = await fetch(url, {method: "get"})
    return response
}



bot.launch()