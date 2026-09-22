<template>
  <Card class="backgroundCard h-full">
    <CardContent class="flex h-full min-h-0 flex-col">
      <div v-if="!paginatedQueries.length" class="flex h-full items-center">
        <Card class="w-full">
          <CardContent>
            <CardTitle>No API actions saved.</CardTitle>
            <p class="mt-2 text-sm text-muted-foreground">
              Your saved API Actions will appear in this list.
            </p>
          </CardContent>
        </Card>
      </div>

      <ul
        v-else
        ref="leftNav-container"
        class="leftNav-container flex list-none flex-col overflow-auto pl-0"
      >
        <li
          v-for="query of paginatedQueries"
          :key="`saved-query-${query.idx}`"
          :ref="`saved-query-${query.idx}`"
          class="flex items-center gap-2 border-b border-border px-3"
          :class="query.idx === currentQueryIndex ? 'bg-muted font-semibold' : ''"
          :data-cy="`api-actions-saved-query-${query.name}`"
        >
          <!--
            `b-list-group-item :active` ne posait qu'une classe : la requête
            ouverte n'était annoncée nulle part. C'est un bouton, et il dit
            laquelle est la courante.
          -->
          <button
            :id="`query-list-${query.idx}`"
            :aria-current="query.idx === currentQueryIndex ? 'true' : undefined"
            class="leftTab flex-1 cursor-pointer appearance-none truncate border-0 bg-transparent py-3 text-left font-sans text-sm text-foreground"
            type="button"
            @click="loadSavedQuery(query.idx)"
          >
            {{ query.name }}
          </button>
          <Button
            :aria-label="`Delete the query ${query.name}`"
            size="icon"
            variant="ghost"
            @click="deleteSavedQuery(query)"
          >
            <i class="fas fa-trash" aria-hidden="true" />
          </Button>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>

<script>
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default {
  components: {
    Button,
    Card,
    CardContent,
    CardTitle,
  },
  props: {
    currentQueryName: {},
    savedQueries: {},
  },
  data() {
    return {};
  },
  computed: {
    currentQueryIndex() {
      return this.savedQueries.findIndex((q) => q.name === this.currentQueryName);
    },
    paginatedQueries() {
      return this.savedQueries.map((q, index) => {
        q.idx = index;
        return q;
      });
    },
  },
  watch: {
    currentQueryIndex: {
      handler(value) {
        const ref = this.$refs[`saved-query-${value}`];
        if (!ref) {
          return;
        }
        const elem = ref[0];
        if (!elem) {
          return;
        }
        this.$refs['leftNav-container'].scrollTo(0, elem.offsetTop - elem.offsetHeight);
      },
    },
  },
  methods: {
    deleteSavedQuery(query) {
      this.$bvModal
        .msgBoxConfirm('Please confirm the deletion of the API Action.', {
          title: `Api Action ${query.name} deletion`,
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
        })
        .then((value) => {
          if (value) {
            this.$emit('deleteSavedQuery', query.idx);
          }
        })
        .catch((err) => {
          this.$log.error(err);
        });
    },
    loadSavedQuery(savedQueryIdx) {
      this.$emit('loadSavedQuery', savedQueryIdx);
    },
  },
};
</script>

<style lang="scss" scoped>
.leftTab {
  white-space: nowrap;
  overflow-y: hidden;
  overflow-x: hidden;
}
.list-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.leftNav-container {
  overflow: auto;
  height: 100%;
}
</style>
