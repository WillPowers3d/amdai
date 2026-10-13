/** Desktop mega-menu: hover-bridge, delayed close, click toggle, keyboard. */

export const MEGA_CLOSE_DELAY_MS = 250;

export type MegaNavHandle = {
  open: () => void;
  close: () => void;
  destroy: () => void;
};

export function wrapIndex(index: number, length: number, delta: number): number {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
}

export function bindMegaItem(item: HTMLElement): MegaNavHandle | null {
  const trigger = item.querySelector<HTMLButtonElement>('.mega-trigger');
  const panel = item.querySelector<HTMLElement>('.mega-panel');
  if (!trigger || !panel) return null;

  if (!panel.id) panel.id = `mega-panel-${Math.random().toString(36).slice(2, 8)}`;
  trigger.setAttribute('aria-controls', panel.id);
  trigger.setAttribute('aria-haspopup', 'true');

  let open = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const setOpen = (next: boolean) => {
    open = next;
    trigger.setAttribute('aria-expanded', String(next));
    panel.hidden = !next;
  };

  const cancelClose = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    timer = setTimeout(() => {
      const hovered = item.matches(':hover');
      const focused = item.contains(document.activeElement);
      if (!hovered && !focused) setOpen(false);
    }, MEGA_CLOSE_DELAY_MS);
  };

  const onTriggerClick = (event: Event) => {
    event.preventDefault();
    cancelClose();
    setOpen(!open);
  };

  const onTriggerKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cancelClose();
      setOpen(true);
      panel.querySelector<HTMLElement>('a')?.focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      cancelClose();
      setOpen(true);
      const links = panel.querySelectorAll<HTMLElement>('a');
      links[links.length - 1]?.focus();
    }
  };

  const onItemKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelClose();
      setOpen(false);
      trigger.focus();
    }
  };

  const onEnter = () => {
    cancelClose();
    setOpen(true);
  };

  const onFocusIn = () => {
    cancelClose();
    setOpen(true);
  };

  const onFocusOut = (event: FocusEvent) => {
    if (!item.contains(event.relatedTarget as Node | null)) scheduleClose();
  };

  const onDocPointer = (event: Event) => {
    if (!item.contains(event.target as Node | null)) {
      cancelClose();
      setOpen(false);
    }
  };

  trigger.addEventListener('click', onTriggerClick);
  trigger.addEventListener('keydown', onTriggerKey);
  item.addEventListener('keydown', onItemKey);
  item.addEventListener('mouseenter', onEnter);
  item.addEventListener('mouseleave', scheduleClose);
  panel.addEventListener('mouseenter', onEnter);
  panel.addEventListener('mouseleave', scheduleClose);
  item.addEventListener('focusin', onFocusIn);
  item.addEventListener('focusout', onFocusOut);
  document.addEventListener('pointerdown', onDocPointer);

  return {
    open: () => {
      cancelClose();
      setOpen(true);
    },
    close: () => {
      cancelClose();
      setOpen(false);
    },
    destroy: () => {
      cancelClose();
      trigger.removeEventListener('click', onTriggerClick);
      trigger.removeEventListener('keydown', onTriggerKey);
      item.removeEventListener('keydown', onItemKey);
      item.removeEventListener('mouseenter', onEnter);
      item.removeEventListener('mouseleave', scheduleClose);
      panel.removeEventListener('mouseenter', onEnter);
      panel.removeEventListener('mouseleave', scheduleClose);
      item.removeEventListener('focusin', onFocusIn);
      item.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('pointerdown', onDocPointer);
    },
  };
}

export function bindMegaNav(root: ParentNode = document): MegaNavHandle[] {
  const items = [...root.querySelectorAll<HTMLElement>('.mega-item')];
  const handles = items
    .map((item) => bindMegaItem(item))
    .filter((handle): handle is MegaNavHandle => handle != null);

  items.forEach((item, index) => {
    const trigger = item.querySelector<HTMLButtonElement>('.mega-trigger');
    const panel = item.querySelector<HTMLElement>('.mega-panel');
    if (!trigger || !panel) return;

    const linksOf = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.mega-panel a')];

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        handles[index]?.close();
        const next = wrapIndex(index, items.length, event.key === 'ArrowRight' ? 1 : -1);
        items[next]?.querySelector<HTMLButtonElement>('.mega-trigger')?.focus();
      }
    });

    panel.addEventListener('keydown', (event) => {
      const links = linksOf(item);
      const current = links.indexOf(document.activeElement as HTMLElement);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        links[wrapIndex(Math.max(current, 0), links.length, 1)]?.focus();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (current <= 0) trigger.focus();
        else links[current - 1]?.focus();
      }
      if (event.key === 'Home') {
        event.preventDefault();
        links[0]?.focus();
      }
      if (event.key === 'End') {
        event.preventDefault();
        links[links.length - 1]?.focus();
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        handles[index]?.close();
        const next = wrapIndex(index, items.length, event.key === 'ArrowRight' ? 1 : -1);
        handles[next]?.open();
        items[next]?.querySelector<HTMLElement>('.mega-panel a')?.focus();
      }
    });
  });

  return handles;
}
