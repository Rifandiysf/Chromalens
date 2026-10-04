import { defineContentScript } from 'wxt/utils/define-content-script';
import { startInspector } from '@/features/inspector/inspector-controller';
import overlayStyles from './style.css?inline';

export default defineContentScript({
  registration: 'runtime',
  main: (context) => startInspector(context, overlayStyles),
});
