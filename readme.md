# NextJS export to S3

This script treats a NextJS export for S3-friendliness. It's main task is to add an extension-less copy of every html page, e.g. `foo.html` becomes `foo` to S3 alongside the files that are created during `next export`. This is not possible on the filesystem but is possible on s3 so another goal of this script is to sort the tree into as few s3-syncable groups as possible given the full tree and then upload them.

## Concepts

### Preview

### Production

## Installation

```
yarn global add nextjs-export-to-s3
```

## Usage

To deploy a standalone preview build

```
nextjs-export-to-s3 preview
```

To deploy a production build

```
nextjs-export-to-s3 production
```

## Inspiration

Everything in this repo is based on the following gist: https://gist.github.com/rbalicki2/30e8ee5fb5bc2018923a06c5ea5e3ea5

