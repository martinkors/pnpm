import fs from 'fs'
import path from 'path'
import { FULL_FILTERED_META_DIR } from '@pnpm/constants'
import { createFetchFromRegistry } from '@pnpm/fetch'
import { createNpmResolver } from '@pnpm/npm-resolver'
import { type Registries } from '@pnpm/types'
import { fixtures } from '@pnpm/test-fixtures'
import loadJsonFile from 'load-json-file'
import nock from 'nock'
import tempy from 'tempy'

const f = fixtures(__dirname)

const registries: Registries = {
  default: 'https://registry.npmjs.org/',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const badDatesMeta = loadJsonFile.sync<any>(f.find('bad-dates.json'))
/* eslint-enable @typescript-eslint/no-explicit-any */

const fetch = createFetchFromRegistry({})
const getAuthHeader = () => undefined
const createResolveFromNpm = createNpmResolver.bind(null, fetch, getAuthHeader)

afterEach(() => {
  nock.cleanAll()
  nock.disableNetConnect()
})

beforeEach(() => {
  nock.enableNetConnect()
})

test('fall back to a newer version if there is no version published by the given date', async () => {
  nock(registries.default)
    .get('/bad-dates')
    .reply(200, badDatesMeta)

  const cacheDir = tempy.directory()
  const { resolveFromNpm } = createResolveFromNpm({
    cacheDir,
    filterMetadata: true,
    fullMetadata: true,
    registries,
  })
  const resolveResult = await resolveFromNpm({ alias: 'bad-dates', bareSpecifier: '^1.0.0' }, {
    publishedBy: new Date('2015-08-17T19:26:00.508Z'),
  })

  expect(resolveResult!.resolvedVia).toBe('npm-registry')
  expect(resolveResult!.id).toBe('bad-dates@1.0.0')
})

test('request metadata when the one in cache does not have a version satisfying the range', async () => {
  const cacheDir = tempy.directory()
  const cachedMeta = {
    'dist-tags': {},
    versions: {},
    time: {},
    cachedAt: '2016-08-17T19:26:00.508Z',
  }
  fs.mkdirSync(path.join(cacheDir, `${FULL_FILTERED_META_DIR}/registry.npmjs.org`), { recursive: true })
  fs.writeFileSync(path.join(cacheDir, `${FULL_FILTERED_META_DIR}/registry.npmjs.org/bad-dates.json`), JSON.stringify(cachedMeta), 'utf8')

  nock(registries.default)
    .get('/bad-dates')
    .reply(200, badDatesMeta)

  const { resolveFromNpm } = createResolveFromNpm({
    cacheDir,
    filterMetadata: true,
    fullMetadata: true,
    registries,
  })
  const resolveResult = await resolveFromNpm({ alias: 'bad-dates', bareSpecifier: '^1.0.0' }, {
    publishedBy: new Date('2015-08-17T19:26:00.508Z'),
  })

  expect(resolveResult!.resolvedVia).toBe('npm-registry')
  expect(resolveResult!.id).toBe('bad-dates@1.0.0')
})
