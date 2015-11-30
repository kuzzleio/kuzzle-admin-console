
angular.module("schemaForm").run(["$templateCache", '$http', function($templateCache, $http) {
  $templateCache.put('javascripts/storage/customFormDecorators/fieldset/fieldset.tpl.html',"<fieldset ng-disabled=\"form.readonly\" class=\"schema-form-fieldset {{form.htmlClass}}\"><legend ng-class=\"{\'sr-only\': !showTitle() }\">tutu</legend><div class=\"help-block\" ng-show=\"form.description\" ng-bind-html=\"form.description\"></div></fieldset>");
}]);

angular.module('schemaForm').config(['schemaFormDecoratorsProvider', 'sfBuilderProvider', 'sfPathProvider',
  function(decoratorsProvider, sfBuilderProvider, sfPathProvider) {
    var base = 'decorators/bootstrap/';

    var simpleTransclusion  = sfBuilderProvider.builders.simpleTransclusion;
    var ngModelOptions      = sfBuilderProvider.builders.ngModelOptions;
    var ngModel             = sfBuilderProvider.builders.ngModel;
    var sfField             = sfBuilderProvider.builders.sfField;
    var condition           = sfBuilderProvider.builders.condition;
    var array               = sfBuilderProvider.builders.array;

    // Tabs is so bootstrap specific that it stays here.
    var tabs = function(args) {
      if (args.form.tabs && args.form.tabs.length > 0) {
        var tabContent = args.fieldFrag.querySelector('.tab-content');

        args.form.tabs.forEach(function(tab, index) {
          var div = document.createElement('div');
          div.className = 'tab-pane';
          div.setAttribute('ng-disabled', 'form.readonly');
          div.setAttribute('ng-show', 'selected.tab === ' + index);
          div.setAttribute('ng-class', '{active: selected.tab === ' + index + '}');

          var childFrag = args.build(tab.items, args.path + '.tabs[' + index + '].items', args.state);
          div.appendChild(childFrag);
          tabContent.appendChild(div);
        });
      }
    };

    var defaults = [sfField, ngModel, ngModelOptions, condition];
    decoratorsProvider.defineDecorator('fieldsetDecorator', {
      fieldset: {template: 'javascripts/storage/customFormDecorators/fieldset/fieldset.tpl.html', builder: [sfField, simpleTransclusion, condition]},
      'default': {template: 'decorators/bootstrap/default.html', builder: defaults}
    }, []);

  }]);