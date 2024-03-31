# Runnable Jar to Docker

[![NPM](https://img.shields.io/npm/v/runnable-jar-to-docker.svg?style=flat-square)](https://www.npmjs.com/package/runnable-jar-to-docker)

Creates and publishes a Docker image with a runnable `jar` from Maven Central.

Example (will create [this Dockerfile](https://hub.docker.com/r/tomasbjerre/git-changelog-command-line)):

```bash
npx runnable-jar-to-docker \
 --docker-username tomasbjerre \
 --docker-password *** \
 --maven-group se.bjurr.gitchangelog \
 --maven-artifact git-changelog-command-line \
 --maven-version 1.102.0
```

## Usage

Parameters:

```bash
Options:
  --docker-username <username>  Docker username
  --docker-password <password>  Docker password
  --maven-group <group>         Maven Group
  --maven-artifact <artifact>   Maven Artifact
  --maven-version <version>     Maven Package Version
  --compile-native <boolean>    True if the JAR should be compiled with GraalVM to native binary (default: false)
  --dry-run <boolean>           True if nothing should be done, just printed (default: false)
  -h, --help                    display help for command
```

## Example projects

- [git-changelog-command-line](https://hub.docker.com/r/tomasbjerre/git-changelog-command-line)
- [violations-command-line](https://hub.docker.com/r/tomasbjerre/violations-command-line)

## Developer instructions

You may build it with:

```bash
npm run build
```

You can try it without release with:

```bash
npm run build \
 && node ./lib/cli.js \
  --docker-username tomasbjerre \
  --docker-password $dockerhub_token \
  --maven-group se.bjurr.violations \
  --maven-artifact violations-command-line \
  --maven-version 1.24.1 \
  --compile-native true \
  --dry-run true
```
