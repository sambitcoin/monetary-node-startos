# Updating the upstream version

Upstream is the prebuilt image `ghcr.io/sambitcoin/monetary-node`, pinned **by
digest** in `startos/manifest/index.ts`. A digest is immutable; a tag can be
moved under you, so the package always pins the digest.

## Determining the upstream version

The pin lives in `startos/manifest/index.ts` → `images['monetary-node'].source.dockerTag`,
as `ghcr.io/sambitcoin/monetary-node@sha256:<digest>`.

Upstream distributes through its Umbrel app store. The authoritative digest for
a release is the one in that store's compose file:

```
curl -s https://raw.githubusercontent.com/sambitcoin/monetary-app-store/main/sambitcoin-monetary-node/docker-compose.yml | grep image:
```

To resolve the digest of a published tag directly:

```
docker buildx imagetools inspect ghcr.io/sambitcoin/monetary-node:<tag>
```

Confirm the new digest is multi-arch (amd64 + arm64) before pinning it:

```
docker manifest inspect ghcr.io/sambitcoin/monetary-node@sha256:<digest> | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Replace the `@sha256:<digest>` in `startos/manifest/index.ts` with the new one.
2. Bump `version` in `startos/versions/current.ts` and write its `releaseNotes`
   in all five locales. The upstream version string (e.g. `0.1.0-alpha`) maps to
   the StartOS version as `<upstream>:<packaging-revision>` — e.g. `0.1.0:0`.
3. Rebuild and re-verify on a box (see `AGENTS.md` for the signet test path).
