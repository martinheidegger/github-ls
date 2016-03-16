var hq = require('hyperquest')
var toArray = require('stream-to-array')
var cheerio = require('cheerio')
function ls (slug, branch, callback) {
  setImmediate(function () {
    callback(null, [])
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
