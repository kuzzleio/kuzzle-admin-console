<template>
  <plugin-page></plugin-page>
</template>

<script>
export default {
  components: {
    PluginPage: function (resolve) {
      // require(['../../node_modules/kuzzle-bo-plugin-' + this.$route.params.pluginName + '/components/Index'], resolve)
      require(['../../plugins/kuzzle-bo-plugin-' + this.$route.params.pluginName + '/components/Index'], resolve)
    }
  }
}
</script>
