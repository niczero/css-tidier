# CSS Tidier

CSS Tidier is a JavaScript implementation of reindenter and reformatter for
[CSS](http://www.w3.org/Style/CSS/) stylesheets.

Given the following style:

```css
menu{color:red} navigation{background-color:#333}
```

CSS Tidier will produce:

```css
menu {
    color: red
}

navigation {
    background-color: #333
}
```

Try it online at [github css-tidier](https://niczero.github.io/css-tidier).  For
the command-line use, install Node.js
[css-tidier](https://npmjs.org/package/css-tidier) package.

For more examples, see also its [test
suite](http://niczero.github.io/css-tidier/test).

## Using css-tidier() function

Since CSS Tidier is written in pure JavaScript, it can run anywhere that
JavaScript can run.

The API is very simple:

```javascript
var result = css-tidier(style, options);
```

**options** is an optional object to adjust the formatting.  Known options so
far are:

  *  <code>autosemicolon</code> always inserts a semicolon after the last
     ruleset (default is 'false')
  *  <code>braceonnextline</code> defines the placement of open curly brace.
  *  <code>indent</code> is a string used for the indentation of the declaration
     (default is 2 spaces)

Example call:

```javascript
var tidied = css-tidier('menu{opacity:.7}', {
    indent: '  ',
    openbrace: 'separate-line',
    autosemicolon: true
});
```

## Command line use

```
npm install -g css-tidier
css-tidier style.css # tidied CSS is output to console
css-tidier style.css >style.tidied.css # write to file
curl http://example.com/style.css | css-tidier # tidy from stdin
```

## Contributing

Contributions are welcome.  Please read the [Contribution
Guide](https://github.com/niczero/css-tidier/blob/master/CONTRIBUTING.md)
for more info.

## License

Copyright (C) 2011--3 Sencha Inc.
Copyright (C) 2017 Nic Sandfield

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
