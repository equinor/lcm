# Lost Circulation Material Optimizer

![CI](https://github.com/equinor/lcm/workflows/CI/badge.svg)

Web application for creating, comparing, and optimize blending of lost circulation material used to bridge fractures and stop losses in rock formations during petroleum drilling.

This repository is the result from the merger of the two summer intern projects from 2020.

- Team Blend <https://github.com/equinor/LCMLibrary-Blend>
- Team Bridge <https://github.com/equinor/LCMLibrary-Bridge>

![plot](doc/bridge-plot.png)

Deployed environments:
 - [Test](https://proxy-lost-circulation-material-test.radix.equinor.com)
 - [Production](https://lost-circulation-material.app.radix.equinor.com)

## Requirements

- docker
- docker-compose

## Running

1. Create a copy of `.env-template` called `.env` and populate it with values.
2. Build the containers

    ```sh
    docker compose build
    ```

3. Start the project

    ```sh
    docker compose up
    ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Operational runbook

[RUNBOOK](runbook.md)

## License

[MIT](LICENSE)
