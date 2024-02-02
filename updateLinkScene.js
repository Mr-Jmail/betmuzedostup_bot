const { Scenes } = require("telegraf");
const { updateLink } = require("./functions");
const { URL } = require("url")

module.exports = new Scenes.WizardScene("updateLinkScene", 
    ctx => {
        ctx.reply("Введите новую ссылку")
        return ctx.wizard.next()
    },
    ctx => {
        if(!ctx?.message?.text) return ctx.reply("Отправьте ответ текстом")
        if(!isValidUrl(ctx.message.text)) return ctx.reply("Ссылка не действительна, отправьте ссылку в формате https://example.com")
        var link = new URL(ctx.message.text)
        link.pathname = "tr"
        updateLink(link)
        ctx.reply(`Ссылка успешно обновлена на "${link}"`)
    }
)

function isValidUrl(link) {
    return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(link)
}