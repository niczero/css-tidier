/*
 Copyright (C) 2011--3 Sencha Inc.
 Copyright (C) 2017 Nic Sandfield

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/

/*jslint continue: true, indent: 2 */
/*global exports:true, module:true, window:true */

(function () {

  'use strict';

  function css-tidier(style, opt) {

    let options, index = 0, length = style.length, blocks, formatted = '', ch,
        ch2, str, state, State, depth, quote, comment, trimRight;

    options = arguments.length > 1 ? opt : {};
    if (typeof options.autosemicolon === 'undefined') {
      options.autosemicolon = false;
    }
    if (typeof options.braceonnextline === 'undefined') {
      options.braceonnextline = false;
    }
    if (typeof options.indent === 'undefined') {
      options.indent = '  ';
    }
    if (typeof options.separateselectors === 'undefined') {
      options.separateselectors = false;
    }

    function isWhitespace(c) {
      return (/\s/.test(c));
    }

    function isQuote(c) {
      return (c === '\'') || (c === '"');
    }

// TODO: handle Unicode characters
    function isName(c) {
      return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
          || (ch >= '0' && ch <= '9') || '-_*.:#[]'.indexOf(c) >= 0;
    }

    function appendIndent() {
      for (let i = depth; i > 0; i -= 1) {
        formatted += options.indent;
      }
    }

    function openBlock() {
      formatted = trimRight(formatted);
      if (options.braceonnextline) {
        formatted += '\n';
        appendIndent();
        formatted += '{';
      }
      else {
        formatted += ' {';
      }

      if (ch2 !== '\n') {
        formatted += '\n';
      }
      depth += 1;
    }

    function closeBlock() {
      depth -= 1;
      formatted = trimRight(formatted);

      if (formatted.length > 0 && options.autosemicolon) {
        let last = formatted.charAt(formatted.length - 1);
        if (last !== ';' && last !== '{') {
          formatted += ';';
        }
      }

      formatted += '\n';
      appendIndent();
      formatted += '}';
      blocks.push(formatted);
      formatted = '';
    }

    if (String.prototype.trimRight) {
      trimRight = function (s) {
        return s.trimRight();
      };
    }
    else {
      // old Internet Explorer
      trimRight = function (s) {
        return s.replace(/\s+$/, '');
      };
    }

    State = {
      Start: 0,
      AtRule: 1,
      Block: 2,
      Selector: 3,
      Ruleset: 4,
      Property: 5,
      Separator: 6,
      Expression: 7,
      URL: 8
    };

    depth = 0;
    state = State.Start;
    comment = false;
    blocks = [];

    // We want to deal with LF (\n) only
    style = style.replace(/\r\n/g, '\n');

    while (index < length) {
      ch = style.charAt(index);
      ch2 = style.charAt(index + 1);
      index += 1;

      // Inside a string literal?
      if (isQuote(quote)) {
        formatted += ch;
        if (ch === quote) {
          quote = null;
        }
        else if (ch === '\\' && ch2 === quote) {
          // Don't treat escaped character as the closing quote
          formatted += ch2;
          index += 1;
        }
      }

      // Inside a comment?
      else if (comment) {
        formatted += ch;
        if (ch === '*' && ch2 === '/') {
          formatted += ch2;
          comment = false;
          index += 1;
        }
      }

      // Starting a string literal?
      else if (isQuote(ch)) {
        formatted += ch;
        quote = ch;
      }

      // Starting a comment?
      else if (ch === '/' && ch2 === '*') {
        formatted += ch;
        formatted += ch2;
        comment = true;
        index += 1;
      }

      else if (state === State.Start) {

        if (blocks.length === 0 && isWhitespace(ch) && formatted.length === 0) {
          // ignore
        }

        // Copy white spaces and control characters
        else if (ch <= ' ' || ch.charCodeAt(0) >= 128) {
          formatted += ch;
          state = State.Start;
        }

        // Selector or at-rule
        else if (isName(ch) || (ch === '@')) {

          // Clear trailing whitespaces and linefeeds.
          str = trimRight(formatted);

          if (str.length === 0) {
            // If we have empty string after removing all the trailing spaces,
            // that means we are right after a block.
            // Ensure a blank line as the separator.
            if (blocks.length > 0) {
              formatted = '\n\n';
            }
          }
          else {
            // After finishing a ruleset or directive statement, there should be
            // one blank line.
            if (str.charAt(str.length - 1) === '}' ||
                str.charAt(str.length - 1) === ';') {

              formatted = str + '\n\n';
            }
            else {
              // After block comment, keep all the linefeeds but start from the
              // first column (remove whitespaces prefix).
              while (true) {
                ch2 = formatted.charAt(formatted.length - 1);
                if (ch2 !== ' ' && ch2.charCodeAt(0) !== 9) {
                  break;
                }
                formatted = formatted.substr(0, formatted.length - 1);
              }
            }
          }
          formatted += ch;
          state = (ch === '@') ? State.AtRule : State.Selector;
        }
      }

      else if (state === State.AtRule) {

        // ';' terminates a statement.
        if (ch === ';') {
          formatted += ch;
          state = State.Start;
        }

        // '{' starts a block
        else if (ch === '{') {
          str = trimRight(formatted);
          openBlock();
          state = (str === '@font-face') ? State.Ruleset : State.Block;
        }

        else {
          formatted += ch;
        }
      }

      else if (state === State.Block) {

        // Selector
        if (isName(ch)) {

          // Clear trailing whitespaces and linefeeds.
          str = trimRight(formatted);

          if (str.length === 0) {
            // If we have empty string after removing all the trailing spaces,
            // that means we are right after a block.
            // Ensure a blank line as the separator.
            if (blocks.length > 0) {
              formatted = '\n\n';
            }
          }
          else {
            // Insert blank line if necessary.
            if (str.charAt(str.length - 1) === '}') {
              formatted = str + '\n\n';
            }
            else {
              // After block comment, keep all the linefeeds but start from the
              // first column (remove whitespaces prefix).
              while (true) {
                ch2 = formatted.charAt(formatted.length - 1);
                if (ch2 !== ' ' && ch2.charCodeAt(0) !== 9) {
                  break;
                }
                formatted = formatted.substr(0, formatted.length - 1);
              }
            }
          }

          appendIndent();
          formatted += ch;
          state = State.Selector;
        }

        // '}' resets the state.
        else if (ch === '}') {
          closeBlock();
          state = State.Start;
        }

        else {
          formatted += ch;
        }
      }

      else if (state === State.Selector) {

        // '{' starts the ruleset.
        if (ch === '{') {
          openBlock();
          state = State.Ruleset;
        }

        // '}' resets the state.
        else if (ch === '}') {
          closeBlock();
          state = State.Start;
        }

        // Ignore unexpected whitespace
        else if (isWhitespace(ch)) {
          // ignore first
          if (isWhitespace(ch2)) {
            index += 1;  // ignore second
          }
        }

        // Optionally put selectors on separate lines
        else if (ch === ',' && options.separateselectors == true) {
          formatted += ',\n';
          if (isWhitespace(ch2)) {
            index += 1;
          }
        }

        else {
          formatted += ch;
          if (isWhitespace(ch2)) {
            formatted += ' ';
            index += 1;
          }
        }
      }

      else if (state === State.Ruleset) {

        // '}' finishes the ruleset.
        if (ch === '}') {
          closeBlock();
          state = depth > 0 ? State.Block : State.Start;
        }

        // Make sure there is no blank line or trailing spaces inbetween
        else if (ch === '\n') {
          formatted = trimRight(formatted);
          formatted += '\n';
        }

        // property name
        else if (!isWhitespace(ch)) {
          formatted = trimRight(formatted);
          formatted += '\n';
          appendIndent();
          formatted += ch;
          state = State.Property;
        }

        else {
          formatted += ch;
        }
      }

      else if (state === State.Property) {

        // ':' concludes the property.
        if (ch === ':') {
          formatted = trimRight(formatted);
          formatted += ': ';
          state = State.Expression;
          if (isWhitespace(ch2)) {
            state = State.Separator;
          }
        }

        // '}' finishes the ruleset.
        else if (ch === '}') {
          closeBlock();
          state = depth > 0 ? State.Block : State.Start;
        }

        else {
          formatted += ch;
        }
      }

      else if (state === State.Separator) {

        // Non-whitespace starts the expression.
        if (!isWhitespace(ch)) {
          formatted += ch;
          state = State.Expression;
        }

        // Anticipate string literal.
        else if (isQuote(ch2)) {
          state = State.Expression;
        }
      }

      else if (state === State.Expression) {

        // '}' finishes the ruleset.
        if (ch === '}') {
          closeBlock();
          state = depth > 0 ? State.Block : State.Start;
        }

        // ';' completes the declaration.
        else if (ch === ';') {
          formatted = trimRight(formatted);
          formatted += ';\n';
          state = State.Ruleset;
        }

        else {
          formatted += ch;

          if (ch === '('
              && formatted.charAt(formatted.length - 2) === 'l'
              && formatted.charAt(formatted.length - 3) === 'r'
              && formatted.charAt(formatted.length - 4) === 'u') {

            // URL starts with '(' and closes with ')'.
            state = State.URL;
          }
        }
      }

      else if (state === State.URL) {

        if (ch === ')' && formatted.charAt(formatted.length - 1 !== '\\')) {

          // ')' finishes the URL (only if it is not escaped).
          state = State.Expression;
        }
        formatted += ch;
      }

      else {
        // The default action is to copy the character (to prevent
        // infinite loop).
        formatted += ch;
      }
    }

    formatted = blocks.join('') + trimRight(formatted);

    return formatted;
  }

  if (typeof exports !== 'undefined' && typeof process !== 'undefined') {
    // Node.js module.
    module.exports = exports = css-tidier;
  }
  else if (typeof window === 'object') {
    // Browser loading.
    window.css-tidier = css-tidier;
  }

}());
