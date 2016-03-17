[![ISC License](https://img.shields.io/badge/license-ISC-red.svg?style=flat)](https://tldrlegal.com/license/-isc-license)
[![Build Status](https://travis-ci.org/martinheidegger/github-ls.svg?branch=master)](https://travis-ci.org/martinheidegger/github-ls)
[![Coverage Status](https://coveralls.io/repos/github/martinheidegger/github-ls/badge.svg?branch=master)](https://coveralls.io/github/martinheidegger/github-ls?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# github-ls
`github-ls` offers an JavaScript-only way to list the files in a github repository.

 - It needs **no Github Token**, because it doesn't use [the API](https://developer.github.com/v3/git/trees/) which has a rate limit.
 - It does **not fetch the data**, because it doesn't use git fetching
 - It does **not parse the html**, like suggested 

## How it works
Github [supports svn](https://help.github.com/articles/support-for-subversion-clients/) which is awesome because `svn` accesses its repository over `https`. `github-ls` implements the specific subset of `svn`'s http protocol to list files in a folder.

## Installation & Usage
```bash
$ npm i github-ls -g
$ github-ls martinheidegger/github-ls
```

[![https://gyazo.com/4f349176003e3736732b82da862b64d3](https://i.gyazo.com/4f349176003e3736732b82da862b64d3.gif)](https://gyazo.com/4f349176003e3736732b82da862b64d3)

## JavaScript Usage
The `github-ls` command can also be used as a package (`npm i github-ls --save`):

```JavaScript
var githubLs = require('github-ls')
githubLs('martinheidegger/github-ls', function (error, fileList) {
    if (error) {
        return console.log(error)
    }
    fileList.forEach(function (file) {
        console.log(file)
    })
})
```

## Advanced Usage
Its easily possible to use branches, just specify them _(Note: `test` is a branch in the example)_:

```bash
$ github-ls martinheidegger/github-ls/tree/test
```

If you specify branches you can also specify folders _(Note: the first `test` is the branch, the second is the folder `test` in the branch)_:

```bash
$ github-ls martinheidegger/github-ls/tree/test/test
```

In case you simply want to copy the url from github, you can also just pass in the full url:

```bash
$ github-ls https://github.com/martinheidegger/github-ls/tree/master/test
```

[![https://gyazo.com/8d6374fe72ba030c86cdf12516cb0103](https://i.gyazo.com/8d6374fe72ba030c86cdf12516cb0103.gif)](https://gyazo.com/8d6374fe72ba030c86cdf12516cb0103)

## State
Right now it _should basically work_ but the error messages might be wildly unhelpful. If you find any problem, please don't hesitate to [post an issue](https://github.com/martinheidegger/github-ls/issues/new) or [create a Pull Request](https://help.github.com/articles/creating-a-pull-request/).

## Thanks
I would like to thank [s9tpepper](https://github.com/s9tpepper) for helping me find a good way and motivating me. I also would like to say that I wouldn't have had the idea without the push from [fforres](https://github.com/fforres), [bnb](https://github.com/bnb) and [dinodsaurus](https://github.com/dinodsaurus) that work with me on [nodeschool-admin](https://github.com/nodeschool/admin) and [iancrowther](https://github.com/iancrowther) who motivates me to work on nodeschool in general.

`github-ls` builds on the great work of [https://github.com/substack/hyperquest], [https://github.com/cheeriojs/cheerio] and [https://github.com/stream-utils/stream-to-array] without which this would have been way more work! You guys rock!


