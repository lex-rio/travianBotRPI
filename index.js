"use strict";

const puppeteer = require('puppeteer');

(async () => {
        try {
                const browser = await puppeteer.launch({
                      headless: true,
                      args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
                const page = await browser.newPage();
                await page.goto('https://ru4.kingdoms.com');
                await page.screenshot({path: 'example.png'});

                await browser.close();
                console.log('done');
                  
        } catch (e) {
                    console.log(e)
                  
        }
        
})();
