const fs = require("fs")
const path = require("path")
const linkFilePath = path.join(__dirname, "linkToParse.txt")

function getLink() {
    return fs.readFileSync(linkFilePath, "utf-8")
}

function updateLink(newLink) {
    fs.writeFileSync(linkFilePath, newLink, "utf-8")
}

module.exports = { getLink, updateLink }