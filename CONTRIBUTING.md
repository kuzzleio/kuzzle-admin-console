## Coding rules

###vuex
- Only use the vuex's actions/store/getters if your data have to be shared between components
- Vuex's actions must be prefixed with a verb (doThing ...)
- getters must be named after the data they get

###vue
- events: The event name must be prefixed with the component and suffixed with the action with `::` as separator.  
Something like `security-create::create`, `filter-raw::search` or `crudl::refresh-search`.