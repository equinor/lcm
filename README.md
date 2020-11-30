# Lost Circulation Material Optimizer

![CI](https://github.com/equinor/lcm/workflows/CI/badge.svg)

Web application for creating, comparing, and optimizing lost circulation material blends used for bridging fractures in
petroleum rock formations during drilling.

This repository is the result from the merger of the two summer intern projects from 2020.

- Team Blend <https://github.com/equinor/LCMLibrary-Blend>
- Team Bridge <https://github.com/equinor/LCMLibrary-Bridge>

![plot](bridge-plot.png)

## Requirements

- docker
- docker-compose

## Running

```bash
# Build containers
docker-compose build

# Start containers
docker-compose up
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Operational runbook

[RUNBOOK](runbook.md)

## License

[MIT](LICENSE)
