angular.module('kuzzle.filters')

  .service('filters', [function () {
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
          bool = {should: []},
          must = [],
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
      }
    };
  }]);
