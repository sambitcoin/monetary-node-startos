# Monetary Node

Before you start, know two things the listing stressed: this is **alpha
software**, and the first run takes **days** and needs a large, fast disk
(~2 TB recommended, 1.5 TB floor). The node checks free space on startup and
refuses to run rather than fill the disk under your other services.

## Documentation

- [Monetary Node overview](https://github.com/sambitcoin/monetary-app-store/blob/main/README.md) — what the app is, what it stores, and how wallets connect.
- [The project, concept and measurements](https://github.com/sambitcoin/BitcoinMonetaryNode/blob/main/README.md) — the design behind removing data carriers, and the measured results.

## What you get on StartOS

A complete Bitcoin node in one package — it runs its own Bitcoin Core, Tor and
address index, with nothing else to install. It exposes two interfaces:

- A **Dashboard** web page showing the node's status, its sync and stripping
  progress, and how much carrier "spam" it has removed. It also has an advanced
  settings panel.
- An **Electrum Server** your wallet connects to, so you can hold and watch
  balances computed from blocks that were stored without inscription data.

The node connects to the Bitcoin network **only over Tor** out of the box, and
it will not start syncing until Tor is up — so your home IP is never shown to
peers. Keep it that way. The only way to turn clearnet on is in the dashboard's
advanced settings, and it warns you there that doing so publishes your IP.

## Getting set up

1. Make sure the drive this installs to has room — about 2 TB is comfortable,
   1.5 TB is the floor. If it is too small, the node will refuse to start and
   tell you so.
2. Start the service and open the **Dashboard** interface. The first run
   downloads and validates the whole blockchain over Tor, then strips it, then
   builds the address index — expect **days** before a wallet can connect. The
   dashboard shows which stage it is in; nothing is stripped until the chain is
   fully in.
3. When the dashboard shows the index is built, point your wallet at the
   **Electrum Server** interface. Open that interface, copy its address, and in
   Sparrow or Electrum add it as an Electrum server using the plain-TCP (not
   SSL) option. You are never asked for a seed or anything that can spend.

Your wallet's connection to the Electrum server is unauthenticated on your
local network, exactly as a home Electrum server normally is — anyone already
on your network can query it.

## Using Monetary Node

### Dashboard

Mostly a status page: it shows the sync and strip progress during the long
first run, and afterwards the node's state and the running spam-removal totals.
It also has an **advanced settings** panel for the node's network and index
options (Tor, clearnet, address index). Changes there take effect when the
service restarts. The dashboard has no password, so treat anyone who can reach
it as able to change those settings.

### Electrum Server

Your wallet talks to this, not to you. Once the index is built, your balances
and history are computed from the stripped store and should match any other
node. The node's own connections to Bitcoin peers already go over the embedded
Tor, so those peers do not see your home IP address — you do not need to do
anything for that.

## Limitations

- **Alpha.** One author, unreviewed by anyone else. Installing onto an empty
  disk and building mainnet from scratch has not been tested end to end — you
  may be the first to run exactly that path.
- **Mainnet only.** There is no test-network option.
- **It cannot serve stripped blocks to an ordinary Bitcoin node.** Your wallet
  works; a normal node asking this one for the original bytes of a stripped
  transaction cannot be answered.
- **No backup.** The whole chain and store rebuild from the network, so there
  is nothing to back up; recovering means a fresh sync, which again takes days.
