<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent data-cy="EnvironmentImport" labelled-by="env-import-title">
      <DialogHeader>
        <DialogTitle id="env-import-title">Import Connection</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-1.5">
        <Label for="env-import-file">Upload a file</Label>
        <input
          id="env-import-file"
          ref="file-input"
          accept=".json"
          class="block w-full cursor-pointer rounded-md border border-input bg-background p-2 font-sans text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          data-cy="EnvironmentImport-fileInput"
          type="file"
          @change="onFileChange"
        />
        <DialogDescription> You can drag and drop your file in this input field </DialogDescription>
      </div>

      <Alert
        v-if="file !== null && errors.length === 0 && !loading"
        data-cy="EnvironmentImport-ok"
        variant="success"
      >
        ✅ Uploaded file is valid. Found {{ envNames.length }} connections.
      </Alert>

      <Alert
        v-for="(err, k) in errors"
        :key="k"
        data-cy="EnvironmentImport-err"
        variant="destructive"
      >
        {{ err }}
      </Alert>

      <DialogFooter>
        <Button variant="outline" @click="close"> Cancel </Button>
        <Button
          data-cy="EnvironmentImport-submitBtn"
          :disabled="envNames.length === 0"
          @click="importEnv"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useKuzzleStore } from '@/stores';
import type { Environment } from '@/stores/types/kuzzle';

export default defineComponent({
  name: 'ModalImport',
  components: {
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Label,
  },
  props: {
    open: {
      default: false,
      type: Boolean,
    },
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
    };
  },
  data(): {
    env: Record<string, Environment>;
    errors: string[];
    file: File | null;
    loading: boolean;
  } {
    // Le contenu du fichier importé n'est pas validé — il ne l'était pas
    // davantage avec `b-form-file`. Le typer en `Environment` dit ce qu'on en
    // attend, pas ce qu'on a vérifié. À reprendre le jour où l'import sera
    // validé pour de bon.
    return {
      env: {},
      errors: [],
      file: null,
      loading: false,
    };
  },
  computed: {
    envNames() {
      return Object.keys(this.env);
    },
  },
  watch: {
    file: {
      handler() {
        this.$log.debug('File has changed');
        this.upload();
      },
    },
    // Remplace les trois écouteurs `@cancel` / `@close` / `@hide` de `b-modal`.
    open(open) {
      if (!open) {
        this.reset();
      }
    },
  },
  methods: {
    close() {
      this.$emit('update:open', false);
    },
    // `b-form-file` exposait `reset()`. Sur un `<input type="file">` natif, la
    // seule façon de vider la sélection est de remettre `value` à vide.
    clearFiles() {
      const input = this.$refs['file-input'] as HTMLInputElement | undefined;
      if (input) {
        input.value = '';
      }
      this.file = null;
    },
    onFileChange(event: Event) {
      const input = event.target as HTMLInputElement;
      this.file = input.files && input.files.length > 0 ? input.files[0] : null;
    },
    reset() {
      this.clearFiles();
      this.errors = [];
      this.env = {};
      this.loading = false;
    },
    async importEnv() {
      let mustSwitch = false;
      if (Object.keys(this.kuzzleStore.environments).length === 0) {
        mustSwitch = true;
      }
      for (const name in this.env) {
        try {
          this.kuzzleStore.createEnvironment({
            id: name,
            environment: this.env[name],
          });
        } catch (e) {
          this.$log.error(e);
          this.errors.push(String(e));
        }
      }
      if (!this.errors.length) {
        this.$log.debug(`Finished import must switch: ${mustSwitch}, env:`);
        this.$log.debug(this.kuzzleStore.environments);
        this.$router.push({ name: 'SelectEnvironment' });
        this.close();
      }
    },
    upload() {
      if (!this.file || this.loading) {
        return;
      }
      this.$log.debug('Uploading!');

      this.errors = [];
      this.env = {};
      this.loading = true;
      const reader = new FileReader();

      if (this.file.type !== 'application/json') {
        this.errors.push(
          `⛔️ Uploaded file type (${this.file.type}) is not supported. Please import .json files only`,
        );
        this.loading = false;
        return;
      }

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          this.env = JSON.parse(String(e.target?.result ?? ''));
        } catch (error) {
          this.$log.error(error);
          this.$log.debug(e.target);
          this.errors.push(String(error));
        }
        this.loading = false;
      };

      reader.readAsText(this.file);
    },
  },
});
</script>
