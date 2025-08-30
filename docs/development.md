# Developing wafrn

## Project Structure

Wafrn is split between an [Angular](https://angular.dev) frontend and a [NodeJS](https://nodejs.org/en) backend.

```text
packages/
├── frontend/
│   ├── routes/
│   ├── util/
│   ├── README.md
│   └── ...
└── backend/
    ├── src/
    │   ├── app/
    │   ├── assets/
    │   └── ...
    ├── README.md
    └── ...
```

(Tree made with [tree.nathanfriend.io](https://tree.nathanfriend.io/))

## Contributing

If you would like to help develop the Frontend or Backend, read the README.md of the respective package.

- [Frontend - README.md](../packages/frontend/README.md)
- [Backend - README.md](../packages/backend/README.md)

## Local setup pointing to the production frontend

If you want to do development on the frontend and what you do does not require doing something like posting a lot or spaming an external account, you can simply:

1. Clone the repo
2. Install node 24 or use the provided Nix shell script
3. Run `npm install` at the root of the project
4. Run `npm run frontend:develop:prod`

If you want to point to a different backend or see additional information on the nix shells script, see the Frontend README file.

## Local setup with a local dummy instance

If you want to develop Wafrn frontend but require to do more "noisy" stuff, you can point it at a working instance. See [Frontend - README.md](../packages/frontend/README.md) for more details

If you want to setup both the backend and frontend locally there are a couple of helper scripts that can help you set up a local environment:

1. Run `./install/env_local_setup.sh`. This will setup the backend and frontend environment files to point to each other locally.

2. Run `docker compose up`. This will start up the required services: PostgreSQL, Redis and Caddy

> **Note:** If you're not a fan of docker, or you already have these services running, you can also install PostgreSQL, Redis and Caddy manually.

> **Note:** If you are running Caddy manually, or you are not using Docker Desktop but a more native docker installation, you will need to edit `packages/frontend/Caddyfile` and replace `host.docker.internal` with `localhost` for it to work properly.

3. Set up the the backend:

```sh
cd packages/backend
npm i
npm run db:migrate
```

4. Set up the frontend:

```sh
cd packages/frontend
npm i
npm exec -- ng build --configuration=devlocal
```

5. Start backend & frontend

```sh
cd packages/backend
NODE_TLS_REJECT_UNAUTHORIZED=0 npm start
```

```sh
cd packages/frontend
npm exec -- ng serve --host 0.0.0.0 --configuration=devlocal
```

6. If all is well go to `https://localhost` to see your app

The default username/password for local installation is: `admin@example.com` / `Password1!`

> **Note:** You can run `caddy trust` to install Caddy's root certificates, to the system store. This will remove the security warnings from your browser. You can also do `caddy untrust` once you're finished with the development.

> **Warning:** Due to how the Fediverse and Bluesky operates not all features will be accessible when developing the backend locally. You might [want to host your own Wafrn instance](./deployment.md) as a staging server if you wish to develop features that require proper access to the Fediverse and/or Bluesky

## Fullstack development with debugger

Ok so you definetively need to do some backend stuff! As long as you do not need to do fedi stuff and bluesky stuff, it's easy!

1. Clone the repo
2. Install docker and node 24
3. Do this command on the root of the project `npm install`
4. Copy the docker compose for local development `cp docker-compose.localBackendDebuggerDev.yml docker-compose.yml`
5. Copy the development environment file for backend `cp packages/backend/environment.dev.ts packages/backend/environment.ts`
6. Start the services required for wafrn to work: redis, postgres, and a db admin tool on https://localhost:8080 (type postgres, user and pass: root, db: wafrn) `docker compose up -d`
7. Check that you can connect to the database in your browser in https://localhost:8080 . If you have problem here, contact the dev team
8. Edit the environment file. Replace adminEmail and adminUser with youur desired email, user and password
9. Do this command to initialize the database `cd packages/backend && npm run db:migrate`
10. On the root directory, do this command to start the backend server: `npm run backend:develop`
11. Do this command to start the frontend `npm run frontend:develop:prod`
12. Enjoy!

### Fullstack development with fedi and bluesky access and debugger access

This part of the guide needs to be written properly, BUTT, the QUICK AND DIRTY explanation for this is:

Execute the steps of "Fullstack development with debugger"

You will require a VPS with caddy and a bluesky PDS and a domain

Update the config on environment.ts:
You will need to update: frontendUrl, instanceUrl, mediaUrl, externalCacheurl, email things too probably (optional), and if you want buesky too: enableBsky, bskyPds, bskyPdsJwtSecret, bskyPdsAdminPassword

Once you do that and have stuff runing, to listen to the bluesky pds you will also need to start the atproto listener

`npm run backend:atproto`

Regarding fedi, you will need to create a reverse proxy with the url of the instance pointing to your machine. What I do is that i use the vps as a jump like this:

`ssh  -R 3002:localhost:3002 USER@YOURVPS`

This will "mirror" your port 3002 to the internal port 3002 of your vps. You can reverse proxy that one.
