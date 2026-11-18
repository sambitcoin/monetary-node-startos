// The dashboard's HTTP port inside the container (MONETARY_WEB_PORT default).
export const dashboardPort = 8080
// The Electrum server's raw-TCP port (MONETARY_WALLET_PORT default), where
// wallets connect.
export const electrumPort = 50001

// MultiHost ids for the two interfaces.
export const dashboardHostId = 'dashboard'
export const electrumHostId = 'electrum'
