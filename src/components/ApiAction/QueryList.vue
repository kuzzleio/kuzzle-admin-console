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
            :data-cy="`api-actions-delete-query-${query.name}`"
            size="icon"
            variant="ghost"
            @click="queryToDelete = query"
          >
            <i class="fas fa-trash" aria-hidden="true" />
          </Button>
        </li>
      </ul>
    </CardContent>

    <!--
      La confirmation passait par `$bvModal.msgBoxConfirm`, parti avec
      bootstrap-vue : le bouton levait une erreur et ne supprimait rien (G-109).
    -->
    <Dialog :open="queryToDelete !== null" @update:open="onDeleteDialogOpen">
      <DialogContent data-cy="api-actions-delete-modal">
        <DialogHeader>
          <DialogTitle>
            Api Action <span class="code">{{ queryToDelete?.name }}</span> deletion
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>Please confirm the deletion of the API Action.</DialogDescription>
        <DialogFooter>
          <Button variant="outline" @click="queryToDelete = null"> Cancel </Button>
          <Button
            data-cy="api-actions-delete-modal-confirm"
            variant="destructive"
            @click="deleteSavedQuery"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
</template>

<script>
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default {
  components: {
    Button,
    Card,
    CardContent,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  },
  props: {
    currentQueryName: {},
    savedQueries: {},
  },
  data() {
    return { queryToDelete: null };
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
    deleteSavedQuery() {
      this.$emit('deleteSavedQuery', this.queryToDelete.idx);
      this.queryToDelete = null;
    },
    onDeleteDialogOpen(open) {
      if (!open) {
        this.queryToDelete = null;
      }
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
.leftNav-container {
  overflow: auto;
  height: 100%;
}
</style>
