# storage-service

A simple storage service.

[![Dependency Status](https://david-dm.org/plantain-00/storage-service.svg)](https://david-dm.org/plantain-00/storage-service)
[![devDependency Status](https://david-dm.org/plantain-00/storage-service/dev-status.svg)](https://david-dm.org/plantain-00/storage-service#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/storage-service.svg?branch=master)](https://travis-ci.org/plantain-00/storage-service)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/storage-service?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/storage-service/branch/master)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fstorage-service%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/storage-service)

## install

```bash
git clone https://github.com/plantain-00/storage-service-release.git . --depth=1 && yarn add --production
node dist/index.js
```

## docker

```bash
docker run -d -p 9245:9245 plantain-00/storage-service
```
