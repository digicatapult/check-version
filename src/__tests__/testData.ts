export type Tag = {
  name: string
  commit: {
    sha: string
    url: string
  }
  zipball_url: string
  tarball_url: string
  node_id: string
}
export const expectedArray: Tag[] = [
  {
    name: '0.0.0',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: '0.2.0',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: '0.2.1',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: '1.2.0',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  }
]
export const dummyData: Tag[] = [
  {
    name: '1.2.0',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: 'hello',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: '0.2.0',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: '0.2.1',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: '0.0.0',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  },
  {
    name: 'goodbye',
    commit: {
      sha: '',
      url: 'dummy.url'
    },
    zipball_url: 'dummy.url',
    tarball_url: 'dummy.url',
    node_id: 'dummy.url'
  }
]
export class TestData {
  constructor() {}
}
