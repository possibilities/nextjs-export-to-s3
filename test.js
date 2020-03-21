const walk = require('klaw-sync')
const findSyncableGroups = require('./findSyncableGroups')

jest.mock('klaw-sync', () => jest.fn())

describe('findSyncableGroups', () => {
  it('finds only html files', () => {
    walk.mockImplementation(() => [
      { path: '/foo.html' },
      { path: '/bar/buz' },
      { path: '/baz/fuz.html' }
    ])
    expect(
      findSyncableGroups()
    ).toEqual(
      [
        ['/foo'],
        ['/baz/fuz']
      ]
    )
  })

  it('finds one group for flat filesystem', () => {
    walk.mockImplementation(() => [
      { path: '/foo.html' },
      { path: '/bar.html' },
      { path: '/buz.html' }
    ])
    expect(
      findSyncableGroups()
    ).toEqual(
      [
        ['/foo', '/bar', '/buz']
      ]
    )
  })

  it('finds multiple groups for nested filesystem', () => {
    walk.mockImplementation(() => [
      { path: '/foo.html' },
      { path: '/bar.html' },
      { path: '/bar/buz.html' }
    ])
    expect(
      findSyncableGroups()
    ).toEqual(
      [
        ['/foo', '/bar'],
        ['/bar/buz']
      ]
    )

    walk.mockImplementation(() => [
      { path: '/foo.html' },
      { path: '/foo/baz.html' },
      { path: '/bar.html' },
      { path: '/bar/buz.html' }
    ])
    expect(
      findSyncableGroups()
    ).toEqual(
      [
        ['/foo', '/bar'],
        ['/foo/baz', '/bar/buz']
      ]
    )
  })

  it('finds all groups for deeply nested filesystem', () => {
    walk.mockImplementation(() => [
      { path: '/foo.html' },
      { path: '/bar.html' },
      { path: '/bar/buz.html' },
      { path: '/bar/fuz.html' },
      { path: '/bar/buz/baz.html' }
    ])
    expect(
      findSyncableGroups()
    ).toEqual(
      [
        ['/foo', '/bar'],
        ['/bar/buz', '/bar/fuz'],
        ['/bar/buz/baz']
      ]
    )

    walk.mockImplementation(() => [
      { path: '/foo.html' },
      { path: '/foo/fuz/fooz.html' },
      { path: '/foo/fuz/fooz/dooz/bluz.html' }
    ])
    expect(
      findSyncableGroups()
    ).toEqual(
      [
        ['/foo'],
        ['/foo/fuz/fooz'],
        ['/foo/fuz/fooz/dooz/bluz']
      ]
    )
  })
})
