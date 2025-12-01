import { Component, input, signal, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector : 'app-dialog',
  imports : [
    FaIconComponent
  ],
  templateUrl : './dialog.component.html',
  styleUrl : './dialog.component.scss',
  host : {
    '[attr.role]' : '"dialog"',
    '[attr.aria-modal]' : '"true"',
    '[attr.aria-label]' : 'label()',
    '[class.visible]' : 'isVisible()',
  }
})
export class DialogComponent {
  private overlayRef! : OverlayRef;
  private dialog = viewChild.required<TemplateRef<any>>('dialog');

  protected isVisible = signal(false);

  protected readonly faXmark = faXmark;

  public label = input<string>();

  constructor(
    private overlay : Overlay,
    private vcr : ViewContainerRef
  ) {
  }

  private destroy() {
    if (this.overlayRef)
      this.overlayRef.dispose();
  }

  public show() {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically()

    if (this.overlayRef)
      this.overlayRef.dispose();

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop : true,
      backdropClass : 'dialog-backdrop',
      scrollStrategy : this.overlay.scrollStrategies.reposition()
    });

    const portal = new TemplatePortal(this.dialog(), this.vcr);
    this.overlayRef.attach(portal);

    const background = this.overlayRef.backdropElement;
    setTimeout(() => {
      this.isVisible.set(true)
    });

    if (!background) return;

    setTimeout(() => background.classList.add('visible'));
  }


  public hide() {
    if (!this.overlayRef) return;

    this.isVisible.set(false);

    setTimeout(() => {
      this.overlayRef.dispose();
      this.destroy();
    }, 200)
  }

}
