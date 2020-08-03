// const xml = require("xml");
const fs = require("fs");
const { writeString, htmlEscape, unifiedDiff } = require("./utils.js");

let junitXml;

function printSuites(suite) {
  const testCount = suite.tests.length;
  let failures = 0;
  let skips = 0;
  let duration = 0;
  let errors = 0;
  suite.tests.forEach(test => {
    duration += test.duration;
    if (test.fail === true) failures += 1;
    if (test.skipped === true) skips += 1;
    errors = Object.keys(test.err).length;
  });

  writeString("<testsuite", junitXml);
  writeString(` name="${htmlEscape(suite.title)}"`, junitXml);
  writeString(` tests="${testCount}"`, junitXml);
  writeString(` failures="${failures}"`, junitXml);
  writeString(` errors="${errors}"`, junitXml);
  writeString(` skipped="${skips}"`, junitXml);
  writeString(` timestamp=""`, junitXml);
  writeString(` time="${duration / 1000}"`, junitXml);
  writeString(">\n", junitXml);
  if (suite.suites) {
    suite.suites.forEach(subSuite => {
      printSuites(subSuite);
    });
  }
  suite.tests.forEach(test => {
    writeString("<testcase", junitXml);
    writeString(` classname="${htmlEscape(suite.title)}"`, junitXml);
    writeString(` name="${htmlEscape(test.title)}"`, junitXml);
    writeString(` time="${test.duration / 1000}">\n`, junitXml);
    if (test.state === "failed") {
      writeString('<failure message="', junitXml);
      if (test.err.message) writeString(htmlEscape(test.err.message), junitXml);
      writeString('">\n', junitXml);
      writeString(htmlEscape(unifiedDiff(test.err)), junitXml);
      writeString("\n</failure>\n", junitXml);
    } else if (test.state === undefined) {
      writeString("<skipped/>\n", junitXml);
    }
    writeString("</testcase>\n", junitXml);
  });
  writeString("</testsuite>\n", junitXml);
}

/**
 * [exports description]
 * @method exports
 * @param  {[type]} jsonPath [path to json file]
 * @return {[type]} junitPath [path to junit file]
 */
module.exports = {
  convertJson(jsonPath, junitPath) {
    const jsonRaw = fs.readFileSync(jsonPath, "utf8");
    junitXml = fs.openSync(junitPath, "w");

    if (jsonRaw && jsonRaw.toString().trim() !== "") {
      const jsonData = JSON.parse(jsonRaw);

      // Formatting start time to javascript date then extracting milliseconds
      // for later timestamp incrementation
      const dateFormatted = new Date(jsonData.stats.start);
      const dateMilliseconds = dateFormatted.getTime();
      const dateTimestamp = new Date(dateMilliseconds);
      writeString(`<testsuites">\n`, junitXml);

      jsonData.results.forEach(file => {
        printSuites(file);
      });

      writeString("</testsuites>\n", junitXml);

      if (junitXml) fs.closeSync(junitXml);
    } else {
      console.log("Unable to parse json file.");
      process.exit(1);
    }
  }
};
