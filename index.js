const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const log = require('lighthouse-logger');

const mobileConfig = require('./configs/mobile');
const desktopConfig = require('./configs/desktop');

const opts = {
  output: 'html',
  chromeFlags: ['--headless', '--ignore-certificate-errors'],
  logLevel: 'info',
  view: true,
};

const pageUrls = [
  {
    name: 'google',
    url: 'https://google.com', 
  },
];

const writeResultsIntoFile = (results, type, name) => {
  res = results.report;
  const date = new Date().toISOString().split(':')[0];

  fs.writeFile(`./reports/${name}_${type}_${date}.html`, res, (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

async function launchInstanceAndWriteResults({ chromeLauncher, config, opts, name, url }) {
  const _opts = { ...opts };
  const chromeInstance = await chromeLauncher.launch({ chromeFlags: _opts.chromeFlags });
  _opts.port = chromeInstance.port;
  const results = await lighthouse(url, _opts, config.config);

  console.log('writing results...');
  writeResultsIntoFile(results, config.name, name);
  console.log('writing results done');
  try {
    console.log('killing chrome instance...');
    await chromeInstance.kill();
  } catch (error) {
    console.error(error);
  }

  console.log('instance killed');

  return Promise.resolve();
}

async function launchChromeAndRunLighthouse(pageData, opts, index) {
  const { url, name } = pageData;
  const configs = [ {
    config: mobileConfig,
    name: 'mobile',
  } ];

  await configs.reduce(async (accumulatorPromise, currentConfig) => {
    await launchInstanceAndWriteResults({
      chromeLauncher,
      config: currentConfig,
      opts,
      name,
      url,
    });
  }, Promise.resolve());
}


function launchReports(pageUrls) {
  fs.mkdirSync('reports');

  pageUrls.reduce(async (previousPage, currentPage, index) => {
    await previousPage;
    return launchChromeAndRunLighthouse(currentPage, opts, index);
  }, Promise.resolve());
}

launchReports(pageUrls)
