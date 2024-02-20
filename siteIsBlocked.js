const path = require('path');
const fs = require('fs');
require("dotenv").config({path: path.join(__dirname, ".env")})
const { chromium } = require('playwright');
const fetch = require('node-fetch');

const captchaSelector = '#security_code_image';

async function solveCaptcha(imageBase64) {
    const captchaApiKey = process.env.captchaApiKey; 
    const requestData = {
        clientKey: captchaApiKey,
        task: {
            type: 'ImageToTextTask',
            body: imageBase64,
            phrase: false,
            case: true,
            numeric: 0,
            math: false,
            minLength: 2,
            maxLength: 10,
            comment: 'enter the text you see on the image'
        },
        languagePool: 'en'
    };

    const response = await fetch("https://api.2captcha.com/createTask", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    });

    const responseData = await response.json();
    if (responseData.errorId) throw new Error(`Error ${responseData.errorId}: ${responseData.errorDescription}`);

    while (true) {
        const solutionResponse = await fetch('https://api.2captcha.com/getTaskResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientKey: captchaApiKey,
                taskId: responseData.taskId
            })
        });
        const solutionData = await solutionResponse.json();
        if (solutionData.status === 'ready') return solutionData.solution.text;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
    }

}

module.exports = async function siteIsBlocked(url) {
    const browser = await chromium.launch({headless: true, timeout: 60000});
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto("https://internet.btk.gov.tr/sitesorgu/");
    await page.waitForSelector(captchaSelector);

    const captchaElement = await page.$(captchaSelector);
    await captchaElement.screenshot({ path: 'captcha.png' });
    const captchaImageBase64 = fs.readFileSync('captcha.png').toString('base64')
    
    await page.fill("#deger", url)
    
    console.log(`Checkinkg "${url}". Waiting for captcha solution`)

    const captchaSolution = await solveCaptcha(captchaImageBase64).catch(err => console.log(err));

    console.log(`Recived captcha solution: ${captchaSolution}`)
    
    await page.fill('#security_code', captchaSolution);
    
    await page.click("#submit1")

    await page.waitForSelector("#online")

    const tableOfResults = await page.$("#online")
    const errors = await tableOfResults.$("div.icerik")
    
    if(errors) {
        await browser.close()
        return await checkBlock(url)
    }

    const resultContainer = await page.$("#sorgu_mahkeme")

    var result = await resultContainer.$("span.yazi3_1")

    var textResult = await result?.textContent()

    await browser.close();

    console.log("finished checking")
    
    return textResult?.includes("blocked")
}