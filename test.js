const walk = require('klaw-sync')
const findSyncableGroups = require('./findSyncableGroups')

jest.mock('klaw-sync', () => jest.fn())

describe('findSyncableGroups', () => {
  it('finds only html files', () => {
    walk.mockImplementation(() => [
      { path: '/root/foo.html' },
      { path: '/root/bar/buz' },
      { path: '/root/baz/fuz.html' }
    ])
    expect(findSyncableGroups('/root')).toEqual([['foo'], ['baz/fuz']])
  })

  it('finds one group for flat filesystem', () => {
    walk.mockImplementation(() => [
      { path: '/root/foo.html' },
      { path: '/root/bar.html' },
      { path: '/root/buz.html' }
    ])
    expect(findSyncableGroups('/root')).toEqual([['foo', 'bar', 'buz']])
  })

  it('finds multiple groups for nested filesystem', () => {
    walk.mockImplementation(() => [
      { path: '/root/foo.html' },
      { path: '/root/bar.html' },
      { path: '/root/bar/buz.html' }
    ])
    expect(findSyncableGroups('/root')).toEqual([['foo', 'bar'], ['bar/buz']])

    walk.mockImplementation(() => [
      { path: '/root/foo.html' },
      { path: '/root/foo/baz.html' },
      { path: '/root/bar.html' },
      { path: '/root/bar/buz.html' }
    ])
    expect(findSyncableGroups('/root')).toEqual([
      ['foo', 'bar'],
      ['foo/baz', 'bar/buz']
    ])
  })

  it('finds all groups for deeply nested filesystem', () => {
    walk.mockImplementation(() => [
      { path: '/root/foo.html' },
      { path: '/root/bar.html' },
      { path: '/root/bar/buz.html' },
      { path: '/root/bar/fuz.html' },
      { path: '/root/bar/buz/baz.html' }
    ])
    expect(findSyncableGroups('/root')).toEqual([
      ['foo', 'bar'],
      ['bar/buz', 'bar/fuz'],
      ['bar/buz/baz']
    ])

    walk.mockImplementation(() => [
      { path: '/root/foo.html' },
      { path: '/root/foo/fuz/fooz.html' },
      { path: '/root/foo/fuz/fooz/dooz/bluz.html' }
    ])
    expect(findSyncableGroups('/root')).toEqual([
      ['foo'],
      ['foo/fuz/fooz'],
      ['foo/fuz/fooz/dooz/bluz']
    ])
  })
})
