// const xml = require("xml");
const fs = require("fs");
const { writeString, htmlEscape, unifiedDiff } = require("./utils.js");

let junitXml;

/**
 * [exports description]
 * @method exports
 * @param  {[type]} jsonPath [path to json file]
 * @return {[type]} junitPath [path to junit file]
 */
module.exports = {
  convertJson(jsonPath, junitPath, options = {}) {
    const jsonType = options.jsonType || "mochawesome";

    const jsonRaw = fs.readFileSync(jsonPath, "utf8");
    junitXml = fs.openSync(junitPath, "w");

    if (jsonRaw && jsonRaw.toString().trim() !== "") {
      const jsonData = JSON.parse(jsonRaw);

      if (jsonType === "mochawesome") {
        // Formatting start time to javascript date then extracting milliseconds
        // for later timestamp incrementation
        const dateFormatted = new Date(jsonData.stats.start);
        let dateMilliseconds = dateFormatted.getTime();

        writeString(`<testsuites>\n`, junitXml);

        jsonData.results.forEach(suite => {
          let testCount = 0;
          let failures = 0;
          let skips = 0;
          let duration = 0;

          const { tests } = suite.suites[0];

          tests.forEach(test => {
            testCount = +1;
            duration += test.duration;
            if (test.fail === true) failures += 1;
            if (test.skipped === true) skips += 1;
          });

          // incrementing millisecond timestamp by adding duration of all tests in order
          // to correctly input testsuite 'timestamp' value
          dateMilliseconds += duration;

          const dateTimestamp = new Date(dateMilliseconds);

          writeString("<testsuite", junitXml);
          writeString(` name="${htmlEscape(suite.suites[0].title)}"`, junitXml);
          writeString(` tests="${testCount}"`, junitXml);
          writeString(` failures="${failures}"`, junitXml);
          writeString(` errors="${failures}"`, junitXml);
          writeString(` skipped="${skips}"`, junitXml);
          writeString(` timestamp="${dateTimestamp.toUTCString()}"`, junitXml);
          writeString(` time="${duration / 1000}"`, junitXml);
          writeString(">\n", junitXml);

          tests.forEach(test => {
            writeString("<testcase", junitXml);
            writeString(
              ` classname="${htmlEscape(suite.suites[0].title)}"`,
              junitXml
            );
            writeString(` name="${htmlEscape(test.title)}"`, junitXml);
            writeString(` time="${test.duration / 1000}">\n`, junitXml);
            if (test.state === "failed") {
              writeString('<failure message="', junitXml);
              if (test.err.message)
                writeString(htmlEscape(test.err.message), junitXml);
              writeString('">\n');
              writeString(htmlEscape(unifiedDiff(test.err)), junitXml);
              writeString("\n</failure>\n", junitXml);
            } else if (test.state === undefined) {
              writeString("<skipped/>\n", junitXml);
            }

            writeString("</testcase>\n", junitXml);
          });

          writeString("</testsuite>\n", junitXml);
        });

        writeString("</testsuites>\n", junitXml);
        if (junitXml) fs.closeSync(junitXml);
      }
    } else {
      console.log("Unable to parse json file.");
      process.exit(1);
    }
  }
};
