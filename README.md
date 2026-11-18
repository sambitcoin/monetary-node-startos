<p align="center">
  <img src="icon.svg" alt="Monetary Node Logo" width="21%">
</p>

# Monetary Node on StartOS

> Everything not listed in this document should behave the same as upstream
> Monetary Node. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Monetary Node is a full Bitcoin node that validates every consensus rule and
then stores each block with the data carriers (inscription witness, oversized
`OP_RETURN`, Stamp-style bare multisig, oversized scriptSig) removed, keeping
the 32-byte txid of every transaction it modifies or discards so the block
still verifies against the proof-of-work in its own header. Upstream project:
<https://github.com/sambitcoin/BitcoinMonetaryNode>.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package wraps the upstream prebuilt image unmodified, pinned by digest.

| What          | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| Image source  | `ghcr.io/sambitcoin/monetary-node`, upstream, unmodified, pinned by digest         |
| Architectures | x86_64, aarch64 (upstream publishes no riscv64)                                     |
| Entrypoint    | Upstream `/app/docker-entrypoint.sh`, invoked with the `all` argument              |

The image is **self-contained** — it embeds its own unmodified Bitcoin Core,
Tor, the stripper daemon, a block pruner, an `electrs` address index, and the
dashboard. The `all` role runs `monetary_supervisor.py`, which starts and
supervises that whole set as one process tree. The daemon runs as PID 1
(`runAsInit`) so the supervisor receives `SIGTERM` and reaps its children, and
it is given a 5-minute shutdown window so the stripper can finish the block it
is on before exit.

There is one subcontainer, `monetary-node-sub`, running the whole node. Attach
to a running install with
`start-cli package attach monetary-node -n monetary-node-sub -- <cmd>`.

## Volume and Data Layout

A single volume holds everything the node persists; there is no second data
path to mount.

| Volume | Mount point | Holds                                               |
| ------ | ----------- | --------------------------------------------------- |
| `main` | `/data`     | The chain, the monetary store, the address index, Tor state, and the node's generated `bitcoin.conf`/`monetary.conf`. |

## File Models

None. The package owns no file model and writes no configuration file onto the
volume itself. The node generates and manages its own `bitcoin.conf` and
`monetary.conf` under `/data` from the environment variables the package sets;
StartOS does not read or rewrite them, and there is no `store.json`.

## Dependencies

None. Unlike a dashboard-only sibling, this package embeds its own Bitcoin
Core and does not depend on a separate Bitcoin service — it is the node.

## Network Access and Interfaces

Two interfaces, both bound by the package.

| Interface  | id         | Type  | Internal port | Protocol            | Purpose                                                              |
| ---------- | ---------- | ----- | ------------- | ------------------- | ------------------------------------------------------------------- |
| Dashboard  | `dashboard`| `ui`  | 8080          | HTTP (TLS at edge)  | Node status, sync and stripping progress, spam measurements, and an advanced settings panel. |
| Electrum Server | `electrum` | `api` | 50001 | Raw TCP, plaintext  | Where wallets (Sparrow, Electrum) connect over the Electrum protocol. |

The dashboard is **mostly** a status page, but it is not read-only: it carries
an **advanced settings panel** (the node's `node_settings` network/index
toggles — Tor, clearnet, I2P, address index) that writes `/data/monetary.conf`
and takes effect on the next restart. It has **no login**, so anyone who can
reach the dashboard address can change those settings — the only guard on
clearnet is the panel's own warning. The Electrum port is plaintext and
unauthenticated, the same footing as every home Electrum server; it is
published with `secure: { ssl: false }` and is reachable on the addresses the
user enables.

