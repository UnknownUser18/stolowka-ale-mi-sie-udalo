import { Injectable } from '@angular/core';
import { TooltipComponent } from './tooltip/tooltip.component';

@Injectable({ providedIn: 'root' })
export class TooltipRegistryService {
  private activeTooltip: TooltipComponent | null = null;

  register(tooltip: TooltipComponent) {
    if (this.activeTooltip && this.activeTooltip !== tooltip) {
      this.activeTooltip.hideImmediate();
    }
    this.activeTooltip = tooltip;
  }

  unregister(tooltip: TooltipComponent) {
    if (this.activeTooltip === tooltip) {
      this.activeTooltip = null;
    }
  }
}

