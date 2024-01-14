## Destination Router

## App description

This is a router-app that handles incoming events and routes them into other destinations. To receive events app exposes a simple HTTP-endpoint, whereto authorized clients may send HTTP-requests. App operate according to the specified destinations config and the routing strategy. Custom strategy can be specified in client request.

[Requirements](https://gist.github.com/yetithefoot/96899b317d90c90a7034f92e885d5850)

### Start up / Usage

Before: Run mongo locally OR use mongo image from docker compose. After:

```shell
npm run dev
```

2nd option: run the application with all dependencies using docker compose:

```shell
docker compose up -d --build
```

## API endpoints

### Environment variables
