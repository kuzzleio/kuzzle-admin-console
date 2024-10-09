import { defineStore } from 'pinia';

import type { ToasterState } from './types';

export const useToasterStore = defineStore('toaster', {
  state: (): ToasterState => ({
    toast: {},
  }),
});
