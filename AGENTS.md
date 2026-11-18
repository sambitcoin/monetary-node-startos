# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

## Testing on signet

Mainnet is untestable in practice (≈2 TB, days). To exercise the real code path
on a small chain, temporarily add these two env vars to the daemon's `exec.env`
in `startos/main.ts`, build, and install:

```
MONETARY_NETWORK: 'signet',
MONETARY_ALLOW_TEST_NETWORKS: '1',
```

The image refuses a test network unless **both** are set — the second is the
deliberate unlock. Remove both before handing back or releasing: the shipped
package is mainnet only.

## Do not enable the pruner

`MONETARY_PRUNE` is fixed to `'0'`. The block-deleting pruner has never run in a
release configuration upstream and is destructive. Do not flip it without a
tested reason.
