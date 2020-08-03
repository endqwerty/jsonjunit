const diff = require("diff");
const fs = require("fs");
// the following methods were inspired by and/or borrowed from mocha-jenkins-reporter
function writeString(str, junitXml) {
  if (junitXml) {
    const buf = new Buffer(str);
    fs.writeSync(junitXml, buf, 0, buf.length, null);
  }
}

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unifiedDiff(err) {
  function escapeInvisibles(line) {
    return line
      .replace(/\t/g, "<tab>")
      .replace(/\r/g, "<CR>")
      .replace(/\n/g, "<LF>\n");
  }
  function cleanUp(line) {
    if (line.match(/\@\@/)) return null;
    if (line.match(/\\ No newline/)) return null;
    return escapeInvisibles(line);
  }
  function notBlank(line) {
    return line != null;
  }

  let { actual } = err;
  let { expected } = err;

  let lines;
  let msg = "";

  if (err.actual && err.expected) {
    // make sure actual and expected are strings
    if (!(typeof actual === "string" || actual instanceof String)) {
      actual = JSON.stringify(err.actual);
    }

    if (!(typeof expected === "string" || expected instanceof String)) {
      expected = JSON.stringify(err.actual);
    }

    msg = diff.createPatch("string", actual, expected);
    lines = msg.split("\n").splice(4);
    msg += lines
      .map(cleanUp)
      .filter(notBlank)
      .join("\n");
  }

  // TODO: Leverage if needed
  // if (options.junit_report_stack && err.stack) {
  //    if (msg) msg += '\n';
  //    lines = err.stack.split('\n').slice(1);
  //    msg += lines.map(cleanUp).filter(notBlank).join('\n');
  // }

  return msg;
}
module.exports = { writeString, htmlEscape, unifiedDiff };
