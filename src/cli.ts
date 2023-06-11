#!/usr/bin/env node

import fetch from 'node-fetch';
import { Command } from 'commander';
import { XMLParser } from 'fast-xml-parser';
import { Context } from './types';
import Handlebars from 'handlebars';
import path from 'path';
import { exec } from 'child_process';
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
  .option('--maven-version <version>', 'Maven Package Version');

program.parse(process.argv);

const options = program.opts();
console.log(
  `Params: ${JSON.stringify({ ...options, dockerPassword: '***' }, null, 4)}`
);

const mavenGroupSlashes = options.mavenGroup.replaceAll('.', '/');

const pomUrl = `https://repo1.maven.org/maven2/${mavenGroupSlashes}/${options.mavenArtifact}/${options.mavenVersion}/${options.mavenArtifact}-${options.mavenVersion}.pom`;
console.log(`Getting ${pomUrl}`);
fetch(pomUrl).then((response: any) => {
  response.text().then((pomXmlString: string) => {
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
      fs.writeFileSync(`${targetFolder}/${templateFile}`, result);
    };

    render('build-docker.sh', context, `${workFolder}`);
    render('builddir/bin', context, `${workFolder}`);
    render('builddir/Dockerfile', context, `${workFolder}`);

    const command = exec(
      `sh build-docker.sh ${options.mavenVersion}`,
      { cwd: workFolder },
      (error, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        if (error) {
          console.error(`${error.message}`);
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
      }
    );
  });
});
