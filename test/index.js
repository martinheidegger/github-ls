var test = require('tap').test
var ls = require('..')

test('list files of master branch', function (t) {
  ls('martinheidegger/github-ls', 'master', function (err, list) {
    t.equal(err, null)
    if (!Array.isArray(list)) {
      t.fail('List should be an array')
    }
    t.end()
  })
})
