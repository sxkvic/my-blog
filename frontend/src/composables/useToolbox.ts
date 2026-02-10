import { ref } from 'vue';
import type { ToolLinkItem } from '../data/tools';
import { seedToolLinks } from '../data/tools';
import {
  createToolLink as createToolLinkApi,
  deleteToolLink as deleteToolLinkApi,
  listToolLinks as listToolLinksApi,
  updateToolLink as updateToolLinkApi,
  type ToolDraft,
} from '../services/toolboxGateway';

const links = ref<ToolLinkItem[]>([]);
const initialized = ref(false);
const apiAvailable = ref(true);
const lastError = ref('');

async function loadToolLinks(force = false) {
  if (initialized.value && !force) {
    return;
  }

  try {
    links.value = await listToolLinksApi();
    apiAvailable.value = true;
    lastError.value = '';
  } catch {
    apiAvailable.value = false;
    lastError.value = 'tools_api_unavailable';
    links.value = [...seedToolLinks];
  }

  initialized.value = true;
}

async function addToolLink(payload: ToolDraft) {
  if (!apiAvailable.value) {
    throw new Error('tools_api_unavailable');
  }
  const created = await createToolLinkApi(payload);
  links.value = [created, ...links.value.filter((item) => item.id !== created.id)];
  return created;
}

async function editToolLink(id: string, payload: Partial<ToolLinkItem>) {
  if (!apiAvailable.value) {
    throw new Error('tools_api_unavailable');
  }
  const updated = await updateToolLinkApi(id, payload);
  links.value = links.value.map((item) => (item.id === id ? updated : item));
  return updated;
}

async function removeToolLink(id: string) {
  if (!apiAvailable.value) {
    throw new Error('tools_api_unavailable');
  }
  await deleteToolLinkApi(id);
  links.value = links.value.filter((item) => item.id !== id);
}

export function useToolbox() {
  return {
    links,
    loadToolLinks,
    addToolLink,
    editToolLink,
    removeToolLink,
    apiAvailable,
    lastError,
  };
}
