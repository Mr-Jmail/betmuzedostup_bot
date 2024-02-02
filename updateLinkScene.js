const { Scenes } = require("telegraf");
const { updateLink } = require("./functions");
const { URL } = require("url")

module.exports = new Scenes.WizardScene("updateLinkScene", 
    ctx => {
        ctx.reply("Please send new link").catch(err => console.log(err))
        return ctx.wizard.next()
    },
    ctx => {
        if(!ctx?.message?.text) return ctx.reply("Please use text to answer").catch(err => console.log(err))
        if(!isValidUrl(ctx.message.text)) return ctx.reply("Invalid link, the correct format is https://example.com").catch(err => console.log(err))
        var link = new URL(ctx.message.text)
        link.pathname = "tr"
        updateLink(link.href)
        ctx.reply(`Succesfuly updated. The new link is "${link}"`).catch(err => console.log(err))
        ctx.scene.leave()
    }
)

function isValidUrl(link) {
    return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(link)
}