<template>
  <div class="NoSearchResult flex flex-col items-center gap-3 py-8 text-center">
    <i class="fa fa-5x fa-search text-muted-foreground" aria-hidden="true" />
    <h3 class="max-w-xl font-bold text-muted-foreground">
      There is no result matching your query. Please try with another filter.
    </h3>
    <p class="text-sm text-muted-foreground">
      <em>
        Learn more about filtering syntax on
        <a
          class="underline"
          href="https://docs.kuzzle.io/core/2/guides/cookbooks/elasticsearch/basic-queries/"
          target="_blank"
          rel="noopener"
          >Kuzzle Elasticsearch Cookbook</a
        >
      </em>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/*
 * L'état « aucun résultat » des trois listes de Security.
 *
 * Ce n'est pas une primitive : c'est la composition que Roles, Profiles et
 * Users partageaient déjà, au mot près, en trois copies. Les trois divergeaient
 * pourtant sur un point — Profiles pointait vers
 * `docs.kuzzle.io/guide/1/elasticsearch/`, la documentation de Kuzzle 1, quand
 * les deux autres pointaient vers le *cookbook* de la v2. C'est exactement ce
 * qu'une copie finit par faire, et la raison de n'en garder qu'une.
 *
 * À ne pas confondre avec l'état « rien à afficher » (`emptySet`), qui est
 * propre à chaque écran parce qu'il invite à créer un rôle, un profil ou un
 * utilisateur.
 */
export default defineComponent({
  name: 'NoSearchResult',
});
</script>
