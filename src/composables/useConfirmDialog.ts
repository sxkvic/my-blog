import { reactive } from 'vue';

export type ConfirmTone = 'default' | 'danger';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
}

interface PendingDialog {
  options: ConfirmDialogOptions;
  resolve: (result: boolean) => void;
}

const queue: PendingDialog[] = [];

const state = reactive({
  visible: false,
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  tone: 'default' as ConfirmTone,
});

let current: PendingDialog | null = null;

function showNext() {
  if (state.visible || current || queue.length === 0) {
    return;
  }

  current = queue.shift() || null;
  if (!current) {
    return;
  }

  const { options } = current;
  state.title = options.title;
  state.message = options.message;
  state.confirmText = options.confirmText || '确认';
  state.cancelText = options.cancelText || '取消';
  state.tone = options.tone || 'default';
  state.visible = true;
}

function finish(result: boolean) {
  if (!current) {
    return;
  }

  const active = current;
  current = null;
  state.visible = false;
  active.resolve(result);
  setTimeout(showNext, 0);
}

export function useConfirmDialog() {
  return {
    confirm(options: ConfirmDialogOptions) {
      return new Promise<boolean>((resolve) => {
        queue.push({ options, resolve });
        showNext();
      });
    },
  };
}

export function useConfirmDialogHost() {
  return {
    state,
    accept: () => finish(true),
    cancel: () => finish(false),
  };
}
