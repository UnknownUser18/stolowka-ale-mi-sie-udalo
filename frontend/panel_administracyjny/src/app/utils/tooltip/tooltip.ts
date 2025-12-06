import { Component, inject, input, InputSignal, Signal, signal, TemplateRef, viewChild, ViewContainerRef, WritableSignal } from '@angular/core';
import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import { TooltipRegistryService } from '@services/tooltip-registry.service';


@Component({
  selector : 'app-tooltip',
  imports : [
    NgTemplateOutlet
  ],
  templateUrl : './tooltip.html',
  styleUrl    : './tooltip.scss'
})
export class Tooltip {
  private tooltipRegistry = inject(TooltipRegistryService)

  /**
   * @description Positions for the tooltip overlay.
   * @private
   * @readonly
   */
  private readonly positions : ConnectedPosition[] = [
    {
      originX : 'center',
      originY : 'bottom',
      overlayX : 'center',
      overlayY : 'top',
      offsetY : 8,
    },
    {
      originX : 'center',
      originY : 'top',
      overlayX : 'center',
      overlayY : 'bottom',
      offsetY : -8,
    }
  ];
  /**
   * @description Reference to the overlay created for the tooltip.
   * @private
   */
  private overlayRef! : OverlayRef;
  /**
   * @description Timeout identifier for hiding the tooltip.
   * @private
   */
  private hideTimeout : any;
  /**
   * @description Template reference for the tooltip content.
   * @type{Signal<TemplateRef<any>>}
   * @private
   */
  private tooltip : Signal<TemplateRef<any>> = viewChild.required<TemplateRef<any>>('tooltip');

  /**
   * @description Signal indicating whether the tooltip is currently visible.
   * @type{WritableSignal<boolean>}
   * @protected
   */
  protected isVisible : WritableSignal<boolean> = signal(false);
  /**
   * @description Signal indicating whether the tooltip is hoverable.
   * @type{WritableSignal<boolean>}
   * @protected
   */
  protected isHoverable : WritableSignal<boolean> = signal<boolean>(false);

  /**
   * @optional
   * @description If set to `true`, the tooltip will be displayed vertically. If set to `false` or `null`, it will be displayed horizontally. Default is `null`.
   * @type{InputSignal<boolean | null>}
   */
  public horizontal : InputSignal<boolean | null> = input<boolean | null>(null);

  constructor(
    private overlay : Overlay,
    private vcr : ViewContainerRef,
  ) {
  }

  /**
   * @method destroy
   * @description Cleans up the overlay when the component is destroyed.
   * @private
   */
  private destroy() {
    this.overlayRef?.dispose();
  }

  /**
   * @method createTooltip
   * @description Creates and displays the tooltip overlay.
   * @param positionStrategy{FlexibleConnectedPositionStrategy} The position strategy for the overlay.
   * @param hasBackdrop{boolean | undefined} Optional. If set to `true`, the overlay will have a backdrop that closes the tooltip when clicked outside. Default is `false`.
   * @private
   */
  private createTooltip(positionStrategy : FlexibleConnectedPositionStrategy, hasBackdrop? : boolean) {
    if (this.overlayRef)
      this.overlayRef.dispose();

    this.overlayRef = this.overlay.create({
      hasBackdrop : hasBackdrop ?? false,
      backdropClass : 'cdk-overlay-transparent-backdrop',
      scrollStrategy : this.overlay.scrollStrategies.reposition(),
      positionStrategy
    });

    if (hasBackdrop)
      this.overlayRef.backdropClick().subscribe(() => this.hide());

    const portal = new TemplatePortal(this.tooltip(), this.vcr);
    this.overlayRef.attach(portal);
    this.isVisible.set(true);
  }

  /**
   * @method clearHideTimeout
   * @description Clears the hide timeout if it exists, preventing the tooltip from being hidden prematurely.
   */
  protected clearHideTimeout() {
    if (!this.hideTimeout) return;

    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  }

  /**
   * @method createInfoTooltip
   * @description Creates and displays the tooltip overlay at the position of the mouse event.
   * @param event{MouseEvent} The mouse event triggering the tooltip.
   * @notes - This method is typically called from a directive that handles mouse events.
   */
  public createInfoTooltip(event : MouseEvent) {
    if (this.isVisible()) return;
    this.tooltipRegistry.register(this);
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x : event.clientX, y : event.clientY })
      .withPositions(this.positions)
      .withPush(true);

    this.isHoverable.set(true);

    this.createTooltip(positionStrategy);
  }

  /**
   * @method createOptionsTooltip
   * @description Creates and displays the tooltip overlay connected to the host element.
   * @notes - This method is typically called from a directive that handles click events.
   */
  public createOptionsTooltip(under? : boolean, HTMLElement? : HTMLElement) {

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(under ? HTMLElement! : this.vcr.element)
      .withPositions(this.positions)
      .withPush(true);

    this.createTooltip(positionStrategy, true);
  }

  /**
   * @method hide
   * @description Hides the tooltip overlay after a short delay to allow for smooth transitions.
   */
  public hide() {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      this.isVisible.set(false);
      setTimeout(() => {
        this.overlayRef?.detach();
        this.destroy();
        this.tooltipRegistry.unregister(this);
      }, 200)
    }, 150);
  }

  public hideImmediate() {
    this.clearHideTimeout();
    this.isVisible.set(false);
    setTimeout(() => {
      this.overlayRef?.detach();
      this.destroy();
      this.tooltipRegistry.unregister(this);
    }, 0);
  }
}
