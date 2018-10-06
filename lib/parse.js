const request = require('request');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');
const striptags = require('striptags');
const bodyTags = 'p strong em ol ul h1 h2 h3 h4 h5 h6 code pre'.toUpperCase().split(' ');

const walk = _ => {
  if (!_.childNodes) {
    return {
      count: 0,
      res: { '#text' : 0 }
    }
  }

  const res = Array
    .from(_.childNodes)
    .filter(_ => _.type !== 'comment')
    .map(_ => {
      // console.log(_.type, _.name);
      // return 'DIV'
      return _.type === 'text' ? '#text' : _.name.toUpperCase()
    })
    .reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc
    }, { '#text': 0 })

  const body = {
    count: _.childNodes.length,
    res,
  }

  return body;
}

const build = (parent, res = []) => {
  if (!parent || !parent.childNodes) {
    return res;
  }
  Array
    .from(parent.childNodes)
    .map(_ => {
      const result = {
        textLength: (_.innerText || '').length,
        parent,
        root: _,
        body: walk(_),
        text: 0,
      };

      result.text = result.body.res['#text'];
      result.value = value(result);

      // if (result.value) console.log(result.value);

      res.push(result)
      build(_, res);
    });

  return res;
};

const value = (item) => bodyTags.reduce((acc, curr) => {
  if (item.body.res[curr]) acc += item.body.res[curr];
  return acc;
}, 0);

function run($) {
  const res = [];

  if ($('body').length === 0) {
    $.children().wrapAll('<body>');
  }

  build($('body')[0], res);

  const valueSorted = res.sort((a, b) => {
    return b.value - a.value;
  }).filter(_ => _.value);

  const title = $('title').text();

  const turndownService = new TurndownService();
  turndownService.use(turndownPluginGfm.tables);
  let markdown = turndownService.turndown($(valueSorted[0].root).html());

  if (!(/^#\s.*/.test(markdown))) {
    markdown = `# ${title}\n\n${markdown}`;
  }

  const body = striptags(
    markdown,
    [],
    ''
  ); //.replace(/\n{3,}/g, '\n\n');

  return {
    body,
    title,
  }
}

function parse(body) {
  return new Promise((resolve, reject) => {
    resolve(run(cheerio.load(body)));
  });
}

module.exports = {
  parse,
  request: url => {
    return new Promise((resolve, reject) => {
      request(url, (err, res, body) => {
        if (err) {
          return reject(err);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(res.statusCode));
        }

        resolve(parse(body));
      });
    })
  }
}

