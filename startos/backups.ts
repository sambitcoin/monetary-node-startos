import { sdk } from './sdk'

// Nothing is backed up. The whole /data volume — chain, monetary store, address
// index, Tor state — is derivable: it re-syncs and re-derives from the network,
// and holds no keys or user-created data (wallets connect from outside). A
// multi-terabyte backup of a re-syncable chain is not worth taking; restore
// starts a fresh sync.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes(),
)
