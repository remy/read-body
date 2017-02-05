const express = require('express');
const LRU = require('lru-cache');
const marked = require('marked');
const multer  = require('multer');
const fs = require('fs');

const index = marked(fs.readFileSync(`${__dirname}/../README.md`, 'utf8'));

const { request, parse } = require('./parse');
const router = express.Router();
const cache = LRU({ max: 500 });
const crypto = require('crypto');
const upload = multer(); // should default to system tmp

module.exports = router;

router.post('/', upload.single('body'), (req, res, next) => {
  const md5sum = crypto.createHash('md5');
  const hash = md5sum.update(req.body.body).digest('hex');
  const cached = cache.get(hash);

  if (cached) {
    return res.send({ url: `/?url=${hash}` });
  }

  parse(req.body.body).then(result => {
    const render = {
      body: marked(result.body),
      title: result.title,
      base: req.headers.referer,
    };

    cache.set(hash, render);
    res.send({ url: `/?url=${hash}` });
    // res.render('post', render);
  }).catch(next);

});

router.get('/', (req, res, next) => {
  const { url } = req.query;

  if (!url) {
    return next('route');
  }

  const cached = cache.get(url);

  if (cached) {
    return res.render('post', cached);
  }

  request(url).then(result => {
    const render = {
      body: marked(result.body),
      title: result.title,
      base: url,
    };
    cache.set(url, render);
    res.render('post', render);
  }).catch(next);
});

router.get('/', (req, res) => res.render('post', { body: index, title: 'read.isthe.link' }));