**Outbound connectivity (the node's defining property).** The package ships
with Tor **on** (`MONETARY_TOR=1`) and the embedded node runs `onlynet=onion`
with `dnsseed=0`/`dns=0` — it dials only onion peers and never touches
clearnet. The supervisor **gates bitcoind on Tor**: it starts Tor first, waits
for the SOCKS port to accept, and if Tor never comes up it raises and refuses
to start bitcoind at all ("Refusing to run a node that was asked for Tor
without it") rather than risk a clearnet sync. Clearnet is **off by default**
and the package exposes no switch for it; it can only be enabled from the
dashboard's advanced settings panel, which warns that doing so publishes the
server's IP. Turning Tor off there produces a node that will not connect rather
than one that silently falls back to clearnet.

## Installation and First-Run Flow

The node boots as soon as it is started — there is no setup wizard and no
credential to create. On first start it writes its own `bitcoin.conf`, then
the supervisor brings up Tor and Bitcoin Core and begins a full initial block
download **over Tor**; only once blocks are buried past the configured depth
does the stripper begin writing the monetary store, and the address index is
built after that. This takes **days** on mainnet, and nothing is stripped
until the chain is in. The image measures free space before it starts and
**refuses to run** if the store will not fit, to avoid filling the disk under
every other service on the machine.

## Actions

None. The package exposes no actions; the node is configured entirely by the
environment variables the package fixes at build (see the Quick Reference).

## Tasks

None. The service is never held on a prompt, and its ordinary controls are
always available.

## Health Checks

One readiness check; no standalone checks.

| Check       | Probes                                 | Grace   | A failure means                                                                 |
| ----------- | -------------------------------------- | ------- | ------------------------------------------------------------------------------- |
| `dashboard` | The dashboard's port 8080 is listening | 120 s   | The dashboard process has not yet bound its port. During the long first start this reads as *starting*, not a fault; a persistent failure after the node has been up means the supervisor or the dashboard inside it has crashed — attach to `monetary-node-sub` and read the supervisor log. |

The readiness check reports only that the web page is up. It does **not** report
chain sync or stripping progress — that lives on the dashboard page itself,
which is reachable long before the node is fully synced.

## Backups and Restore

Strategy: **nothing is backed up** (`sdk.Backups.ofVolumes()` with no volume).
The entire `/data` volume is derivable — the chain re-syncs from the network and
the monetary store and index re-derive from it — and it holds no keys or
user-created data, because wallets connect from outside and the node never holds
one. A multi-terabyte backup of a re-syncable chain is not worth taking. A
restored or reinstalled instance therefore starts a **fresh sync from genesis**,
which again takes days.

## Limitations and Differences

1. **Alpha, unreviewed.** Upstream is explicit that this is alpha software
   written by one person. The empty-disk, mainnet-from-genesis path has never
   been run end to end by anyone; signet has.
2. **Mainnet only.** The package ships for Bitcoin mainnet; no test-network
   selection is exposed.
3. **Large and slow first run.** ~2 TB of fast storage recommended (1.5 TB
   floor), and the first sync-strip-index takes days. If free space ever
   reaches the node's 20 GiB floor, its disk watchdog stops Bitcoin Core — and
   because the pruner ships disabled (item 4), nothing frees space, so it will
   not resume until the disk is enlarged. Give it the full recommended disk.
4. **The block-deleting pruner is disabled** (`MONETARY_PRUNE=0`). It has never
   run in a release configuration and is destructive; the package does not
   expose a way to enable it.
5. **Cannot serve stripped blocks to an ordinary Bitcoin node.** Monetary nodes
   can serve each other; a normal node asking for the original bytes of a
   stripped transaction cannot be answered.
6. **The Electrum interface is IPv4 and plaintext.** The embedded index binds
   IPv4 only, so IPv6 addresses for that interface do not serve; wallets connect
   on the LAN IPv4 / `.local` address.
7. **No backups.** Disaster recovery is a full re-sync, by design (see above).

---

## Quick Reference for AI Consumers

```yaml
package_id: monetary-node
image: ghcr.io/sambitcoin/monetary-node
architectures: [x86_64, aarch64]
subcontainers: [monetary-node-sub]
volumes:
  main: /data
file_models: []
startos_managed_env_vars:
  - MONETARY_DATA_DIR
  - MONETARY_TOR
  - MONETARY_PRUNE
  - MONETARY_INDEX
  - MONETARY_START_HEIGHT
  - MONETARY_DEPTH
dependencies: none
interfaces:
  dashboard: { type: ui, port: 8080 }
  electrum: { type: api, port: 50001 }
actions: []
tasks: []
health_checks:
  - dashboard
```
