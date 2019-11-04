import { Directive, Inject, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EMPTY, fromEvent, merge, Observable, Observer } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { stopPropagation } from './scrollbar/common';

@Directive({
  selector: '[scrollViewport]'
})
export class ScrollViewport {
  // Viewport element
  readonly nativeElement: HTMLElement;
  // Content wrapper element
  contentWrapperElement!: HTMLElement;

  // Stream that emits when pointer event when the viewport is hovered and emits false value when isn't hovered
  hovered!: Observable<boolean>;
  // Stream that emits when viewport is clicked
  clicked!: Observable<any>;

  // Get viewport size, clientHeight or clientWidth
  get clientHeight(): number {
    return this.nativeElement.clientHeight;
  }

  get clientWidth(): number {
    return this.nativeElement.clientWidth;
  }

  get scrollHeight(): number {
    return this.nativeElement.scrollHeight;
  }

  get scrollWidth(): number {
    return this.nativeElement.scrollWidth;
  }

  // Get viewport scroll offset, scrollTop or scrollLeft
  get scrollTop(): number {
    return this.nativeElement.scrollTop;
  }

  get scrollLeft(): number {
    return this.nativeElement.scrollLeft;
  }

  // Get the available scrollable size
  get scrollMaxX(): number {
    return this.scrollWidth - this.clientWidth;
  }

  get scrollMaxY(): number {
    return this.scrollHeight - this.clientHeight;
  }

  get contentHeight(): number {
    return this.contentWrapperElement.clientHeight;
  }

  constructor(public viewPort: ElementRef,
              @Inject(DOCUMENT) private document: any) {
    this.nativeElement = viewPort.nativeElement;
  }

  /**
   * Activate viewport pointer events such as 'hovered' and 'clicked' events
   */
  activatePointerEvents(): void {
    this.hovered = new Observable((observer: Observer<any>) => {
      // Stream that emits when pointer is moved over the viewport (used to set the hovered state)
      const mouseMove = fromEvent(this.nativeElement, 'mousemove', { passive: true }).pipe(stopPropagation());
      // Stream that emits when pointer leaves the viewport (used to remove the hovered state)
      const mouseLeave = fromEvent(this.nativeElement, 'mouseleave').pipe(map(() => false));
      merge(mouseMove, mouseLeave).subscribe((e: false | any) => observer.next(e));
    });

    this.clicked = new Observable((observer: Observer<any>) => {
      const mouseDown = fromEvent(this.nativeElement, 'mousedown', { passive: true }).pipe(
        tap((e: any) => observer.next(e))
      );
      const mouseUp = fromEvent(this.nativeElement, 'mouseup', { passive: true }).pipe(
        tap(() => observer.next(false))
      );
      mouseDown.pipe(
        switchMap(() => mouseUp),
      ).subscribe();
    });
  }

  /**
   * Set this directive as a non-functional wrapper, called when a custom viewport is used
   */
  setAsWrapper(): void {
    // In this case the default viewport and the default content wrapper will act as a mask
    this.nativeElement.className = 'ng-native-scrollbar-hider ng-scroll-layer';
    this.nativeElement.firstElementChild.className = 'ng-scroll-layer';
  }

  /**
   * Set this directive as  the viewport, called when no custom viewport is used
   */
  setAsViewport(customClassName: string): void {
    this.nativeElement.className = `ng-native-scrollbar-hider ng-scroll-viewport ${customClassName}`;
    // Check if the custom viewport has only one child and set it as the content wrapper
    if (this.nativeElement.firstElementChild) {
      this.contentWrapperElement = this.nativeElement.firstElementChild as HTMLElement;
      this.contentWrapperElement.classList.add('ng-scroll-content');
    }
  }

  /**
   * Scroll viewport vertically
   */
  scrollYTo(value: number): void {
    this.nativeElement.scrollTop = value;
  }

  /**
   * Scroll viewport horizontally
   */
  scrollXTo(value: number): void {
    this.nativeElement.scrollLeft = value;
  }
}
