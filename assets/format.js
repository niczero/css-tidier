/*global css-tidier:true, document:true, window:true, CodeMirror: true */

let editor, viewer, formatId;

function format() {
  'use strict';
  if (formatId) {
    window.clearTimeout(formatId);
  }
  formatId = window.setTimeout(function () {
    let options = {
      indent: '  '
    };

    if (document.getElementById('tab').checked) {
      options.indent = '\t';
    }
    else if (document.getElementById('twospaces').checked) {
      options.indent = '  ';
    }

    if (document.getElementById('openbrace-separate-line').checked) {
      options.openbrace = 'separate-line';
    }

    if (document.getElementById('autosemicolon').checked) {
      options.autosemicolon = true;
    }

    let raw;
    if (typeof editor === 'undefined') {
      raw = document.getElementById('raw').value;
    }
    else {
      raw = editor.getValue();
    }

    let tidied = css-tidier(raw, options);

    if (typeof viewer === 'undefined') {
      document.getElementById('tidied').value = tidied;
    }
    else {
      viewer.setValue(tidied);
    }

    formatId = undefined;
  }, 42);
}

window.onload = function () {
  'use strict';

  editor = CodeMirror.fromTextArea(document.getElementById("raw"), {
    lineNumbers: true,
    matchBrackets: false,
    lineWrapping: true,
    tabSize: 8,
    onChange: format
  });

  viewer = CodeMirror.fromTextArea(document.getElementById("tidied"), {
    lineNumbers: true,
    matchBrackets: false,
    lineWrapping: true,
    readOnly: true,
    tabSize: 8
  });

  format();
};
