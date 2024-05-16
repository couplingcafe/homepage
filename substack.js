const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const xml2js = require('xml2js');

async function get () {
  const res = await fetch('https://coupling.substack.com/feed');
  const text = await res.text();
  const data = await new Promise(resolve => {
    xml2js.parseString(text, (err, result) => {
      resolve(result);
    });
  });

  const out = data.rss.channel[0].item.filter(blog => {
    const date = moment(blog.pubDate[0]).format('YYYY MM DD');
    return date >= '2024 01 01';
  }).map(blog => {
    blog.title = blog.title[0];
    if (blog.title.indexOf(':') !== -1) {
      blog.title = blog.title.split(':')[1];
    }

    blog.date = moment(blog.pubDate[0]).format('MMMM DD YYYY');

    try {
      const imgs = blog['content:encoded'][0].match(new RegExp('<img src="(.*?)"', 'g'));
      blog.image = imgs[1].match(new RegExp('<img src="(.*?)"'))[1];
    } catch (e) {
      blog.image = '/assets/img/logo.svg';
    }

    blog.subtitle = blog.description[0];
    return blog;
  });

  fs.writeFileSync('./src/_data/blog.json', JSON.stringify(out));
}

get();
