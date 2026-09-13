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
Usage:  runnable-jar-to-docker [options]

Options:
  --docker-username <username>       Docker username
  --docker-password <password>       Docker password
  --docker-registry-path <path>      The registry to use for tagging/pushing your docker image
  --docker-image-name <name>         The name of the docker image, with handlebar-supported syntax (default: "{{ cliname }}")
  --maven-group <group>              Maven Group
  --maven-artifact <artifact>        Maven Artifact / CLI Name
  --maven-version <version>          Maven Package Version
  --compile-native                   Given if the JAR should be compiled with GraalVM to native binary (default: false)
  --dry-run                          Given if nothing should be done, just printed (default: false)
  --architecture <architectures...>  Choose what architecture(s) to build for
  --repository-url <url>             The URL that the library exists at (default: "https://repo1.maven.org/maven2")
  --no-update-readme                 Whether or not to attempt to update the DockerHub readme
  -h, --help                         display help for command
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
  --maven-version 3.0.0 \
  --compile-native \
  --dry-run
```

```bash
docker run \
 --mount src="$(pwd)",target=/home/violations-command-line,type=bind \
 tomasbjerre/violations-command-line:3.0.0 \
 -v "FINDBUGS" src/test/resources/findbugs/ ".*main\.xml$" "Spotbugs"
```

Another example:

```bash
npm run build \
 && node ./lib/cli.js \
  --docker-username tomasbjerre \
  --docker-password $dockerhub_token \
  --maven-group se.bjurr.gitchangelog \
  --maven-artifact git-changelog-command-line \
  --maven-version 2.2.1 \
  --dry-run
```

```bash
docker run \
 --mount src="$(pwd)",target=/home/git-changelog-command-line,type=bind \
 tomasbjerre/git-changelog-command-line:2.2.1 \
 -std
```

Or open a shell:

```bash
docker run --rm -it --entrypoint sh tomasbjerre/git-changelog-command-line:2.2.1
```
