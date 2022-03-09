import type { GlobEnvConfig, GlobConfig } from '@admin/types'

import { warn, getAppConfigFileName } from '@admin/utils'
import { version } from '../../package.json'

export const createStorageKeyPrefix = () => {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppConfig()
  return `${VITE_GLOB_APP_SHORT_NAME}_${import.meta.env.MODE}`.toUpperCase()
}

// Generate cache key according to version
export const createStorageName = () => {
  return `${createStorageKeyPrefix()}${`_${version}`}_`.toUpperCase()
}

export const getAppConfig = () => {
  const ENV_NAME = getAppConfigFileName(import.meta.env)

  const ENV = (
    import.meta.env.DEV
      ? // Get the global configuration (the configuration will be extracted independently when packaging)
        (import.meta.env as any)
      : window[ENV_NAME]
  ) as GlobEnvConfig

  const { VITE_GLOB_APP_SHORT_NAME } = ENV

  if (!/^[a-zA-Z\_]*$/.test(VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    )
  }

  return ENV
}

export const getGlobalConfig = (): Readonly<GlobConfig> => {
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_OIDC_clientRoot,
    VITE_GLOB_OIDC_stsAuthority,
    VITE_GLOB_OIDC_CLIENTID,
    VITE_GLOB_OIDC_SCOPE,
  } = getAppConfig()

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    title: VITE_GLOB_APP_TITLE,
    apiUrl: VITE_GLOB_API_URL,
    shortName: VITE_GLOB_APP_SHORT_NAME,
    uploadUrl: VITE_GLOB_UPLOAD_URL,
    scope: VITE_GLOB_OIDC_SCOPE,
    clientId: VITE_GLOB_OIDC_CLIENTID,
    clientRoot: VITE_GLOB_OIDC_clientRoot,
    stsAuthority: VITE_GLOB_OIDC_stsAuthority,
  }
  return glob as Readonly<GlobConfig>
}
