angular.module('kuzzle.filters')

  .service('filters', [function () {
    var realTimeDslFormat = function (basicFilter) {
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
    };

    var storageDslFormat = function (basicFilter) {
      var
        bool = {should: []},
        should = [],
        formattedMatch = {},
        length = basicFilter.length,
        error = false;

      basicFilter.forEach(function (group) {
        should = {bool: {must: []}};
        group.and.forEach(function (match) {
          match.error = false;

          // If one of both input (field or value) is not specified, it's an error
          if ((!match.field && match.value) || (match.field && !match.value)) {
            if (length > 1) {
              match.error = true;
              error = true;
            }
            return false;
          }

          if (!match.field && !match.value) {
            return false;
          }

          if (match.equal.value) {
            formattedMatch = {match: {}};
            formattedMatch.match[match.field] = match.value;
            should.bool.must.push(formattedMatch);
          }
          else {
            formattedMatch = {not: {match: {}}};
            formattedMatch.not.match[match.field] = match.value;
            should.bool.must.push(formattedMatch);
          }
        });

        bool.should.push(should);
      });

      if (error) {
        return false;
      }

      if (should.length === 0) {
        return {};
      }

      if (should.length === 1 && should[0].must.length === 0) {
        return {};
      }

      return {query: {bool: bool}};
    };

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
            group.and = group.and.map(function (match) {
              if (match.equal.value) {
                match.equal = comparators[0];
              }
              else {
                match.equal = comparators[1];
              }

              return match;
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
          return JSON.parse(advancedFilter);
        }
        catch (e) {
          return {}
        }
      },
      formatBasicFilter: function (basicFilter, isRealtime) {

        if (isRealtime) {
          return realTimeDslFormat(basicFilter);
        }

        return storageDslFormat(basicFilter);
      }
    };
  }]);
