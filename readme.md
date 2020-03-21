# NextJS export to S3

This CLI prepares a NextJS exported app for S3 deployment. The main responsibility is to add an extension-less copy of every html page, e.g. `foo.html` becomes `foo` to S3 alongside the files that are created during `next export`. This is not possible on the filesystem (because you cannot have a file and directory with the same name) but is possible and necessary on s3 so a secondary goal of is to sort the tree into as few s3-syncable groups as possible given the full tree and then upload each group with `aws s3 sync` rather than uploading each separately just to avoid writing to disk.

## Distributions

### Preview

A preview distribution is a standalone release that is usually temporary. There are no caching benefits and CloudFront is not required.

### Production

A production distribution is a standalone release that supports releases, rollbacks, and caching with CloudFront.

## Installation

```
yarn global add nextjs-export-to-s3
```

## Usage

To deploy a standalone preview build

```
nextjs-export-to-s3 preview s3://my-bucket/foo
```

To deploy a production build

```
nextjs-export-to-s3 production s3://my-bucket/foo
```

To release a production build

```
nextjs-export-to-s3 production s3://my-bucket/foo --current
```

## Inspiration

Everything in this repo is based on the following gist: https://gist.github.com/rbalicki2/30e8ee5fb5bc2018923a06c5ea5e3ea5
