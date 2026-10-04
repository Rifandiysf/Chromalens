import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  toggleInspector(): void;
  inspectorStateChanged(data: { isActive: boolean }): void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
