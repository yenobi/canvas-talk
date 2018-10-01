import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {map, pairwise, switchMap, takeUntil} from 'rxjs/internal/operators';

interface MousePositionOnCanvas {
  x: number;
  y: number;
}

@Component({
  selector: 'app-signature',
  template: '<canvas #signature ></canvas>',
  styles: ['canvas { border: 1px solid black; }']
})
export class SignatureComponent implements AfterViewInit {
  @ViewChild('signature') public canvas: ElementRef;
  private _ctx: CanvasRenderingContext2D;
  private _canvasSize = {
    width: 400,
    height: 400
  };

  constructor() { }

  public ngAfterViewInit() {
    const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
    this._ctx = canvasElement.getContext('2d');
    canvasElement.width = this._canvasSize.width;
    canvasElement.height = this._canvasSize.height;

    this._ctx.lineWidth = 3;
    this._ctx.lineCap = 'round';
    this._ctx.strokeStyle = '#000';

    this._captureEvents(canvasElement);
  }

  private _captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap(() => {
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              pairwise(),
              map((res: [MouseEvent, MouseEvent]) => ({
                prevPos: {
                  x: res[0].offsetX,
                  y: res[0].offsetY,
                },
                currPos: {
                  x: res[1].offsetX,
                  y: res[1].offsetY,
                }
              }))
            );
        })
      )
      .subscribe(({ prevPos, currPos }) => {
        this._drawOnCanvas(
          prevPos,
          currPos
        );
      });
  }

  private _drawOnCanvas(
    prevPos: MousePositionOnCanvas,
    currPos: MousePositionOnCanvas
  ) {
    if (!this._ctx) { return null; }

    this._ctx.beginPath();

    this._ctx.moveTo(prevPos.x, prevPos.y);

    this._ctx.lineTo(currPos.x, currPos.y);

    this._ctx.stroke();
  }

}
