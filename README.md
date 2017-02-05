# read.isthe.link

A basic functionality readability almost-clone. This service will *try* to search for the body of the content to a URL, and represent it stripped back and with minimal styling.

## Usage

Send your URL to https://read.isthe.link via a query string, and so long as the URL is publically available (i.e. not behind login), then the page can be re-rendered:

https://read.isthe.link?url=https://remysharp.com/node

The page will be cached for a period of time, so subsequent requests will be faster.

## Usage with private URLs

You can `POST` a `body` to the service and it will give you a hashed URL to redirect to. For example:

```js
const xhr = new XMLHttpRequest();

xhr.open('POST', 'https://read.isthe.link');
xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
xhr.setRequestHeader('referrer', window.location);

xhr.onload = () => {
  const res = JSON.parse(xhr.response);
  window.location = `https://read.isthe.link?url=${res.url}`;
}

xhr.send(`body=${encodeURIComponent(document.documentElement.innerHTML)}`);
```

## Issues & feedback

All feedback, suggestions, pull requests to github (please): https://github.com/remy/read-body

[MIT Licensed](https://rem.mit-license.org)
