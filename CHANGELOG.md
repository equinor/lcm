# Changelog

## [1.0.2](https://github.com/equinor/lcm/compare/v1.0.1...v1.0.2) (2026-11-06)


### Bug Fixes

* make SharePoint product sync work and replace products atomically ([f66701c](https://github.com/equinor/lcm/commit/f66701cc1748115f7adc3c5584ef7b18fb530a52))


### Documentation

* replace poetry commands with uv in developer guide ([33193f2](https://github.com/equinor/lcm/commit/33193f2d41dab4fa7db455fb195e7c407c5af85e))
* update runbook with mise commands ([78e1e2b](https://github.com/equinor/lcm/commit/78e1e2b5f4f01692447166dbca9087e3ba5fa819))


### Miscellaneous Chores

* add mise setup ([07c4ae4](https://github.com/equinor/lcm/commit/07c4ae43a22f4260476a7024dfb08c841da32fad))
* **deps:** bump @biomejs/biome ([50a7255](https://github.com/equinor/lcm/commit/50a7255f48cf47956bec38dd5992d9c611ccc521))
* **deps:** bump gunicorn from 25.1.0 to 26.2.0 in /api ([9d276c7](https://github.com/equinor/lcm/commit/9d276c76d3fd4134f99e535a8518bee564d79c47))
* **deps:** bump https://github.com/biomejs/pre-commit ([0c45923](https://github.com/equinor/lcm/commit/0c4592396e989c17ddead9228932d93a4d567b2e))
* **deps:** bump https://github.com/compilerla/conventional-pre-commit ([8b8539e](https://github.com/equinor/lcm/commit/8b8539e93a47aa1c0a0a89a8f36050ca6c768996))
* **deps:** bump the npm-minor-patch group across 1 directory with 3 updates ([5252768](https://github.com/equinor/lcm/commit/525276855b429c0b724fc1fb25ac8189e8934a7e))
* **deps:** bump the python-minor-patch group across 1 directory with 5 updates ([81341a0](https://github.com/equinor/lcm/commit/81341a07158e13536a969be1b672a6fd0c30c012))


### Build System

* migrate api from poetry to uv ([c4a5179](https://github.com/equinor/lcm/commit/c4a5179f1a9006b9641c7520b147da05a2c3e3f9))


### Continuous Integration

* bump uv.lock version in release-please ([7bb6a00](https://github.com/equinor/lcm/commit/7bb6a0081716bf2fbc3c3d47fc0e292197cf6944))

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
