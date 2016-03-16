var test = require('tap').test
var ls = require('..')
var REPO = 'martinheidegger/github-ls'

test('list files of master branch', function (t) {
  ls(REPO, 'master', function (err, list) {
    t.equal(err, null)
    if (!Array.isArray(list)) {
      t.fail('List should be an array')
    }
    t.end()
  })
})
test('handshake request', function (t) {
  ls.request('https://github.com/' + REPO + '/master', {}, function (err, res, body) {
    t.equal(err, null)
    t.equal(res.statusCode, 200)
    t.equal(body.toString(), '')
    t.end()
  })
})
