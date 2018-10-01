import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

interface AxisBlock {
  cord: string;
  x?: number;
  y?: number;
}

export interface Point {
  x: number;
  y: number;
}

interface BlockRang {
  min: number;
  max: number;
  block: number;
}

@Component({
  selector: 'app-risk-matrix',
  templateUrl: './risk-matrix.component.html',
  styleUrls: ['./risk-matrix.component.css']
})
export class RiskMatrixComponent implements OnInit, OnChanges {
  @ViewChild('riskCanvas') public canvasRef: ElementRef;

  @Input() public initialRisk: Point = null;
  @Output() public chooseRisk: EventEmitter<Point> = new EventEmitter<Point>();

  public blocksInOwnCordSystem: { x: BlockRang[], y: BlockRang[] } = {
    x: [
      { min: 29, max: 79, block: 1},
      { min: 83, max: 133, block: 2},
      { min: 137, max: 187, block: 3},
      { min: 191, max: 241, block: 4},
      { min: 245, max: 295, block: 5},
    ],
    y: [
      {min: 13, max: 63, block: 5},
      {min: 67, max: 117, block: 4},
      {min: 121, max: 171, block: 3},
      {min: 175, max: 225, block: 2},
      {min: 229, max: 279, block: 1}
    ]
  };

  private _ctx: CanvasRenderingContext2D;

  private _currentPoint: Point = null;
  private _currentGrayPoints: Point[] = null;

  private _defaultBlue = '#f0f8fd';
  private _chosenBlue = '#2185c2';
  private _gray = '#f1f4f6';

  constructor() { }

  ngOnInit() {
    this._ctx = this.canvasRef.nativeElement.getContext('2d');

    this.captureEvents(this.canvasRef.nativeElement);

    this._drawAxises();

    this._drawBlocksCol();
  }

  ngOnChanges(changes: SimpleChanges) {
    const point: Point = changes['initialRisk'].currentValue;

    if (point) {
      this._drawChosenPoint({
        x: this._findRealCordsOfPoint('x', point.x),
        y: this._findRealCordsOfPoint('y', point.y),
      });
      this._calcAndColorGrayBlocks(this.initialRisk);
    }
  }

  private captureEvents(canvasEl: HTMLCanvasElement): void {
    fromEvent(canvasEl, 'click')
      .pipe(
        map(({ offsetX, offsetY }: MouseEvent ) => (
          this._mapPointToMyCordSystem(offsetX, offsetY )
        )),
        tap((point: Point) => {
          if (this._currentPoint) {
            this._cleanUpPreviousPoint();
            this._cleanUpGrayPoints();
          }

          return point;
        }),
        filter((point: Point ) => {
          return point.x !== null && point.y !== null;
        })
      )
      .subscribe((point: Point) => {
        this._drawChosenPoint({
          x: this._findRealCordsOfPoint('x', point.x),
          y: this._findRealCordsOfPoint('y', point.y),
        });
        this.chooseRisk.emit(point);

        this._calcAndColorGrayBlocks(point);
      });
  }

  private _mapPointToMyCordSystem(x: number, y: number): Point {
    const blockRangesForX: BlockRang[] = [
      { min: 29, max: 79, block: 1},
      { min: 83, max: 133, block: 2},
      { min: 137, max: 187, block: 3},
      { min: 191, max: 241, block: 4},
      { min: 245, max: 295, block: 5},
    ];

    const blockRangesForY: BlockRang[] = [
      {min: 13, max: 63, block: 5},
      {min: 67, max: 117, block: 4},
      {min: 121, max: 171, block: 3},
      {min: 175, max: 225, block: 2},
      {min: 229, max: 279, block: 1}
    ];

    return {
      x: this._convertCordToBlockCord(blockRangesForX, x),
      y: this._convertCordToBlockCord(blockRangesForY, y)
    };
  }

