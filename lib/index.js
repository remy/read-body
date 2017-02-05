// 3rd party
const express = require('express');
const hbs = require('express-hbs');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');

if (process.env.LOGGLY_TOKEN) {
  require('std-loggly')({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_DOMAIN,
    tags: [`env-${process.env.NODE_ENV}`, `name-${process.env.npm_package_name}`]
  });
}


// ours
const app = express();
app.disable('x-powered-by');

var render = hbs.express3({
  extname: '.html',
  defaultLayout: __dirname + '/../views/layout.html'
});
app.engine('html', render);
app.set('views', __dirname + '/../views');
app.set('view engine', 'html');

app.use(logger(':status :method :url :response-time ms'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use('/_log', require('inline-log')({ limit: 50 }))
app.use(express.static(__dirname + '/../public'));
app.use('/', require('./routes')); // mount the router

app.locals.env = process.env;

const server = app.listen(process.env.PORT || 8000, (...rest) => {
  console.log(`listening on http://localhost:${server.address().port} @ ${new Date().toJSON()}`);
});
