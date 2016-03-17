var hq = require('hyperquest')
var toArray = require('stream-to-array')
var cheerio = require('cheerio')
function ls (slug, branch, callback) {
  setImmediate(function () {
    callback(null, [])
  })
}
ls.revision = function (base, slug, callback) {
  ls.request([base, slug, '!svn/vcc/default'].join('/'), {
    method: 'PROPFIND',
    headers: {
      Depth: '0'
    },
    body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><checked-in xmlns="DAV:"/></prop></propfind>'
  }, function (err, res, $, body) {
    if (err) {
      return callback(err, res)
    }
    var nextHref = $.xml($('lp1\\:checked-in D\\:href')[0].children)
    callback(null, nextHref.substr(slug.length + 2))
  })
}
ls.paths = function (base, slug, rev, callback) {
  ls.request([base, slug, rev].join('/'), {
    method: 'PROPFIND',
    headers: {
      Depth: '1'
    },
    body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><creator-displayname xmlns="DAV:"/><creationdate xmlns="DAV:"/><version-name xmlns="DAV:"/><deadprop-count xmlns="http://subversion.tigris.org/xmlns/dav/"/><getcontentlength xmlns="DAV:"/><resourcetype xmlns="DAV:"/></prop></propfind>'
  }, function (err, res, $, body) {
    if (err) {
      return callback(err, res)
    }
    if (res.statusCode !== 207) {
      return callback(new Error('bad-http-status'), res)
    }
    var links = $('D\\:href').toArray().map(function (node) {
      return $.xml(node.children)
    }).map(function (link, nr) {
      link = link.substr(slug.length + 2)
      return {
        rev: link,
        path: link.replace(/^\!svn\/bc\/[0-9]+\//, '')
      }
    })
    links.shift()
    callback(null, links)
  })
}
ls.request = function (url, options, callback) {
  if (!options.headers) {
    options.headers = {}
  }
  options.headers['User-Agent'] = 'SVN/1.7.20 neon/0.29.6'
  options.headers['Accept-Encoding'] = 'gzip'
  options.headers['Content-Type'] = 'text/xml; charset=utf-8'
  options.headers['Host'] = 'github.com'
  options.headers['Connection'] = 'TE'
  options.headers['TE'] = 'trailers'
  options.headers['DAV'] = [
    'http://subversion.tigris.org/xmlns/dav/svn/depth',
    'http://subversion.tigris.org/xmlns/dav/svn/mergeinfo',
    'http://subversion.tigris.org/xmlns/dav/svn/log-revprops'
  ].join(';')

  var body
  if (options.body) {
    body = options.body
    delete options.body
  }
  var info
  var stream = hq(url, options, function (err, _info) {
    info = _info
    if (err) {
      return callback(err, info)
    }
  })
  if (body) {
    stream.write(body)
    stream.end()
  }
  toArray(stream, function (err, parts) {
    if (err) {
      return callback(err, info)
    }
    var buffer = Buffer.concat(parts.map(function (part) {
      if (part instanceof Buffer) return part
      return new Buffer(part)
    }))
    callback(err, info, cheerio.load(buffer, {xmlMode: true}), buffer)
  })
}
module.exports = ls
