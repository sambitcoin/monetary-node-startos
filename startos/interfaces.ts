import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  dashboardHostId,
  dashboardPort,
  electrumHostId,
  electrumPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // Dashboard — HTTP. StartOS terminates TLS at the edge and proxies plain
  // HTTP to the container, which binds the port on IPv4.
  const dashboardMulti = sdk.MultiHost.of(effects, dashboardHostId)
  const dashboardOrigin = await dashboardMulti.bindPort(dashboardPort, {
    protocol: 'http',
  })
  const dashboard = sdk.createInterface(effects, {
    name: i18n('Dashboard'),
    id: 'dashboard',
    description: i18n(
      'The Monetary Node dashboard: node status, sync and stripping progress, spam measurements, and the network and index settings panel.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  // Electrum server — raw TCP, plaintext, as every home Electrum server is.
  // `secure: { ssl: false }` publishes it as a plain port on the addresses the
  // user enables; wallets reach it on the LAN address.
  const electrumMulti = sdk.MultiHost.of(effects, electrumHostId)
  const electrumOrigin = await electrumMulti.bindPort(electrumPort, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: electrumPort,
    secure: { ssl: false },
  })
  const electrum = sdk.createInterface(effects, {
    name: i18n('Electrum Server'),
    id: 'electrum',
    description: i18n(
      'Connect a wallet such as Sparrow or Electrum over the Electrum protocol. Unauthenticated, like every home Electrum server.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [
    await dashboardOrigin.export([dashboard]),
    await electrumOrigin.export([electrum]),
  ]
})
