Angular Bootstrap Decorator
==========================

For https://github.com/Textalk/angular-schema-form

This is the new Bootstrap Decorator! That means a Bootstrap 3 frontend for the Angular Schema Form
project. The former Bootstrap decorator used to be included in the main repo, but has now moved
here.

The big difference is that it now uses the new builder in, for more info on the builder see
[our blog](https://medium.com/@SchemaFormIO/the-new-builder-pt-1-61fadde3c678).

The biggest change for users is that the form no longer contains any `<bootstrap-decorator>` tags
since they are no longer needed.

Install
-------
```sh
bower install angular-schema-form-bootstrap
```
or

```sh
npm install angular-schema-form-bootstrap
```

And then include `bootstrap-decorator.min.js`. Note that angular-schema-form >= 0.8.7 is needed.


Future
------
Using the new builder opens up for a lot of optimization. Primarily we can get rid of a lot of small
watches by using build helpers. For instance, slapping on a `sf-changed` directive *only* if the
form definition has an `onChange` option.
