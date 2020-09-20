import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GridDims } from '../grid-dims';
import { Menu } from '../menu';
import { Square } from '../square';
import { SquareDims } from '../square-dims';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, AfterViewChecked {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const width = this.gridElement.nativeElement.offsetWidth;
    const height = this.gridElement.nativeElement.offsetHeight;
    const tempGrid = this.grid;
    
    this.gridDims = {
      width: width,
      height: height
    }

    const { rows, cols } = getSquareDimensions(width, height, this.squareDims);
    
    this.rows = rows;
    this.cols = cols;

    this.grid = Array(rows)
      .fill(0)
      .map((row, index) => 
      Array(cols)
        .fill({
          width: this.squareDims.width, 
          height: this.squareDims.height,  
          x: null, 
          y: index,
          isActive: false
        }).map((col, index) =>{
          return {
            ...col,
            x: index
          }
        })
      )

    this.grid = this.grid
    .map((row, j) => row
      .map((col, i) => {
        if(tempGrid[j] && tempGrid[j][i]){
          return {
            ...col,
            isActivated: tempGrid[j][i].isActivated
          }
        }
        return col;
      })
    );
        
    console.log("Grid Dims: ", this.gridDims);
    console.log("Square Dims", this.squareDims);
    console.log("Grid: ", this.grid );
  }
  @ViewChild('gridElement') gridElement: ElementRef;
  @Input() runState: BehaviorSubject<boolean>;
  @Input() pauseState: BehaviorSubject<boolean>;
  @Input() clearState: BehaviorSubject<boolean>;
  @Input() speedState: BehaviorSubject<number>;

  private menuState: Menu = {
    running: null,
    paused: null,
    cleared: null,
    speed: null,
  }
  public gridDims: GridDims;
  public squareDims: SquareDims = {
    width: 15,
    height: 15,
  };
  public square: Square;
  public rows: number;
  public cols: number;
  public grid: Array<Array<Square>>;

  constructor(private cdRef : ChangeDetectorRef) { }

  ngOnInit(): void {
    this.runState
      .subscribe((runState) => {
        console.log("running", runState);

        this.menuState.running = runState;
      });

    this.pauseState
      .subscribe((pauseState) => {
        console.log("paused", pauseState);
        
        this.menuState.paused = pauseState;
      });
    
    this.clearState
      .subscribe((clearState) => {
        console.log("cleared", clearState);
        
        this.menuState.cleared = clearState;
      });

    this.speedState
      .subscribe((speedState) => {
        console.log("speed", speedState);
        
        this.menuState.speed = speedState;
      });
  }

  
  ngAfterViewInit(): void {
    const width = this.gridElement.nativeElement.offsetWidth;
    const height = this.gridElement.nativeElement.offsetHeight;
    
    this.gridDims = {
      width: width,
      height: height
    }

    const { rows, cols } = getSquareDimensions(width, height, this.squareDims);
    
    this.rows = rows;
    this.cols = cols;

    this.grid = Array(rows)
      .fill(0)
      .map((row, index) => 
      Array(cols)
        .fill({
          width: this.squareDims.width, 
          height: this.squareDims.height,  
          x: null, 
          y: index,
          isActive: false
        }).map((col, index) =>{
          return {
            ...col,
            x: index
          }
        })
      )

    console.log("Grid Dims: ", this.gridDims);
    console.log("Square Dims", this.squareDims);
    console.log("Grid: ", this.grid );
  }

  ngAfterViewChecked() {
      this.cdRef.detectChanges();
  }

  handleActivationStateChange(square: Square){
    this.grid[square.y][square.x] = square;
  }
}

const getSquareDimensions = (width, height, squareDims) => {
  const rows = Math.floor(height / squareDims.height);
  const cols = Math.floor(width / squareDims.width);

  return {
    rows: rows,
    cols: cols
  }
}