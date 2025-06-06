import path from 'path'
import { getPkgInfo } from '../lib/getPkgInfo'

export const DEFAULT_REGISTRIES = {
  default: 'https://registry.npmjs.org/',
  '@jsr': 'https://npm.jsr.io/',
}

describe('licences', () => {
  test('getPkgInfo() should throw error when package info can not be fetched', async () => {
    await expect(
      getPkgInfo(
        {
          name: 'bogus-package',
          version: '1.0.0',
          id: 'bogus-package@1.0.0',
          depPath: 'bogus-package@1.0.0',
          snapshot: {
            resolution: {
              integrity: 'integrity-sha',
            },
          },
          registries: DEFAULT_REGISTRIES,
        },
        {
          storeDir: 'store-dir',
          virtualStoreDir: 'virtual-store-dir',
          modulesDir: 'modules-dir',
          dir: 'workspace-dir',
          virtualStoreDirMaxLength: 120,
        }
      )
    ).rejects.toThrow(`Failed to find package index file for bogus-package@1.0.0 (at ${path.join('store-dir', 'index', 'b2', '16-bogus-package@1.0.0.json')}), please consider running 'pnpm install'`)
  })
})
