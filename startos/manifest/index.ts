import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'monetary-node',
  title: 'Monetary Node',
  license: 'BSD-2-Clause',
  packageRepo: 'https://github.com/sambitcoin/monetary-node-startos',
  upstreamRepo: 'https://github.com/sambitcoin/BitcoinMonetaryNode',
  marketingUrl: 'https://github.com/sambitcoin/BitcoinMonetaryNode',
  donationUrl: null,
  description: { short, long },
  // The chain, the monetary store, the address index and Tor state all live
  // under one volume mounted at /data.
  volumes: ['main'],
  images: {
    'monetary-node': {
      source: {
        dockerTag:
          'ghcr.io/sambitcoin/monetary-node@sha256:d274ef44a4f8068eca50a175fe77503eeed9754c03805fe105939d89e49c0319',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
