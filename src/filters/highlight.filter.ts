export function highlight(value, filter) {
  if (value && value !== '' && filter) {
    const index = value.toLowerCase().indexOf(filter.toLowerCase());

    if (index >= 0) {
      value =
        value.substring(0, index) +
        '<strong class="highlight">' +
        value.substring(index, index + filter.length) +
        '</strong>' +
        value.substring(index + filter.length);
    }
  }

  return value;
}
