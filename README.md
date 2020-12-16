# Lost Circulation Material Optimizer

![CI](https://github.com/equinor/lcm/workflows/CI/badge.svg)

Web application for creating, comparing, and optimize blending of lost circulation material used to bridge fractures and stop losses in rock formations during petroleum drilling.

This repository is the result from the merger of the two summer intern projects from 2020.

- Team Blend <https://github.com/equinor/LCMLibrary-Blend>
- Team Bridge <https://github.com/equinor/LCMLibrary-Bridge>

![plot](bridge-plot.png)

## Requirements

- docker
- docker-compose

## Running

1. Create a copy of `.env-template` called `.env` and populate it with values.
2. Build the containers

    ```sh
    docker-compose build
    ```

3. Start the project

    ```sh
    docker-compose up
    ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Operational runbook

[RUNBOOK](runbook.md)

## Interpolating new fraction data

Bridge data from products on a different scale than the one defined at `api/calculators/bridge.py:45` can be added to
the LCM optimizer as long as the data gets interpolated into the same scale.

That can be done like this;

1. Add a file at `./api/test_data/interpolate_input.csv`
2. Have the first column be called "Size" and have 101 measuring points of the products
3. Add one column for each product, where the header is the name of the product.
    ```csv
    Size,Prod1,Prod2
    0.01,0,0
    0.011482,0,0
    ...
    10000,100,100
    ```
4. Run `docker-compose build api && docker-compose run api python calculators/fraction_interpolator.py`
5. One result file for each product will be created in `./api/test_data/`

## License

[MIT](LICENSE)
