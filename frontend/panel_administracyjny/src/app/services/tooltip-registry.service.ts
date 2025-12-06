import { Injectable } from '@angular/core';
import { Tooltip } from '@utils/tooltip/tooltip';

@Injectable({ providedIn: 'root' })
export class TooltipRegistryService {
  private activeTooltip : Tooltip | null = null;

  register(tooltip : Tooltip) {
    if (this.activeTooltip && this.activeTooltip !== tooltip) {
      this.activeTooltip.hideImmediate();
    }
    this.activeTooltip = tooltip;
  }

  unregister(tooltip : Tooltip) {
    if (this.activeTooltip === tooltip) {
      this.activeTooltip = null;
    }
  }
}

