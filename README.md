# Destination Router

## App description

This is a router-app that handles incoming events and routes them into other destinations. To receive events app exposes a simple HTTP-endpoint, whereto authorized clients may send HTTP-requests. App operate according to the specified destinations config and the routing strategy. Custom strategy can be specified in client request.

[Requirements](https://gist.github.com/yetithefoot/96899b317d90c90a7034f92e885d5850)

### Start up / Usage

Use following commands to start the app

To install all necessary dependencies

```shell
npm install
```

To build application

```shell
npm run build
```

Before: Run mongo locally OR use mongo image from docker compose. After:

```shell
npm run dev
```

2nd option: run the application with all dependencies using docker compose:

```shell
# daemon mode
docker compose up -d --build
```

## API endpoints

Use this endpoint for authorizations
`POST localhost:3000/login` with

```shell
JSON body {
    // default user credentials
    "login": "admin",
    "password": "admin"
}
```

returns `token` which you need for the next calls.

Use this endpoints to send event
`POST localhost:3000/router` with
token in header `Authorization: Bearer <your-token>`

```shell
JSON body {
	"payload": { "a":1, "b":2 },
	"possibleDestinations": [
		{
			"destination1": true,
			"destination2": false,
			"destination3": true
		},
		{
			"destination1": true,
			"destination2": true,
			"destination4": true
		},
		{
			"destination5": true
		}
	],
    "strategy": "() => { return true; }"
}
```

or other request body. Check [examples](https://gist.github.com/yetithefoot/96899b317d90c90a7034f92e885d5850#test-1)

### Environment variables

| Name                    | Value Type Options | Default Value                       | Description                             |
| :---------------------- | :----------------- | :---------------------------------- | :-------------------------------------- |
| `PORT`                  | `Number`           | `3000`                              | Default port                            |
| `DEFAULT_USER_LOGIN`    | `String`           | `admin`                             | Default user login credentials          |
| `DEFAULT_USER_PASSWORD` | `String`           | `admin`                             | Default user password credentials       |
| `JWT_SECRET`            | `String`           | `secret`                            | JWT secret to generate token            |
| `JWT_EXPIRES`           | `String`           | `1d`                                | Expiration period for jwt token         |
| `MONGODB_NAME`          | `String`           | `test-task`                         | Mongo database name.                    |
| `MONGODB_URI`           | `String`           | `mongodb://mongodb:27017/test-task` | Connection string to connect to mongodb |
