const fs = require('fs-extra');
const path = require('path');
const babel = require('./babelrc.json');
const { execLog } = require('./utils');
const packageToPath = path.resolve(process.cwd(), 'package.json');
const packageFrom = require('../package.json');
const packageTo = require(packageToPath);
const { exec } = require('child_process');
let initType = 'script';

function changeHtml(filePath, bundleReanme, bundleEndName) {
  let data = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const exp = eval(`/${bundleReanme}/g`);
  data = data.replace(exp, bundleEndName);
  data = data.replace(/<!--\[/g, '');
  data = data.replace(/\]-->/g, '');
  setTimeout(() => {
    fs.removeSync(filePath);
    fs.createFileSync(filePath);
    fs.writeFileSync(filePath, data);
  }, 30);
}

module.exports = function({
  publicDirPath,
  outDirPath,
  bundleReanme,
  bundleEndName,
  isBabelCover,
  isBabelrc,
  isInit,
}) {
  if (!isInit) {
    const nodePathTo = path.resolve(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodePathTo + '/' + 'babel-plugin-transform-runtime')) {
      console.log('Use "pillar-pack init" in new project...');
      initType = 'auto';
      doInit();
      // throw 'Please first Use "pillar-pack init" in new project';
    }
    if (!fs.existsSync(outDirPath)) {
      fs.mkdirpSync(outDirPath);
    }
    fs.copySync(publicDirPath, outDirPath);
    fs.readdirSync(outDirPath).forEach(v => {
      if (v.indexOf('.html') > 0) {
        const htmlPath = path.resolve(outDirPath, v);
        changeHtml(htmlPath, bundleReanme, bundleEndName);
      }
    });
  }
  const babelPath = path.resolve(process.cwd(), '.babelrc');
  if (isBabelCover === false && isBabelrc) {
    if (!fs.existsSync(babelPath)) {
      fs.writeJSONSync(babelPath, babel);
    }
  } else if (isBabelrc) {
    fs.writeJSONSync(babelPath, babel);
  }
  if (isInit) {
    doInit();
  }
};

function doInit() {
  if (!packageTo.devDependencies) {
    packageTo.devDependencies = {};
  }
  Object.keys(packageFrom.copyDevDependencies).forEach(k => {
    packageTo.devDependencies[k] = packageFrom.copyDevDependencies[k];
  });
  fs.writeJSONSync(packageToPath, packageTo);
  console.log('install babel-plugins...');
  exec('yarn install', initEnd);
}

function initEnd(...args) {
  execLog(...args);
  if(initType === 'auto') {
    console.log('Init done! Now build code and start Server...');
  } else {
    console.log('Init done! Please use "pillar-pack" in this project');
  }
}
