var test = require('tap').test
var ls = require('..')
var REPO = 'martinheidegger/github-ls'

test('fetching with a null github client should work', function (t) {
  var github = null
  ls(REPO + '/tree/test/test', github, function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, [ 'index.js' ])
    t.end()
  })
})