  private _drawAxises(): void {
    const self: any = this;

    function _drawAxisBlock(cord: string = '1', x: number, y: number) {
      self._ctx.font = 'bold 14px sans-serif';
      self._ctx.fillText(cord, x + 8, y + 30);
    }

    function _drawYAxisBlock(cord: string, y: number) {
      _drawAxisBlock(cord, 0, y);
    }

    function _drawXAxisBlock(cord: string, x: number) {
      self._ctx.font = 'bold 14px sans-serif';
      self._ctx.fillText(cord, x, 312);
    }

    function _drawXAxis() {
      const xAxisBlocksContent: AxisBlock[] = [
        {
          cord: '1',
          x: 48
        },
        {
          cord: '2',
          x: 102
        },
        {
          cord: '3',
          x: 156
        },
        {
          cord: '4',
          x: 210
        },
        {
          cord: '5',
          x: 264
        },
      ];
      xAxisBlocksContent.forEach(({ cord, x }: AxisBlock) => {
        _drawXAxisBlock(cord, x);
      });
    }

    function _drawYAxis() {
      const yAxisBlocksContent: AxisBlock[] = [
        {
          cord: '5',
          y: 13
        },
        {
          cord: '4',
          y: 67
        },
        {
          cord: '3',
          y: 121
        },
        {
          cord: '2',
          y: 175
        },
        {
          cord: '1',
          y: 229
        },
      ];
      yAxisBlocksContent.forEach(({ cord, y }: AxisBlock) => {
        _drawYAxisBlock(cord, y);
      });
    }

    _drawXAxis();
    _drawYAxis();
  }

  private _drawBlocksCol(): void {
    const xCordsOfColumns: number[] = [29, 83, 137, 191, 245];
    const yCordsOfColumns: number[] = [13, 67, 121, 175, 229];

    xCordsOfColumns.forEach((xCord: number) => {
      yCordsOfColumns.forEach((yCord: number) => {
        this._drawBlock(xCord, yCord, 50, 50, this._defaultBlue);
      });
    });
  }

  private _drawBlock(x: number, y: number, w: number, h: number, color: string): void {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(x, y, w, h);
  }

  private _findRealCordsOfPoint(axis: string, pointCord: number): number {
    return this.blocksInOwnCordSystem[axis].map(({ block, min }) => {
      if (block === pointCord) {
        return min;
      }
    }).filter((val) => val && val)[0];
  }

  private _cleanUpPreviousPoint() {
    this._ctx.fillStyle = this._defaultBlue;
    this._ctx.fillRect(
      this._currentPoint.x,
      this._currentPoint.y,
      50, 50
    );
    this._currentPoint = null;
  }

  private _cleanUpGrayPoints() {
    this._currentGrayPoints.forEach(p => {
      this._colorPoint(p, this._defaultBlue);
    });
    this._currentGrayPoints = [];
  }

  private _drawChosenPoint(cords: Point) {
    this._currentPoint = cords;
    this._colorPoint(cords, this._chosenBlue);
  }

  private _colorPoint(point: Point, color: string) {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(point.x, point.y, 50, 50);
  }

  private _convertCordToBlockCord(rangesBlockArray: BlockRang[], cord: number): number {
    let result: number = null;

    rangesBlockArray.forEach((c: BlockRang) => {
      if (cord > c.min && cord < c.max) {
        result = c.block;
      }
    });

    return result;
  }

  private _calcAndColorGrayBlocks(point: Point) {
    const arrOfX: any[] = Array.from({ length: point.x - 1 }, (v, k) => k + 1);
    const arrOfY: number[] = Array.from({ length: point.y - 1 }, (v, k) => k + 1);

    const dotsX: Point[] = arrOfX.map(x => ({
      x,
      y: point.y
    }));

    const dotsY: Point[] = arrOfY.map(y => ({
      y,
      x: point.x
    }));

    this._currentGrayPoints = dotsX.concat(dotsY)
      .map((p: Point) => ({
        x: this._findRealCordsOfPoint('x', p.x),
        y: this._findRealCordsOfPoint('y', p.y),
      }));

    this._currentGrayPoints.forEach(p => {
      this._colorPoint(p, this._gray);
    });

  }
}
