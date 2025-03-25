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

const restOfTag = {
  commit: {
    sha: '',
    url: 'dummy.url',
  },
  zipball_url: 'dummy.url',
  tarball_url: 'dummy.url',
  node_id: 'dummy.url',
}
export const expectedGreedyArray: Tag[] = [
  {
    name: 'v0.0.0',
    ...restOfTag,
  },
  {
    name: 'v0.2.0',
    ...restOfTag,
  },
  {
    name: '1.0.0', // includes no v prefix
    ...restOfTag,
  },
  {
    name: 'v0.2.1',
    ...restOfTag,
  },
  {
    name: 'v1.2.0',
    ...restOfTag,
  },
]
export const expectedNonGreedyArray: Tag[] = [
  {
    name: 'v0.0.0',
    ...restOfTag,
  },
  {
    name: 'v0.2.0',
    ...restOfTag,
  },
  {
    name: 'v0.2.1',
    ...restOfTag,
  },
  {
    name: 'v1.2.0',
    ...restOfTag,
  },
]

export const dummyTags: Tag[] = [
  {
    name: 'v1.2.0',
    ...restOfTag,
  },
  {
    name: 'hello',
    ...restOfTag,
  },
  {
    name: 'v0.2.0',
    ...restOfTag,
  },
  {
    name: '1.0.0',
    ...restOfTag,
  },
  {
    name: 'v0.2.1',
    ...restOfTag,
  },
  {
    name: 'v0.0.0',
    ...restOfTag,
  },
  {
    name: 'goodbye',
    ...restOfTag,
  },
]
