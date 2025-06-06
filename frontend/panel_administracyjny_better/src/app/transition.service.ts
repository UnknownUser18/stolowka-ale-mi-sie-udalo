import { Injectable, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TransitionService {

  constructor() { }

  public async applyAnimation(element: HTMLElement, open: boolean, zone : NgZone): Promise<void> {
    await this.waitForAllTransitions();
    return new Promise((resolve) => {
      zone.onStable.subscribe(() => {
        requestAnimationFrame(() => {
          element.classList.toggle('done', open);
          element.querySelector('section > div')?.classList.toggle('done', open);
          const onTransitionEnd = (e: TransitionEvent): void => {
            if (e.target === element) {
              element.removeEventListener('transitionend', onTransitionEnd);
              resolve();
            }
          };
          element.addEventListener('transitionend', onTransitionEnd);
        });
      });
    });
  }
  public waitForAllTransitions(): Promise<void> {
    return new Promise((resolve) => {
      let activeTransitions = 0;
      let resolved = false;
      const onTransitionRun = () => {
        activeTransitions++;
      };
      const onTransitionEnd = () => {
        activeTransitions = Math.max(0, activeTransitions - 1);
        if (activeTransitions === 0 && !resolved) {
          resolved = true;
          document.removeEventListener('transitionrun', onTransitionRun, true);
          document.removeEventListener('transitionend', onTransitionEnd, true);
          resolve();
        }
      };
      document.addEventListener('transitionrun', onTransitionRun, true);
      document.addEventListener('transitionend', onTransitionEnd, true);
      setTimeout(() => {
        if (activeTransitions === 0 && !resolved) {
          resolved = true;
          document.removeEventListener('transitionrun', onTransitionRun, true);
          document.removeEventListener('transitionend', onTransitionEnd, true);
          resolve();
        }
      }, 50);
    });
  }
}
