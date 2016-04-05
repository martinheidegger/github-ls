var hq = require('hyperquest')
var toArray = require('stream-to-array')
var cheerio = require('cheerio')
var Path = require('path')
var GITHUB = 'https://github.com'
function processThroughGithub (github, slug, folder, branch, callback) {
  var userRepo = slug.split('/')
  return github.repos.getBranch({
    user: userRepo[0],
    repo: userRepo[1],
    branch: branch
  }, function (err, branch) {
    if (err) return callback(err)
    var pathParts = folder.split('/')
    if (pathParts[0] === '') {
      pathParts.shift()
    }
    if (pathParts[pathParts.length - 1] === '') {
      pathParts.pop()
    }
    var loadTree = function (sha) {
      github.gitdata.getTree({
        user: userRepo[0],
        repo: userRepo[1],
        sha: sha,
        recursive: false
      }, function (err, result) {
        if (err) return callback(err)
        if (pathParts.length > 0) {
          var currentFolder = pathParts.shift()
          for (var i = 0; i < result.tree.length; i++) {
            var entry = result.tree[i]
            if (entry.path === currentFolder) {
              return loadTree(entry.sha)
            }
          }
          return callback(new Error('folder-not-found'))
        }
        callback(null, result.tree.filter(function (treeEntry) {
          return treeEntry.type !== 'tree'
        }).map(function (treeEntry) {
          return Path.basename(treeEntry.path + '#' + treeEntry.sha)
        }))
      })
    }
    loadTree(branch.commit.sha)
  })
}
function ls (path, github, callback) {
  if (typeof github === 'function') {
    callback = github
    github = null
  }
  var parts = /((https\:\/\/)?(github.com\/))?([^\/]+\/[^\/]+)(\/tree\/([^\/]+)\/?(.*))?\/?$/.exec(path)
  if (!parts) {
    return setImmediate(callback.bind(null, new Error('The provided path "' + path + '" is of the wrong format. It needs to look like:\n' +
      '((http://)github.com/){organization|user}/{repo}((/tree/{branch})/{folder}/?)\n' +
      '\n' +
      'Valid examples:\n' +
      'http://github.com/martinheidegger/github-ls/tree/test/\n' +
      'nodeschool/admin/tree/master\n' +
      'nodeschool/admin     // will assume that you want tree/master/\n' +
      'github.com/martinheidegger/github-ls/tree/master/test')))
  }
  var slug = parts[4]
  var branch = parts[6] || 'master'
  var folder = parts[7]
  var prefix
  if (folder) {
    folder += '/'
  } else {
    folder = ''
  }
  if (github) {
    return processThroughGithub(github, slug, folder, branch, callback)
  }
  var folderProcessor = ls.errorCatch(callback, function (list) {
    callback(null, list.map(function (entry) {
      return entry.path.substr(prefix.length)
    }))
  })
  ls.paths(GITHUB, slug, 'branches', ls.errorCatch(callback, function (list) {
    for (var i = 0; i < list.length; i++) {
      var item = list[i]
      prefix = 'branches/' + branch + '/' + folder
      if (item.path === 'branches/' + branch + '/') {
        /*
         This branch is actually a branch! lets use it!
         */
        return ls.paths(GITHUB, slug, item.rev + folder, folderProcessor)
      }
    }
    /*
      If the selected branch is not a dedicated branch it assumes that the branch is the trunk
      and we need to fetch the version of the trunk to know which version of the tree we should
      read
     */
    ls.paths(GITHUB, slug, '', ls.errorCatch(callback, function (list) {
      prefix = 'trunk/' + folder
      if (list.length === 0) {
        return callback(new Error('empty-repo'))
      }
      ls.paths(GITHUB, slug, list[0].rev + folder, folderProcessor)
    }))
  }))
}
ls.revision = function (base, slug, callback) {
  ls.request([base, slug, '!svn/vcc/default'].join('/'), {
    method: 'PROPFIND',
    headers: {
      Depth: '0'
    },
    body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><checked-in xmlns="DAV:"/></prop></propfind>'
  }, ls.errorCatch(callback, function (res, $, body) {
    var nextHref = $.xml($('lp1\\:checked-in D\\:href')[0].children)
    callback(null, nextHref.substr(slug.length + 2))
  }))
}
ls.paths = function (base, slug, rev, callback) {
  ls.request([base, slug, rev].join('/'), {
    method: 'PROPFIND',
    headers: {
      Depth: '1'
    },
    body: '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><creator-displayname xmlns="DAV:"/><creationdate xmlns="DAV:"/><version-name xmlns="DAV:"/><deadprop-count xmlns="http://subversion.tigris.org/xmlns/dav/"/><getcontentlength xmlns="DAV:"/><resourcetype xmlns="DAV:"/></prop></propfind>'
  }, ls.errorCatch(callback, function (res, $, body) {
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
  }))
}
ls.errorCatch = function (callback, handler) {
  return function (err) {
    if (err) {
      return callback.apply(null, arguments)
    }
    var args = Array.prototype.slice.call(arguments)
    args.shift()
    handler.apply(null, args)
  }
}
ls.request = function (url, options, callback) {
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
  var stream = hq(url, options, ls.errorCatch(callback, function (_info) {
    info = _info
  }))
  if (body) {
    stream.write(body)
    stream.end()
  }
  toArray(stream, ls.errorCatch(callback, function (parts) {
    var buffer = Buffer.concat(parts)
    callback(null, info, cheerio.load(buffer, {xmlMode: true}), buffer)
  }))
}
module.exports = ls
