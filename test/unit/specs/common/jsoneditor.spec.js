import Vue from 'vue'
import VueRouter from 'vue-router'
import JsonEditor from '../../../../src/components/Common/JsonEditor'

describe('Json editor tests', () => {
  it('should render correct json editor content', () => {
    Vue.use(VueRouter)

    let vm = new Vue({
      template: '<div><json-editor v-ref:jsoneditor id="editor" class="editor col s5" content="mapping" readonly="true"></json-editor></div>',
      components: { JsonEditor },
      replace: false
    }).$mount()

    expect(vm.$refs.jsoneditor.content).to.equals('mapping')
    expect(vm.$refs.jsoneditor.class).to.equals('editor col s5')
  })
})
