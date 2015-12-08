angular.module('kuzzle.filter', [])

  .service('filter', [function () {
    return {
      getFiltersFromUrl: function (params, comparators) {
        if (params.basicFilter) {
          var filters = [];
          try {
            filters = JSON.parse(decodeURIComponent(params.basicFilter));
          } catch (e) {
            throw e;
            return false;
          }

          filters = filters.map(function (group) {
            group.and = group.and.map(function (term) {
              if (term.equal.value) {
                term.equal = comparators[0];
              }
              else {
                term.equal = comparators[1];
              }

              return term;
            });

            return group;
          });

          return {
            basicFilter: filters
          };
        }
        else if (params.advancedFilter) {
          return {
            advancedFilter: params.advancedFilter
          };
        }
        else {
          return {};
        }
      },
      formatAdvancedFilter: function (advancedFilter) {
        if (advancedFilter === '') {
          return {};
        }

        try {
          var advancedFilter = JSON.parse(advancedFilter);

          if (advancedFilter.filter) {
            return advancedFilter.filter;
          }
          else {
            return advancedFilter.query;
          }
        }
        catch (e) {
          return {}
        }
      },
      formatBasicFilter: function (basicFilter) {
        var
          or = [],
          and = [],
          formattedTerm = {},
          length = basicFilter.length,
          error = false;

        basicFilter.forEach(function (group) {
          and = [];
          group.and.forEach(function (term) {
            term.error = false;

            // If one of both input (field or value) is not specified, it's an error
            if ((!term.field && term.value) || (term.field && !term.value)) {
              if (length > 1) {
                term.error = true;
                error = true;
              }
              return false;
            }

            if (!term.field && !term.value) {
              return false;
            }

            if (term.equal.value) {
              formattedTerm = {term: {}};
              formattedTerm.term[term.field] = term.value;
              and.push(formattedTerm);
            }
            else {
              formattedTerm = {not: {term: {}}};
              formattedTerm.not.term[term.field] = term.value;
              and.push(formattedTerm);
            }
          });

          or.push({and: and});
        });

        if (error) {
          return false;
        }

        if (or.length === 0) {
          return {};
        }

        if (or.length === 1 && or[0].and.length === 0) {
          return {};
        }

        return {or: or};
      }
    };
  }]);
