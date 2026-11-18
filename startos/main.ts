import { i18n } from './i18n'
import { sdk } from './sdk'
import { dashboardPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Monetary Node!'))

  // One subcontainer, shared by the chown oneshot and the node daemon.
  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'monetary-node' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'monetary-node-sub',
  )

  /**
   * The node daemon runs the image's `all` role — `monetary_supervisor.py`,
   * which supervises the whole node as one process tree: Tor, an embedded
   * unmodified Bitcoin Core, the stripper, the pruner, the address index and
   * the dashboard.
   */
  return (
    sdk.Daemons.of(effects)
      // StartOS mounts the volume root-owned each start, but the image runs as
      // `monetary`. Hand it the mountpoint so it can create its store, index
      // and datadir under /data. Non-recursive: the app's own subtrees persist
      // monetary-owned once created, so there is no multi-terabyte walk here.
      .addOneshot('chown-data', {
        subcontainer: sub,
        exec: {
          command: ['chown', 'monetary:monetary', '/data'],
          user: 'root',
        },
        requires: [],
      })
      .addDaemon('monetary-node', {
        subcontainer: sub,
        exec: {
          command: sdk.useEntrypoint(['all']),
          // monetary_supervisor.py is the container's process supervisor, as it
          // is under Docker; it must be PID 1 to receive SIGTERM and reap its
          // tree.
          runAsInit: true,
          // The stripper must finish the block it is on — a mid-record SIGKILL
          // corrupts the store. The supervisor stops cleanly between blocks.
          sigtermTimeout: 300_000,
          env: {
            MONETARY_DATA_DIR: '/data',
            MONETARY_TOR: '1',
            // The block-deleting pruner has never run in a release
            // configuration and is destructive; ship it off.
            MONETARY_PRUNE: '0',
            MONETARY_INDEX: '1',
            MONETARY_START_HEIGHT: '0',
            MONETARY_DEPTH: '6',
          },
        },
        // The dashboard binds its port early and reports the node's progress,
        // so a listening socket means the web interface is up even while the
        // chain syncs.
        ready: {
          display: i18n('Dashboard'),
          // First run downloads and validates the whole chain over Tor; give
          // the dashboard a long grace before a not-yet-bound port reads as
          // failure.
          gracePeriod: 120_000,
          fn: () =>
            sdk.healthCheck.checkPortListening(effects, dashboardPort, {
              successMessage: i18n('The dashboard is ready'),
              errorMessage: i18n('The dashboard is not ready'),
            }),
        },
        requires: ['chown-data'],
      })
  )
})
