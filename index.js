const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const log = require('lighthouse-logger');

const mobileConfig = require('./configs/mobile');
const desktopConfig = require('./configs/desktop');

const writeResultsIntoFile = (results, type, name) => {
  res = results.report;
  const date = new Date().toISOString().split(':')[0];

  fs.writeFile(`./reports/${name}_${type}_${date}.html`, res, (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

async function launchChromeAndRunLighthouse(pageData, opts, index) {
  const { url, name } = pageData;
  let chromeInstance;
  let results;

  chromeInstance = await chromeLauncher.launch({
    chromeFlags: opts.chromeFlags,
  });
  opts.port = chromeInstance.port;
  results = await lighthouse(url, opts, mobileConfig);
  writeResultsIntoFile(results, 'mobile', name);
  await chromeInstance.kill();

  chromeInstance = await chromeLauncher.launch({
    chromeFlags: opts.chromeFlags,
  });
  opts.port = chromeInstance.port;
  results = await lighthouse(url, opts, desktopConfig);
  writeResultsIntoFile(results, 'desktop', name);
  await chromeInstance.kill();
  return Promise.resolve();
}

const opts = {
  output: 'html',
  chromeFlags: ['--headless', '--ignore-certificate-errors'],
  logLevel: 'info',
  view: true,
};

const pageUrls = [
  {
    name: 'Google',
    url: 'https://google.com/',
  },
];

function launchReports(pageUrls) {
  fs.mkdirSync('reports');
  pageUrls.reduce(async (previousPage, currentPage, index) => {
    await previousPage;
    return launchChromeAndRunLighthouse(currentPage, opts, index);
  }, Promise.resolve());
}

launchReports(pageUrls);
