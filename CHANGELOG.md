# Changelog

## [1.0.1](https://github.com/equinor/lcm/compare/v1.0.0...v1.0.1) (2026-11-05)


### Bug Fixes

* set cancel-in-progress to false for on-push-master workflow. ([17f2b3d](https://github.com/equinor/lcm/commit/17f2b3d45a65b2526fa4c7f7ffb226c55a443889))


### Documentation

* explain which ref to select when running Deploy to Radix manually ([780a0db](https://github.com/equinor/lcm/commit/780a0db1d6344060fd3a5a4cae4eee59bea6f887))
* update runbook for GHCR images, dev environment and release flow ([c10b4fa](https://github.com/equinor/lcm/commit/c10b4fa7d8c0ac89dbfc8a277861382b482934e8))


### Miscellaneous Chores

* **catalog:** link to the dev environment instead of test ([ee1891c](https://github.com/equinor/lcm/commit/ee1891c68e9b3bc6054c2d9b88ffc96c59dc4c1c))
* fix pre-commit errors. ([59eded1](https://github.com/equinor/lcm/commit/59eded1deafd6aa63c6b9cf77c5b2b7fdef61d35))
* **radix:** redirect the old test URL to the dev environment ([ba69fec](https://github.com/equinor/lcm/commit/ba69fec519ddbbf59c57a69642423ef9cd0cc836))


### Continuous Integration

* add docker login using pat set in github repo secrets ([861d760](https://github.com/equinor/lcm/commit/861d7606b164ea9c4027068516d4b2c7c8b4fea2))
* bootstrap release-please from the commit that introduced it ([fb6bd5a](https://github.com/equinor/lcm/commit/fb6bd5ac22668ea45033876514fa502cd181e645))
* deploy releases from the release event so images build from the tagged commit ([ce3d4be](https://github.com/equinor/lcm/commit/ce3d4be1606658ebd1fc93e04ca7657f1f14757e))
* set owner and repository for the GitHub App token explicitly ([2051497](https://github.com/equinor/lcm/commit/20514973e4476f529d241c62f1bbcd28b594d395))
