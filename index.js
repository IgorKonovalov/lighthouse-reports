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

  chromeInstance = await chromeLauncher.launch({ chromeFlags: opts.chromeFlags });
  opts.port = chromeInstance.port;
  results = await lighthouse(url, opts, mobileConfig);
  writeResultsIntoFile(results, 'mobile', name);
  try {
    await chromeInstance.kill();
  } catch (error) {
    console.error(error);
  }

  chromeInstance = await chromeLauncher.launch({ chromeFlags: opts.chromeFlags });
  opts.port = chromeInstance.port;
  results = await lighthouse(url, opts, desktopConfig);
  writeResultsIntoFile(results, 'desktop', name);
  try {
    await chromeInstance.kill();
  } catch (error) {
    console.error(error);
  }
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
    name: 'Russia_fqa8_dev_rel_home',
    url: 'https://fqa8.ru.hybris.eia.amway.net/', 
  },
  {
    name: 'Russia_before_perf_home',
    url: 'https://amway.ru.dev/',
  },
];


function launchReports(pageUrls) {
  fs.mkdirSync('reports');
  pageUrls.reduce(async (previousPage, currentPage, index) => {
    await previousPage;
    return launchChromeAndRunLighthouse(currentPage, opts, index);
  }, Promise.resolve());
}

launchReports(pageUrls)
