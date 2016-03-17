var test = require('tap').test
var ls = require('..')
var REPO = 'martinheidegger/github-ls'
var GITHUB = 'https://github.com'
var GITHUB_REPO = GITHUB + '/' + REPO
var testBranchContent = [{
  rev: '!svn/bc/6/branches/test/.gitignore',
  path: 'branches/test/.gitignore'
}, {
  rev: '!svn/bc/6/branches/test/.travis.yml',
  path: 'branches/test/.travis.yml'
}, {
  rev: '!svn/bc/6/branches/test/index.js',
  path: 'branches/test/index.js'
}, {
  rev: '!svn/bc/6/branches/test/npm-debug.log',
  path: 'branches/test/npm-debug.log'
}, {
  rev: '!svn/bc/6/branches/test/package.json',
  path: 'branches/test/package.json'
}, {
  rev: '!svn/bc/6/branches/test/test/',
  path: 'branches/test/test/'
}]
test('invalid path', function (t) {
  ls('http://engadget.com', function (e) {
    t.notEqual(e, null)
    t.end()
  })
})
test('list files of master branch', function (t) {
  ls(REPO + '/tree/test/', function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, testBranchContent.map(function (file) {
      return file.path.substr('branches/test/'.length)
    }))
    t.end()
  })
})
test('list files of master branch with github path prefix', function (t) {
  ls(GITHUB_REPO + '/tree/test/', function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, testBranchContent.map(function (file) {
      return file.path.substr('branches/test/'.length)
    }))
    t.end()
  })
})
test('list files for a  subfolder for a particular branch', function (t) {
  ls(REPO + '/tree/test/test', function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, [ 'test/index.js' ])
    t.end()
  })
})
test('list files of master by default', function (t) {
  ls(REPO, function (err, list) {
    t.equal(err, null)
    if (!Array.isArray(list)) {
      t.fail('List of master is not an array')
    }
    if (list.length === 0) {
      t.fail('We expected at least one entry in the list')
    }
    ls(REPO + '/tree/master', function (err, masterList) {
      t.equal(err, null)
      t.deepEqual(list, masterList)
      t.end()
    })
  })
})
test('error catching', function (t) {
  ls.errorCatch(function (err) {
    t.equal(err.message, 'test')
    t.end()
  })(new Error('test'))
})
test('repo revision', function (t) {
  ls.revision(GITHUB, REPO, function (err, rev) {
    t.equal(err, null)
    var parts = /^\!svn\/bln\/([0-9]+)$/.exec(rev)
    if (!parts) {
      t.fail('Version format is unexpected: ' + rev)
    }
    if (parseInt(parts[1]) < 5) {
      t.fail('Version is expected to be bigger than 5')
    }
    t.end()
  })
})
test('fetching root', function (t) {
  ls.paths(GITHUB, REPO, '', function (err, list) {
    t.equal(err, null)
    t.equal(list.length, 2)
    t.equal(list[0].path, 'trunk/')
    t.equal(list[1].path, 'branches/')
    var reg = /^\!svn\/bc\/([0-9]+)\/(trunk|branches)\/$/
    if (!reg.test(list[0].rev)) {
      t.fail('Version format is unexpected: ' + list[0].rev)
    }
    reg.lastIndex = 0
    if (!reg.test(list[1].rev)) {
      t.fail('Version format is unexpected: ' + list[1].rev)
    }
    t.end()
  })
})
test('fetching path for a particular branch revision', function (t) {
  ls.paths(GITHUB, REPO, '!svn/bc/6/branches/', function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, [{
      rev: '!svn/bc/6/branches/test/',
      path: 'branches/test/'
    }])
    t.end()
  })
})
test('fetching subfolder for a particular branch', function (t) {
  ls.paths(GITHUB, REPO, '!svn/bc/6/branches/test/', function (err, list) {
    t.equal(err, null)
    t.deepEqual(list, testBranchContent)
    t.end()
  })
})
