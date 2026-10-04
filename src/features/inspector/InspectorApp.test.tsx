import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectorApp } from './InspectorApp';

const RED_TEXT_ON_BLUE_BACKGROUND = 'color: rgb(255, 0, 0); background-color: rgb(0, 0, 255);';

function createPageElement(inlineStyle: string): HTMLElement {
  const pageElement = document.createElement('p');
  pageElement.id = 'sample';
  pageElement.setAttribute('style', inlineStyle);
  pageElement.textContent = 'Sample text';
  document.body.appendChild(pageElement);
  return pageElement;
}

describe('InspectorApp', () => {
  function renderInsideShadowHost(): void {
    render(<InspectorApp shadowHost={shadowHost} onExit={exitInspector} />, { container: shadowHost });
  }

  const copyToClipboard = vi.fn().mockResolvedValue(undefined);
  const exitInspector = vi.fn();
  let shadowHost: HTMLElement;

  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: copyToClipboard }, configurable: true });
    shadowHost = document.createElement('div');
    document.body.appendChild(shadowHost);
  });

  afterEach(() => {
    cleanup();
    document.body.replaceChildren();
    copyToClipboard.mockClear();
    exitInspector.mockClear();
    vi.unstubAllGlobals();
  });

  it('shows the hovered element colors in the default HEX format', async () => {
    const pageElement = createPageElement(RED_TEXT_ON_BLUE_BACKGROUND);
    renderInsideShadowHost();

    fireEvent.mouseMove(pageElement, { clientX: 20, clientY: 20 });

    expect(await screen.findByRole('button', { name: 'Copy Text color #ff0000' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy Background color #0000ff' })).toBeTruthy();
    expect(screen.getByText('p#sample')).toBeTruthy();
  });

  it('locks the element on click without letting the page handle the click', async () => {
    const pageElement = createPageElement(RED_TEXT_ON_BLUE_BACKGROUND);
    const pageClickHandler = vi.fn();
    pageElement.addEventListener('click', pageClickHandler);
    renderInsideShadowHost();

    fireEvent.click(pageElement);

    expect(await screen.findByRole('button', { name: 'Unlock element' })).toBeTruthy();
    expect(pageClickHandler).not.toHaveBeenCalled();
  });

  it('copies a value and shows a confirmation', async () => {
    const pageElement = createPageElement(RED_TEXT_ON_BLUE_BACKGROUND);
    renderInsideShadowHost();
    fireEvent.click(pageElement);

    fireEvent.click(await screen.findByRole('button', { name: 'Copy Text color #ff0000' }));

    await waitFor(() => expect(copyToClipboard).toHaveBeenCalledWith('#ff0000'));
    expect(await screen.findByText('Copied #ff0000')).toBeTruthy();
  });

  it('explains why copying failed when the clipboard is blocked', async () => {
    copyToClipboard.mockRejectedValueOnce(new Error('Document is not focused.'));
    document.execCommand = vi.fn().mockReturnValue(false);
    const pageElement = createPageElement(RED_TEXT_ON_BLUE_BACKGROUND);
    renderInsideShadowHost();
    fireEvent.click(pageElement);

    fireEvent.click(await screen.findByRole('button', { name: 'Copy Text color #ff0000' }));

    expect(await screen.findByText(/Could not copy to the clipboard because the browser blocked/)).toBeTruthy();
  });

  it('switches the displayed format from the dropdown', async () => {
    const pageElement = createPageElement(RED_TEXT_ON_BLUE_BACKGROUND);
    renderInsideShadowHost();
    fireEvent.click(pageElement);

    fireEvent.change(await screen.findByRole('combobox', { name: 'Color format' }), { target: { value: 'hsl' } });

    expect(await screen.findByRole('button', { name: 'Copy Text color hsl(0, 100%, 50%)' })).toBeTruthy();
  });

  it('unlocks on the first Esc and exits on the second', async () => {
    const pageElement = createPageElement(RED_TEXT_ON_BLUE_BACKGROUND);
    renderInsideShadowHost();
    fireEvent.click(pageElement);
    await screen.findByRole('button', { name: 'Unlock element' });

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('button', { name: 'Unlock element' })).toBeNull();
    expect(exitInspector).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(exitInspector).toHaveBeenCalledTimes(1);
  });
});
