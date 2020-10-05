const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  fs.watch('./src/_css/', (e, filename) => {
    if (filename.endsWith('index.styl')) { return; }
    const time = new Date();
    fs.utimesSync('./src/_css/index.styl', time, time);
  });
}

module.exports = {
  entry: './src/js/index.js',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'public')
  },
  resolve: {
    modules: [path.join(__dirname, 'node_modules')]
  }
};
