import { docsUrl } from '@pnpm/cli-utils'
import { type Config } from '@pnpm/config'
import renderHelp from 'render-help'
import * as catalogMigrate from './catalogMigrate.cmd.js'

export function rcOptionsTypes (): Record<string, unknown> {
  return {
    ...catalogMigrate.rcOptionsTypes,
  }
}

export function cliOptionsTypes (): Record<string, unknown> {
  return {
    ...catalogMigrate.cliOptionsTypes(),
  }
}

export const commandNames = ['catalog']

export function help (): string {
  return renderHelp({
    description: 'Manage and maintain catalogs',
    descriptionLists: [
      {
        title: 'Commands',

        list: [
          {
            description: 'Migrates dependencies to using catalogs',
            name: 'migrate',
          },
        ],
      },
    ],
    url: docsUrl('catalogs'),
    usages: ['pnpm catalog <command>'],
  })
}

export type CatalogCommandOptions = Pick<Config, 'cliOptions'> & {
  interactive?: boolean
}

export async function handler (opts: CatalogCommandOptions, params: string[]): Promise<string | undefined> {
  switch (params[0]) {
  case 'migrate':
    return catalogMigrate.handler(opts as catalogMigrate.CatalogMigrateCommandOptions, params.slice(1))
  default:
    return help()
  }
}
