const { Scenes } = require("telegraf");
const { updateLink } = require("./functions");
const { URL } = require("url")

module.exports = new Scenes.WizardScene("updateLinkScene", 
    ctx => {
        ctx.reply("Please send new link")
        return ctx.wizard.next()
    },
    ctx => {
        if(!ctx?.message?.text) return ctx.reply("Please use text to answer")
        if(!isValidUrl(ctx.message.text)) return ctx.reply("Invalid link, the correct format is https://example.com")
        var link = new URL(ctx.message.text)
        link.pathname = "tr"
        updateLink(link)
        ctx.reply(`Succesfuly updated. The new link is "${link}"`)
    }
)

function isValidUrl(link) {
    return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(link)
}