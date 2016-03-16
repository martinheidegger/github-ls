var test = require('tap').test
var ls = require('..')
var REPO = 'martinheidegger/github-ls'
var GITHUB = 'https://github.com'
var GITHUB_REPO = GITHUB + '/' + REPO

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
  ls.request(GITHUB_REPO, {
    method: 'OPTIONS',
    body: '<?xml version="1.0" encoding="utf-8"?><D:options xmlns:D="DAV:"><D:activity-collection-set/></D:options>'
  }, function (err, res, $, body) {
    t.equal(err, null)
    t.equal(res.statusCode, 200)
    var nextHref = $.xml($('D\\:href')[0].children)
    t.equal(nextHref, '/' + REPO + '/!svn/act/')
    ls.request(GITHUB_REPO, {
      method: 'PROPFIND',
      headers: {
        Depth: '0'
      },
      body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><version-controlled-configuration xmlns="DAV:"/><resourcetype xmlns="DAV:"/><baseline-relative-path xmlns="http://subversion.tigris.org/xmlns/dav/"/><repository-uuid xmlns="http://subversion.tigris.org/xmlns/dav/"/></prop></propfind>'
    }, function (err, res, $, body) {
      t.equal(err, null)
      t.equal(res.statusCode, 207)
      var nextHref = $.xml($('lp1\\:version-controlled-configuration D\\:href')[0].children)
      t.equal(nextHref, '/' + REPO + '/!svn/vcc/default')
      ls.request(GITHUB_REPO + '/!svn/vcc/default', {
        method: 'PROPFIND',
        headers: {
          Depth: '0'
        },
        body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><checked-in xmlns="DAV:"/></prop></propfind>'
      }, function (err, res, $, body) {
        t.equal(err, null)
        t.equal(res.statusCode, 207)
        var nextHref = $.xml($('lp1\\:checked-in D\\:href')[0].children)
        ls.request(GITHUB + nextHref, {
          method: 'PROPFIND',
          headers: {
            Depth: '1'
          },
          body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><creator-displayname xmlns="DAV:"/><creationdate xmlns="DAV:"/><version-name xmlns="DAV:"/><deadprop-count xmlns="http://subversion.tigris.org/xmlns/dav/"/><getcontentlength xmlns="DAV:"/><resourcetype xmlns="DAV:"/></prop></propfind>'
        }, function (err, res, $, body) {
          t.equal(err, null)
          t.equal(res.statusCode, 207)
          var links = $('D\\:href').toArray().map(function (node) {
            return $.xml(node.children)
          })
          links = links.map(function (link) {
            return link.substr(links[0].length)
          })
          t.deepEqual(links, ['', 'trunk/', 'branches/'])
          t.end()
        })
      })
    })
  })
})
