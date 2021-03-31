# ViteConnect Bridge Server

Fork from [node-walletconnect-bridge](https://github.com/WalletConnect/node-walletconnect-bridge)

## Development

```bash
yarn

yarn dev
```

## Production

### Using NPM

1. Build

```bash
yarn build
```

2. Production

```bash
yarn start
```

3. Check

```bash
$ curl http://localhost:5000/hello
> Hello World, this is WalletConnect v1.0.0-beta
```

### Using Docker

1. Build the container with:

```bash
yarn build:docker
```

2. Run the container with:

```bash
docker run -p 5000:5000 vitelabs/vite-connect-server
```

3. Check:

```bash
$ curl http://localhost:5000/hello
> Hello World, this is WalletConnect v1.0.0-beta
```
