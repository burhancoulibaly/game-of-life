import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
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

    const { rows, cols } = getRowsAndCols(width, height, this.squareDims);
    
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
            isActive: tempGrid[j][i].isActive
          }
        }
        return col;
      })
    );
        
    // console.log("Grid Dims: ", this.gridDims);
    // console.log("Square Dims", this.squareDims);
    // console.log("Grid: ", this.grid );
  }
  @ViewChild('gridElement') gridElement: ElementRef;
  @Input() runState: BehaviorSubject<boolean>;
  @Input() pauseState: BehaviorSubject<boolean>;
  @Input() clearState: BehaviorSubject<boolean>;
  @Input() speedState: BehaviorSubject<number>;
  @Output() gridCleared: EventEmitter<boolean> = new EventEmitter();

  private subscriptions: Array<any> = new Array();
  public menuState: Menu = {
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
        // console.log("running", runState);

        this.menuState.running = runState;

        this.runAlgorithm();
      });
    this.subscriptions.push(this.runState);

    this.pauseState
      .subscribe((pauseState) => {
        // console.log("paused", pauseState);
        
        this.menuState.paused = pauseState;
      });
    this.subscriptions.push(this.pauseState);
    
    this.clearState
      .subscribe((clearState) => {
        // console.log("cleared", clearState);
        
        this.menuState.cleared = clearState;

        if(!this.menuState.cleared){
          this.grid = clearGrid(this.rows, this.cols, this.squareDims);
          this.menuState.cleared = true;

          this.gridCleared.emit(this.menuState.cleared);
        }
      });
    this.subscriptions.push(this.clearState);

    this.speedState
      .subscribe((speedState) => {
        // console.log("speed", speedState);
        
        this.menuState.speed = speedState;

        this.runAlgorithm();
      });
    this.subscriptions.push(this.speedState);
  }

  
  ngAfterViewInit(): void {
    const width = this.gridElement.nativeElement.offsetWidth;
    const height = this.gridElement.nativeElement.offsetHeight;
    
    this.gridDims = {
      width: width,
      height: height
    }

    const { rows, cols } = getRowsAndCols(width, height, this.squareDims);
    
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

    // console.log("Grid Dims: ", this.gridDims);
    // console.log("Square Dims", this.squareDims);
    // console.log("Grid: ", this.grid );
  }

  ngAfterViewChecked() {
      this.cdRef.detectChanges();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleActivationStateChange(square: Square){
    this.grid[square.y][square.x] = square;
  }

  runAlgorithm(){
    // console.log(500 / this.menuState.speed)
    const repeat = timer(0 / this.menuState.speed, 500 / this.menuState.speed);

    const subscribe = repeat.subscribe(() => {
      if(this.menuState.running && !this.menuState.paused){
        const tempGrid = Array(this.grid.length)
                          .fill(0)
                          .map((row, index) => 
                          Array(this.grid[index].length)
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

        for(let j = 0; j < this.grid.length; j++){
          for(let i = 0; i < this.grid[j].length; i++){
            tempGrid[j][i].isActive = getGridPointState(i, j, this.grid);
          }
        }

        // console.log(tempGrid);

        this.grid = this.grid
          .map((row, j) => row
            .map((col, i) => {
              if(tempGrid[j] && tempGrid[j][i]){
                return {
                  ...col,
                  isActive: tempGrid[j][i].isActive
                }
              }
              return col;
            })
          );
      }
    });
    this.subscriptions.push(subscribe);
  }
}

const getGridPointState = (i, j, grid) => {
  const isAlive = grid[j][i].isActive;
  const neighbors = getNeighbors(i, j, grid);
  
  let countLiveNeighbors = 0;

  for(let i = 0; i < neighbors.length; i++){
    if(neighbors[i]){
      countLiveNeighbors++;
    }
  }

  if(!isAlive && countLiveNeighbors === 3){
    return true
  }

  if(isAlive && countLiveNeighbors > 3){
    return false;
  }

  if(isAlive && countLiveNeighbors === 2 || countLiveNeighbors === 3){
    return true;
  }

  if(isAlive && countLiveNeighbors < 2){
    return false
  }
}

const getNeighbors = (i, j, grid) => {
  const neighbors = new Array(8);

  //grid[y][j]

  if(grid[j-1] && grid[j-1][i-1]){
    // console.log(grid[j-1][i-1])
    neighbors[0] = grid[j-1][i-1].isActive;
  }
  if(grid[j-1] && grid[j-1][i]){
    // console.log(grid[j-1][i])
    neighbors[1] = grid[j-1][i].isActive;
  }
  if(grid[j-1] && grid[j-1][i+1]){
    // console.log(grid[j-1][i+1])
    neighbors[2] = grid[j-1][i+1].isActive;
  }
  if(grid[j] && grid[j][i-1]){
    // console.log(grid[j][i-1])
    neighbors[3] = grid[j][i-1].isActive;
  }
  if(grid[j] && grid[j][i+1]){
    // console.log(grid[j][i+1])
    neighbors[4] = grid[j][i+1].isActive;
  }
  if(grid[j+1] && grid[j+1][i-1]){
    // console.log(grid[j+1][i-1])
    neighbors[5] = grid[j+1][i-1].isActive;
  }
  if(grid[j+1] && grid[j+1][i]){
    // console.log(grid[j+1][i])
    neighbors[6] = grid[j+1][i].isActive;
  }
  if(grid[j+1] && grid[j+1][i+1]){
    // console.log(grid[j+1][i+1])
    neighbors[7] = grid[j+1][i+1].isActive;
  }

  return neighbors;
}

const getRowsAndCols = (width, height, squareDims) => {
  const rows = Math.floor(height / squareDims.height);
  const cols = Math.floor(width / squareDims.width);

  return {
    rows: rows,
    cols: cols
  }
}

const clearGrid = (rows, cols, squareDims) => {
  const grid = Array(rows)
      .fill(0)
      .map((row, index) => 
      Array(cols)
        .fill({
          width: squareDims.width, 
          height: squareDims.height,  
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

  return grid;
      
}