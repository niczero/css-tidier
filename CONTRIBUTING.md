# Contribution Guide

This page describes how to contribute changes to CSS Beautify.

Please do not create a pull request without reading this guide first.  Failure
to do so may result in the pull request being rejected.

## Coding Policies

Make sure that your code passes [JSLint](http://jslint.com) checks.

Make sure your patch does not break existing tests (open
<code>test/index.html</code> in a web browser).  Wherever applicable, also
supply tests that go from 'fail' to 'pass' as a result of your patch.

## Pull Request

For the actual contribution, please use [Github pull
request](http://help.github.com/pull-requests/) workflow.

Please do not create a pull request for multiple unrelated commits.  It is
strongly recommended to create a topic branch and make the commits as atomic as
possible for the merge.  This makes it easy to review all the changes.
