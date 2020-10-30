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

  const out = data.rss.channel[0].item.map(blog => {
    console.log(blog);
    blog.title = blog.title[0];
    if (blog.title.indexOf(':') !== -1) {
      blog.title = blog.title.split(':')[1];
    }

    blog.date = moment(blog.pubDate[0]).format('MMMM DD YYYY');

    try {
      blog.image = blog['content:encoded'][0].match(new RegExp('<img src="(.*?)"'))[1];
    } catch (e) {
      blog.image = '/assets/img/logo.png';
    }

    blog.subtitle = blog.description[0];
    return blog;
  });

  fs.writeFileSync('./src/_data/blog.json', JSON.stringify(data.rss.channel[0].item));
}

get();
