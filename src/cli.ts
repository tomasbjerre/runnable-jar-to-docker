#!/usr/bin/env node

import fetch from 'node-fetch';
import { Command } from 'commander';
import { XMLParser } from 'fast-xml-parser';
import { Context } from './types';
import Handlebars from 'handlebars';
import path from 'path';
import { spawn } from 'child_process';
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

const pkgJson = require('../package.json');

const program = new Command()
  .version(pkgJson.version)
  .command(pkgJson.name)
  .option('--docker-username <username>', 'Docker username')
  .option('--docker-password <password>', 'Docker password')
  .option('--maven-group <group>', 'Maven Group')
  .option('--maven-artifact <artifact>', 'Maven Artifact')
  .option('--maven-version <version>', 'Maven Package Version')
  .option(
    '--compile-native',
    'Given if the JAR should be compiled with GraalVM to native binary',
    false
  )
  .option('--dry-run', 'Given if nothing should be done, just printed', false)
  .option(
    '--architecture <architecture>',
    'Choose what architecture(s) to build for',
    (value: string, previous: string) => previous?.concat(`,${value}`) ?? value
  )
  .option(
    '--repository-url <url>',
    'The URL that the library exists at',
    'https://repo1.maven.org/maven2'
  );

program.parse(process.argv);

const options = program.opts();
console.log(
  `Params: ${JSON.stringify({ ...options, dockerPassword: '***' }, null, 4)}`
);

const mavenGroupSlashes = options.mavenGroup.replaceAll('.', '/');

const pomUrl = `${options.repositoryUrl}/${mavenGroupSlashes}/${options.mavenArtifact}/${options.mavenVersion}/${options.mavenArtifact}-${options.mavenVersion}.pom`;
const url = new URL(pomUrl);

console.log(`Getting ${pomUrl}`);
(url.protocol === 'file:' ? fs.promises.readFile(url) : fetch(url)).then(
  (response: any) => {
    const startBuild = (pomXmlString: string) => {
      const parser = new XMLParser();
      let pomXmlObject = parser.parse(pomXmlString);
      const pomDescription = pomXmlObject.project.description;

      const context: Context = {
        cliname: options.mavenArtifact,
        mavenGroupSlashes: mavenGroupSlashes,
        version: options.mavenVersion,
        dockerUser: options.dockerUsername,
        dockerPassword: options.dockerPassword,
        shortDescription: pomDescription,
        compileNative: options.compileNative,
        dryRun: options.dryRun,
        architecture: options.architecture,
        repositoryUrl: options.repositoryUrl,
      };

      const workFolder = os.tmpdir() + '/' + crypto.randomUUID();
      fs.mkdirSync(`${workFolder}`);
      fs.mkdirSync(`${workFolder}/builddir`);
      console.log(`Working in ${workFolder}`);
      console.log(
        `Context: ${JSON.stringify(
          { ...context, dockerPassword: '***' },
          null,
          4
        )}`
      );

      const render = function (
        templateFile: string,
        context: Context,
        targetFolder: string
      ) {
        const source = fs.readFileSync(
          path.resolve(__dirname, '..', 'docker', `${templateFile}.hbs`)
        );

        const template = Handlebars.compile(`${source}`);
        const result = template(context);
        const file = `${targetFolder}/${templateFile}`;
        if (context) {
          console.log(file + '\n' + result + '\n');
        }
        fs.writeFileSync(file, result);
      };

      render('build-docker.sh', context, `${workFolder}`);
      render('builddir/bin', context, `${workFolder}`);
      render('builddir/Dockerfile', context, `${workFolder}`);

      const fromReadme = path.resolve(process.cwd(), 'README.md');
      if (fs.existsSync(fromReadme)) {
        console.log(`Copying ${fromReadme} to ${workFolder}`);
        fs.copyFileSync(fromReadme, path.resolve(workFolder, 'README.md'));
      } else {
        console.log(`Not copying ${fromReadme} to ${workFolder}`);
      }

      const spawnedBuildDocker = spawn(
        'sh',
        ['build-docker.sh', options.mavenVersion],
        { cwd: workFolder }
      );
      spawnedBuildDocker.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
      });
      spawnedBuildDocker.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
      });
      spawnedBuildDocker.on('exit', function (code) {
        console.log('child process exited with code ' + code);
      });
    };

    return url.protocol === 'file:'
      ? startBuild(Buffer.from(response).toString())
      : response.text().then(startBuild);
  }
);
