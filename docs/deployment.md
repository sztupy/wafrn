# Host Wafrn Yourself

## What will you need

If you need support you can also always find the latest Discord invite [on our website](https://wafrn.net)

Prerequisites:

1. Wafrn requires you to have a domain name you can fully configure. There are plenty of places to get one, and it's outside the scope of a guide like this to recommend any of them.
2. Time and dependent on the install method some or more knowledge of linux based systems.

To set up wafrn you have three options:

1. Use the automated scripts that set up wafrn on Oracle Cloud's Always Free infrastructure automatically. Also it's free<sup>\*<sup>
2. Already have a Debian / Ubuntu based computer in the cloud, and use the installer script to set up wafrn
3. Have a modern Linux based box lying around somewhere and you want to install wafrn on it manually

<sup>\*</sup>: You do need to accept Oracle's T&C, which might or might not contain crazy stuff. Also you'll need a Debit/Credit card for verification.

## Oracle Cloud

Use the below button to set up a fully working Wafrn instance on Oracle Cloud's Always Free instances:

[![Deploy to Oracle Cloud][magic_button]][magic_wafrn_basic_stack]

Documentation for the OCI integration [can be found in a separate repository](https://github.com/sztupy/wafrn-opentofu).

## Installer

Alternatively, you will need a Debian 12 VPS. The cheap Netcup ARM one can do the trick with no problem. Maybe even the OVH one that costs 3 euros too. But I advise as a minimum the Netcup ARM one. (Contabo is no longer recomended)

You will also need a way of sending emails to the people registering. An SMTP server or a free Brevo account with SMTP enabled can do the trick.

First, point the domain to your Debian VPS. Once that is done, we download the installer and execute it.

The installer will ask a few questions, then install docker and set up the application. It will be installed for the current logged in user.

```bash
wget https://codeberg.org/wafrn/wafrn/raw/branch/main/install/installer.sh
bash installer.sh
```

Once this has been run successfully you should be able to login to your website using the credentials displayed. If you lost the values you can find them in the `~/wafrn/.env` file.

Note: due to the installer installing new user groups in the system and setting up some temporary environment variables it is **highly** advised to log out and log back in to avoid potential issues with your groups and environments.

## Manual install

If you don't wish to run a random bash script obtained from the internet, you can also install wafrn manually.

Pre-requisites: A linux based system with bash, git, build essentials and docker pre-installed.

### Checkout project

You'll need to get the project files ready in a directory of your choice:

```bash
git clone git@github.com:gabboman/wafrn.git
cd wafrn
```

### Configure environment

There is a convenience script that will generate secret values appropriately. To run type

```bash
bash install/env_secret_setup.sh
```

Next you'll need to choose between one of the `docker-compose.*.yml` files:

1. `simple`: Basic installation, this is the least resource heavy option.
2. `simple.metrics`: Basic installation with Grafana support. Uses more resources.
3. `advanced`: Advanced installation with multiple separate workers running for better load distribution. Uses more resources
4. `advanced.metrics`: Advanced installation with Grafana suppport. The most complete, but also more resource intense option.

Next you'll need to fill in all of the details of your domain. For example if you're trying to run your website under `wafrn.example.com` (and your DNS is already pointing to the computer running docker) you'll need to update the following details:

```sh
DOMAIN_NAME=wafrn.example.com
CACHE_DOMAIN=cache.wafrn.example.com
MEDIA_DOMAIN=media.wafrn.example.com
PDS_DOMAIN_NAME=bsky.example.com

# use the same domains as set above for MEDIA and CACHE
FRONTEND_MEDIA_URL="https://media.wafrn.example.com"
FRONTEND_CACHE_URL="https://cache.wafrn.example.com/api/cache?media="

ACME_EMAIL=admin@example.com
```

Note: even if you don't intend to run the Bluesky integration you'll need to set a `PDS_DOMAIN_NAME` that is different to the main domain you use. You can however make this a fake one, like `bsky.example.com`. Also it's advised to set `COMPOSE_PROFILES=default` in your `.env` file, so docker compose will not run the bluesky related containers.

You'll also need to fill in the `SMTP` settings for emails to work.

### Run

Next to run the setup just call

```
docker compose up --build -d
```

Once the scripts run and everything is okay you should be able to access your website at `https://wafrn.example.com`

## Upgrading, Updating and Backups

Before you update please check the [CHANGELOG.md](../CHANGELOG.md) for any breaking changes that you might need to be aware of

Go to your `wafrn` directory and enter:

```bash
git pull origin main
docker compose stop
docker compose up --build -d
```

You can also find a small management script that can backup, restore and update your instance:

```bash
./install/manage.sh backup
./install/manage.sh update
```

By default the installation will create a backup every day and keep it for 10 days. You can also [add post-backup scripts](https://github.com/sztupy/wafrn-opentofu/blob/main/scripts/post_backup.template.sh) that you can configure to copy the backups to an off-site location, like any S3 compatible bucket.

You can also restore a backup if needed:

```bash
./install/manage.sh restore <backup_directory>
```

## BlueSky integraton

If you used the OCI integration or the installer and enabled Bluesky then it should already work you.

If you set up wafrn manually, then follow the steps below:

1. Make sure to have `ENABLE_BSKY=false` for now, as the system will break otherwise

2. Create a new domain for your Bluesky service. For example we'll use `bsky.example.com`

3. Make sure in your DNS host both `bsky.example.com` and `*.bsky.example.com` points to the computer you're running docker compose

4. Make sure `COMPOSE_PROFILES=bluesky` is set in your `.env` file

5. Run `docker compose up` to make sure everything is running

6. Run `./install/bsky/create-admin.sh`. This will create a user that the agent will use later and assign it to the admin account. If you use your admin account as your main (like on a single-user instance), then you can also provide a username to be generated (default is `wafrnadmin`), e.g. `./install/bsky/create-admin.sh myuser`. Make sure the username you chose is not one of the reserved names that cannot be used: https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/handle/reserved.ts

7. If the previous call was successful now you can enable `ENABLE_BSKY=true` in your config

8. Update and restart your system: `docker compose up --build -d`

9. Check if everything is still running

10. Use `./install/bsky/add-insert-code.sh` to add a new bluesky insert code to your system. You'll need to have one for any account you wish to enable bluesky for.

11. Open up your selected account profile and click "Enable bluesky". If all goes well, this account will now be enabled and accessible on Bluesky. Do note that some names are reserved under Bluesky and you won't be able to create an account for them, even on a personal server. For the full list of reserved names please see https://github.com/bluesky-social/atproto/blob/main/packages/pds/src/handle/reserved.ts

## Running on servers with other web applications

The setup assumes that Wafrn and PDS will be the only things running on the server you're on. The frontend image uses ports `80` and `443` and to operate properly needs access to both those ports for TLS management, especially for Bluesky support. This means that if you want to install Wafrn to a server that already runs other web based applications running on either ports, you're going to have a conflict. Wafrn uses Caddy as the web-server, which is a modern, fast, secure-by-default web server. While you can technically run Wafrn on other web servers (like apache or nginx), Bluesky's PDS specifically requires Caddy (especially it's `on_demand_tls` feature), and access to ports `80` and `443` for proper operation.

To help people who want to install both Wafrn and other web applications on the same server, Wafrn's `Caddyfile` is set up in a way for you to allow adding extra configuration. You can use this feature either to use Wafrn's Caddy to host your other apps directly, ot at least to reverse proxy to your existing web server (albeit with TLS/HTTPS already taken care of by Wafrn's Caddy), which will then serve your existing apps.

To facilitate this Wafrn's Caddy includes a couple hooks, where you can add extra configuration. The two most important are:

* If you create a file in `packages/caddy/main_domain_pre`, e.g. `packages/caddy/main_domain_pre/website.conf`, you can add extra configuration to your main Wafrn domain. Example:

  ```bash
  handle_path /website* {
    reverse_proxy host.docker.internal:8888
  }
  ```

  This setting will route anything on `https://<your_wafrn_domain>/website` to anything that's running on port `8888` on your `localhost`. Note: Caddy is secure-by-default, so accessing this through `http` will always redirect to `https` by default. There is currently no way to disable this for subdomains.

  *Note:* Make sure to also allow access to this host and port in your docker-compose file, by adding `extra_hosts: ["host.docker.internal:host-gateway"]` to your `frontend` configuration.

* If you create a file in `packages/caddy/vhosts`, e.g. `packages/caddy/vhosts/website.example.com.conf`, you can add additional vhosts. Example:

  ```bash
  website.example.com {
    reverse_proxy host.docker.internal:8888
  }
  ```

  This setting will route anything on `https://website.example.com` to whatever's running on port `8888`. As above, `http` will be automatically redirected to `https`, and Caddy will take care of obtaining the TLS certificates for you through Let's Encrypt. If you want to disable this, you can specify `http://website.example.com` on the first line to force this setting for http only. Also see the caveats about networking as well.

* There are other hooks if you need to update the global Caddy config, or want to add something to the other domains (cache, monitoring, pds) as well. The full list of hooks can be found in the [Caddyfile](https://codeberg.org/wafrn/wafrn/src/commit/main/packages/frontend/Caddyfile.example).

> *Note:* while it is possible to put Wafrn itself behind a reverse proxy of your existing web server, this is currently not a supported configuration, especially if you want to have Bluesky support enabled as well.
>
> If you really-really-really want to go down this route you'll need to disable caddy's automatic https feature, by creating a file called `packages/caddy/global/disable_https.conf` with the single line content of `auto_https disable_redirects`, and then change your docker compose file to serve the frontend on a port different to `80`, like `8123`. Afterwards update your existing web server's setting to reverse proxy all of the the wafrn domains (main, cache, cdn, pds) to this port, and you should be done. Note that Bluesky support will likely fail, unless you set up your web server to do TLS termination either for the entire `*.<bluesky_domain>` domain you have set up, or at least for the usernames your Bluesky users will be using, like `admin.<bluesky_domain>`, etc.

[magic_button]: https://oci-resourcemanager-plugin.plugins.oci.oraclecloud.com/latest/deploy-to-oracle-cloud.svg
[magic_wafrn_basic_stack]: https://cloud.oracle.com/resourcemanager/stacks/create?zipUrl=https://github.com/sztupy/wafrn-opentofu/releases/latest/download/wafrn-opentofu-latest.zip
