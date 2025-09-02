import { Component, signal, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';


@Component({
  selector : 'app-tooltip',
  imports : [],
  templateUrl : './tooltip.component.html',
  styleUrl : './tooltip.component.scss',
  host : {}
})
export class TooltipComponent {

  private overlayRef! : OverlayRef;
  private hideTimeout : any;

  private tooltip = viewChild.required<TemplateRef<any>>('tooltip');

  protected isVisible = signal(false);

  constructor(
    private overlay : Overlay,
    private vcr : ViewContainerRef
  ) {
  }


  protected clearHideTimeout() {
    if (!this.hideTimeout) return;

    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
  }

  public showAt(event : MouseEvent) {
    const positions : ConnectedPosition[] = [
      {
        originX : 'center',
        originY : 'bottom',
        overlayX : 'center',
        overlayY : 'top',
        offsetY : 8
      },
      {
        originX : 'center',
        originY : 'top',
        overlayX : 'center',
        overlayY : 'bottom',
        offsetY : -8
      }
    ];

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x : event.clientX, y : event.clientY })
      .withPositions(positions)
      .withPush(true);

    if (this.overlayRef)
      this.overlayRef.dispose();

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop : false,
      scrollStrategy : this.overlay.scrollStrategies.reposition()
    });

    const portal = new TemplatePortal(this.tooltip(), this.vcr);
    this.overlayRef.attach(portal);
    this.isVisible.set(true);
  }

  public updatePosition(event : MouseEvent) {
    if (!this.overlayRef) return;

    this.isVisible.set(false);
    const strategy = this.overlay
      .position()
      .flexibleConnectedTo({ x : event.clientX, y : event.clientY })
      .withPositions([
        {
          originX : 'start',
          originY : 'bottom',
          overlayX : 'start',
          overlayY : 'top',
          offsetY : 8
        }
      ]);

    this.overlayRef.updatePositionStrategy(strategy);
    this.isVisible.set(true);
  }

  public hide() {
    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => {
      this.isVisible.set(false);

      setTimeout(() => {
        this.overlayRef?.detach();
      }, 200)
    }, 150);
  }

}
