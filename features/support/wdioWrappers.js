module.exports = {
  queryMatchesText: function (needle, haystack) {
    if (typeof haystack == 'string') {
      return haystack == needle;
    }
    if (typeof haystack == 'object' && Array.isArray(haystack)) {
      return haystack.indexOf(needle) >= 0;
    }
  }
};
