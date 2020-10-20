#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");
const jsonJunit = require("./lib/jsonjunit");

let fileName;
let jsonFile;
let junitFile;

program
  .version(pkg.version)
  .option("--no-skipped", "don't parse skipped tests")
  .option("-ju, --json <json>", "JSON report target path")
  .option("-jx, --junit <junit>", "JUnitXML report destination path")
  .parse(process.argv);

if (!program.json || !program.junit) {
  console.log("You must specify both JSON and JUNIT path!");
  process.exit(1);
} else {
  // create JUnitXML report dir if it doesn't exist
  if (!fs.existsSync(program.junit)) {
    fs.mkdirSync(program.junit);
  }

  const jsonFiles = fs.readdirSync(program.json);

  // eslint-disable-next-line no-restricted-syntax
  for (const i in jsonFiles) {
    if (jsonFiles[i].indexOf(".json") > -1) {
      jsonFile = path.join(program.json, jsonFiles[i]);
      fileName = jsonFiles[i].slice(0, jsonFiles[i].indexOf(".json"));
      junitFile = path.join(program.junit, `${fileName}.xml`);
      jsonJunit.convertJson(jsonFile, junitFile, program.skipped);
    }
  }
}
