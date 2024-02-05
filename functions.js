const fs = require("fs")
const path = require("path")
const linkFilePath = path.join(__dirname, "linkToParse.json")

function getLink() {
    return JSON.parse(fs.readFileSync(linkFilePath, "utf-8"))
}

function updateLink({newLink, numberOfErrors}) {
    fs.writeFileSync(linkFilePath, JSON.stringify({ url: newLink, numberOfErrors }, null, 4), "utf-8")
}

module.exports = { getLink, updateLink }