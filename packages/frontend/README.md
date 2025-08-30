# Wafrn - Angular

This package is the frontend of Wafrn.

The frontend of Wafrn uses [Angular](https://angular.io/). Have fun doing stuff ;D

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Start by setting up the frontend as noted in the main `development.md` file.

The frontend is developed from the main directory due to the monorepo structure of this project. As such, run the noted commands from the root directory.

## Local Development

You can run the development server through the command line:

```bash
npm run frontend:develop             # Point to local backend
npm run frontend:develop:prod        # Point to production app.wafrn.net backend
npm run frontend:develop:development # Point to development.wafrn.net backend
```

> [!NOTE]
> When switching backend sources, make sure to clear your localStorage as the environment is cached

If you have Nix installed, you can also run the development environment through the provided `shell.nix` file which includes Node 20.

```bash
nix-shell

# Now in nix shell with Node 20 installed
```

To run the frontend pointing to the production server and immediately exit upon the command's completion, you can run:

```bash
nix-shell --command "trap 'exit' INT;npm run frontend:develop:prod"
```

In either case, when the server is set up, you should get a success message:

```text
Watch mode enabled. Watching for file changes...
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

Merge pull requests to the `development` branch.

## License

[Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)
