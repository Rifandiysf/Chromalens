import { createRoot, type Root } from 'react-dom/client';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShadowRootUi, type ShadowRootContentScriptUi } from 'wxt/utils/content-script-ui/shadow-root';
import { getErrorMessage } from '@/shared/errors';
import { onMessage, sendMessage } from '@/shared/messages';
import { OVERLAY_HOST_TAG_NAME } from './constants';
import { InspectorApp } from './InspectorApp';

export class InspectorController {
  private readonly context: ContentScriptContext;
  private readonly overlayStyles: string;
  private overlayUi: ShadowRootContentScriptUi<Root> | null = null;

  constructor(context: ContentScriptContext, overlayStyles: string) {
    this.context = context;
    this.overlayStyles = overlayStyles;
  }

  get isActive(): boolean {
    return this.overlayUi !== null;
  }

  async toggle(): Promise<void> {
    if (this.isActive) {
      this.deactivate();
    } else {
      await this.activate();
    }
  }

  async activate(): Promise<void> {
    if (this.isActive) {
      return;
    }

    const overlayUi = await createShadowRootUi(this.context, {
      name: OVERLAY_HOST_TAG_NAME,
      position: 'inline',
      anchor: 'html',
      append: 'last',
      css: this.overlayStyles,
      onMount: (container, _shadowRoot, shadowHost) => {
        const reactRoot = createRoot(container);
        reactRoot.render(<InspectorApp shadowHost={shadowHost} onExit={() => this.deactivate()} />);
        return reactRoot;
      },
      onRemove: (reactRoot) => reactRoot?.unmount(),
    });

    overlayUi.mount();
    this.overlayUi = overlayUi;
    await this.notifyBackground(true);
  }

  deactivate(): void {
    if (!this.overlayUi) {
      return;
    }

    this.overlayUi.remove();
    this.overlayUi = null;
    void this.notifyBackground(false);
  }

  private async notifyBackground(isActive: boolean): Promise<void> {
    try {
      await sendMessage('inspectorStateChanged', { isActive });
    } catch (messageError) {
      console.warn(
        `[Chromalens] Could not update the toolbar badge because the background worker did not respond: ${getErrorMessage(messageError)}`,
      );
    }
  }
}

export async function startInspector(context: ContentScriptContext, overlayStyles: string): Promise<void> {
  const inspectorController = new InspectorController(context, overlayStyles);

  const removeMessageListener = onMessage('toggleInspector', () => inspectorController.toggle());
  context.onInvalidated(() => {
    removeMessageListener();
    inspectorController.deactivate();
  });

  await inspectorController.activate();
}
