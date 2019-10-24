const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const log = require('lighthouse-logger');

function launchChromeAndRunLighthouse(pageData, opts, index) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    opts.port = chrome.port;
    const { url } = pageData;
    return lighthouse(url, opts, config = null).then(results => {

      res = results.report;
      const date = new Date().toISOString().split(':')[0];

      fs.writeFile(`./reports/${pageData.name}_${date}.html`, res, (err) => {
        if (err) {
          return console.log(err);
        }

      });

      return chrome.kill().then(() => results.lhr);
    });
  });
}

const opts = {
  output: 'html',
  chromeFlags: ['--headless'],
  logLevel: 'info',
  onlyCategories: ['performance'],
  view: true,
};

let pagesUrls = [
  {
    name: 'page1',
    url: 'https://google.com/', 
  },
];


function launchReports(pagesUrls) {
  fs.mkdirSync('reports');
  pagesUrls.reduce(async (previousPage, currentPage, index) => {
    await previousPage;
    return launchChromeAndRunLighthouse(currentPage, opts, index);
  }, Promise.resolve());
}

launchReports(pagesUrls)
