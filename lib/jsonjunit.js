// const xml = require("xml");
const fs = require("fs");
const { writeString, htmlEscape, unifiedDiff } = require("./utils.js");

let junitXml;
/**
 *
 * @param {JSON} suite suite data
 * @param {boolean} parseSkipped parse skipped tests
 */
function printSuites(suite, parseSkipped) {
  const testCount = suite.tests.length;
  let failures = 0;
  let skips = 0;
  let duration = 0;
  let errors = 0;
  suite.tests.forEach(test => {
    duration += test.duration;
    if (test.fail === true) failures += 1;
    if (test.skipped === true) skips += 1;
    if (test.err.message) errors += 1;
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
      printSuites(subSuite, parseSkipped);
    });
  }

  // PRINT TEST RESULTS
  suite.tests.forEach(test => {
    const testIsSkipped = !!(test.skipped === true || test.state === undefined);
    if (!testIsSkipped || (testIsSkipped && parseSkipped === true)) {
      // if test is not skipped or parsing skipped is true then print out test case details
      writeString("<testcase", junitXml);
      writeString(` classname="${htmlEscape(suite.title)}"`, junitXml);
      writeString(` name="${htmlEscape(test.title)}"`, junitXml);
      writeString(` time="${test.duration / 1000}">\n`, junitXml);
      if (test.state === "failed") {
        writeString('<failure message="', junitXml);
        if (test.err.message)
          writeString(htmlEscape(test.err.message), junitXml);
        writeString('">\n', junitXml);
        writeString(htmlEscape(unifiedDiff(test.err)), junitXml);
        writeString("\n</failure>\n", junitXml);
      } else if (testIsSkipped) {
        writeString('<skipped message="skipped test">\n</skipped>\n', junitXml);
      }
      if (test.context !== null) {
        writeString("<system-out>\n", junitXml);
        writeString(htmlEscape(test.context), junitXml);
        writeString("</system-out>\n", junitXml);
      }
      writeString("</testcase>\n", junitXml);
    }
  });
  writeString("</testsuite>\n", junitXml);
}

module.exports = {
  /**
   * runs the converter
   * @method exports
   * @param  {String} jsonPath path to json file
   * @param {String} junitPath path to junit file
   * @param {boolean} skipped whether or not to parse skipped
   */
  convertJson(jsonPath, junitPath, skipped) {
    const jsonRaw = fs.readFileSync(jsonPath, "utf8");
    junitXml = fs.openSync(junitPath, "w");

    if (jsonRaw && jsonRaw.toString().trim() !== "") {
      const jsonData = JSON.parse(jsonRaw);

      // Formatting start time to javascript date then extracting milliseconds
      // for later timestamp incrementation
      writeString(`<testsuites>\n`, junitXml);

      jsonData.results.forEach(file => {
        printSuites(file, skipped);
      });

      writeString("</testsuites>\n", junitXml);

      if (junitXml) fs.closeSync(junitXml);
    } else {
      console.log("Unable to parse json file.");
      process.exit(1);
    }
  }
};
