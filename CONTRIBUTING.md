## Coding rules

###vuex
- Only use the vuex's actions/store/getters if your data have to be shared between components
- Vuex's actions must be prefixed with a verb (doThing ...)
- getters must be named after the data they get

###vue
- event: To be defined

### tests

#### How to test ready in a component
```
document.body.insertAdjacentHTML('afterbegin', '<app></app>')
let vm = new Vue({
    template: '<div><my-component v-ref:component"></my-component></div>',
    components: {
      MyComponent
    }
}).$mount('app')
```
The `ready` is triggerd with `mount('app')`. You can also trigger event destroy with `vm.$refs.component.$destroy`.

#### How to test with $router in ready
```
document.body.insertAdjacentHTML('afterbegin', '<app></app>')
let vm = new Vue({
    template: '<div><my-component v-ref:component"></my-component></div>',
    components: {
      MyComponent
    }
})
vm.$router = {go: sandbox.stub(), _children: {push: sandbox.stub()}}
vm.$mount('app')
```
