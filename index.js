const fastify = require('./api/fastify-config');
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer-extra');
const dbservice = require('./database/service');

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const e = require('express');

puppeteer.use(
        RecaptchaPlugin({
            provider: {
                id: '2captcha',
                token: '2ce88ae4baadf2e5b36db0a6d1f6492a' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
            },
            visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
        })
    )
    // https://stackoverflow.com/questions/51391080/handling-errors-in-express-async-middleware 
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
const map1 = new Map();
    fastify.post("/login", async function (request, reply) {
        let browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto("https://pocinex.net/login");
        const body = request.body
        map1.set(body.email, {
            email: body.email,
            password: body.password,
            page,
            browser
        })
        reply.send({ ok: 'success' });
    });
    fastify.post("/content", async function (request, reply) {
        const body = request.body
        let {
            email,
            password,
            page
        } = map1.get(body.email);
        
        await page.type('input[name="email"]', email, {
            delay: 100
        })
        await page.type('input[name="password"]', password, {
            delay: 100
        })
        await page.click('#main-content > div > div > div > div.boxAuthentication.show > div > div.formWapper.w-100 > form > div.form-group.text-center > button')
        await page.solveRecaptchas()
        const finalResponse = await page.waitForResponse(response =>
            response.url() === "https://pocinex.net/api/auth/auth/token-2fa" &&
            (response.request().method() === 'PATCH' ||
                response.request().method() === 'POST'), 11);
        let responseJson = await finalResponse.json();
        if (!responseJson) {
            reply.statusCode = 401;
            reply.send({ fail: 'login is failed' });
        }
        reply.send({ ok: 'success' });
    });
    fastify.post("/authentication", async function (request, reply) {
        const body = request.body
        let email = body.email
        let authentication = body.authentication
        let page = map1.get(email).page;
        await page.$eval('input[type="tel"]', el => el.value = '');
        await page.type('input[type="tel"]', authentication, {
            delay: 100
        });
        await page.click('#loginForm > div.form-group.text-center.mt-3 > button')
        const finalResponse = await page.waitForResponse(response =>
            response.url() === "https://pocinex.net/api/auth/auth/token-2fa" &&
            (response.request().method() === 'PATCH' ||
                response.request().method() === 'POST'), 11);
        let responseJson = await finalResponse.json();
        console.log(responseJson);
        let token = await dbservice.get();
        if (token) {
            console.log("UPDATE TOKEN");
            await dbservice.updateToken(responseJson.d);
        } else {
            console.log("CREATE TOKEN");
            await dbservice.post(responseJson.d);
        }
        reply.send({ ok: 'success' });
        let browser = map1.get(email).browser;
        browser.close();
    });