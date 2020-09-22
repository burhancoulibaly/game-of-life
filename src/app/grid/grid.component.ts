import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
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

    let tempGrid = this.grid;
    
    this.gridDims = {
      width: width,
      height: height
    }

    const { rows, cols } = getRowsAndCols(width, height, this.squareDims);
    
    this.rows = rows;
    this.cols = cols;

    this.grid = new Array(this.rows * this.cols)
      .fill({
        width: this.squareDims.width, 
        height: this.squareDims.height,  
        isActive: false
      })
      .map((square, i) => {
        return {
          ...square,
          x: i % this.cols, 
          y: Math.abs((i - (i % this.cols)) / this.cols),
        }
      });
      

    this.grid = this.grid
      .map((square) => {
        tempGrid
          .map((tempSquare) => {
            if(square.x === tempSquare.x && square.y === tempSquare.y){
              square = {
                ...square,
                isActive: tempSquare.isActive
              }
            }
          })  
        return { ...square };
      });
        
    // console.log("Grid Dims: ", this.gridDims);
    // console.log("Square Dims", this.squareDims);
    // console.log("Grid: ", this.grid );
  }
  @ViewChild('gridElement') gridElement: ElementRef;
  @Input() runState: BehaviorSubject<boolean>;
  @Input() pauseState: BehaviorSubject<boolean>;
  @Input() clearState: BehaviorSubject<boolean>;
  @Input() generateLifeState: BehaviorSubject<boolean>;
  @Input() speedState: BehaviorSubject<number>;
  @Output() gridCleared: EventEmitter<boolean> = new EventEmitter();
  @Output() lifeGenerated: EventEmitter<boolean> = new EventEmitter();

  private subscriptions: Array<BehaviorSubject<any> | Subscription> = new Array();
  private speedSubscription: Subscription;
  public menuState: Menu = {
    running: null,
    paused: null,
    cleared: null,
    generateLife: null,
    speed: null,
  }
  public gridDims: GridDims;
  public squareDims: SquareDims = {
    width: 15,
    height: 15,
  };
  public square: Square;
  public rows: number = 0;
  public cols: number = 0;
  public grid: Array<Square>;
  


  constructor(private cdRef : ChangeDetectorRef) { }

  ngOnInit(): void {
    this.runState
      .subscribe((runState) => {
        // console.log("running", runState);

        this.menuState.running = runState;

        if(this.speedSubscription){
          this.speedSubscription.unsubscribe();
        }

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
      .subscribe(async(clearState) => {
        // console.log("Clearing grid", clearState);
        
        this.menuState.cleared = clearState;

        if(!this.menuState.cleared){
          await this.clearGrid();
          this.menuState.cleared = true;

          this.gridCleared.emit(this.menuState.cleared);
        }
      });
    this.subscriptions.push(this.clearState);

    this.generateLifeState
      .subscribe(async(generateLifeState) => {
        // console.log("Generating life", generateLifeState);

        this.menuState.generateLife = generateLifeState;

        if(this.menuState.generateLife){
          await this.generateRandomLife();
          this.menuState.generateLife = false;

          this.lifeGenerated.emit(this.menuState.generateLife);
        }
      });
    this.subscriptions.push(this.generateLifeState);

    this.speedState
      .subscribe((speedState) => {
        // console.log("speed", speedState);
        
        this.menuState.speed = speedState;

        if(this.speedSubscription){
          this.speedSubscription.unsubscribe();
        }

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

    this.grid = new Array(this.rows * this.cols)
      .fill({
        width: this.squareDims.width, 
        height: this.squareDims.height,  
        isActive: false
      })
      .map((square, i) => {
        return {
          ...square,
          x: i % this.cols, 
          y: Math.abs((i - (i % this.cols)) / this.cols),
        }
      });

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
    // console.log(square)
    this.grid[getIndex(square.x, square.y, this.cols)] = square;
  }

  generateRandomLife(){
    const randomInts = new Array(this.rows * this.cols)
      .fill(0)
      .map((randomInt) => {
        return getRandomInt() === 1 ? true : false;
      });

    this.grid = this.grid
      .map((square, index) => {
        return {
          ...square,
          isActive: randomInts[index]
        }
      });
  }

  runAlgorithm(){
    // console.log(500 / this.menuState.speed)
    const repeat = timer(0 / this.menuState.speed, 500 / this.menuState.speed);

    const subscribe = repeat.subscribe(() => {
      if(this.menuState.running && !this.menuState.paused){
        const tempGrid = new Array(this.rows * this.cols)
        .fill({
          width: this.squareDims.width, 
          height: this.squareDims.height,  
          isActive: false
        })
        .map((square, i) => {
          return {
            ...square,
            x: i % this.cols, 
            y: Math.abs((i - (i % this.cols)) / this.cols),
          }
        });

        for(let i = 0; i < this.grid.length; i++){
          tempGrid[i].isActive = getGridPointState(i, this.grid, this.cols, this.rows);
        }

        // console.log(tempGrid);

        this.grid = this.grid
          .map((square, index) => {
            if(tempGrid[index]){
              return {
                ...square,
                isActive: tempGrid[index].isActive
              }
            }
            
            return { ...square };
          });
      }
    });
    this.subscriptions.push(subscribe);
    this.speedSubscription = subscribe;
  }

  clearGrid(){
    if(this.rows && this.cols){
      this.grid = new Array(this.rows * this.cols)
        .fill({
          width: this.squareDims.width, 
          height: this.squareDims.height,  
          isActive: false
        })
        .map((square, i) => {
          return {
            ...square,
            x: i % this.cols, 
            y: Math.abs((i - (i % this.cols)) / this.cols),
          }
        });

      return;
    }
  }
}

const getRandomInt = () => {
  const randomInt = Math.round(Math.random());

  return randomInt;
}

const getGridPointState = (i, grid, cols, rows) => {
  const isAlive = grid[i].isActive;
  const neighbors = getNeighbors(grid[i].x, grid[i].y, grid, cols, rows);
  
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

const getNeighbors = (x, y, grid, cols, rows) => {
  const neighbors = new Array(8);

  //grid[y][j]

  if(x-1 > 0 && y-1 > 0){
    // console.log(grid[getIndex(x-1, y-1, cols)])
    neighbors[0] = grid[getIndex(x-1, y-1, cols)].isActive;
  }
  if(y-1 > 0){
    // console.log(grid[getIndex(x, y-1, cols)])
    neighbors[1] = grid[getIndex(x, y-1, cols)].isActive;
  }
  if(x+1 < cols && y-1 > 0){
    // console.log(grid[getIndex(x+1, y-1, cols)])
    neighbors[2] = grid[getIndex(x+1, y-1, cols)].isActive;
  }
  if(x-1 > 0){
    // console.log(grid[getIndex(x-1, y, cols)])
    neighbors[3] = grid[getIndex(x-1, y, cols)].isActive;
  }
  if(x+1 < cols){
    // console.log(grid[getIndex(x+1, y, cols)])
    neighbors[4] = grid[getIndex(x+1, y, cols)].isActive;
  }
  if(x-1 > 0 && y+1 < rows){
    // console.log(grid[getIndex(x-1, y+1, cols)])
    neighbors[5] = grid[getIndex(x-1, y+1, cols)].isActive;
  }
  if(y+1 < rows){
    // console.log(grid[getIndex(x, y+1, cols)])
    neighbors[6] = grid[getIndex(x, y+1, cols)].isActive;
  }
  if(x+1 < cols && y+1 < rows){
    // console.log(grid[getIndex(x+1, y+1, cols)])
    neighbors[7] = grid[getIndex(x+1, y+1, cols)].isActive;
  }

  return neighbors;
}

const getIndex = (x, y, cols) => {
  return (x + (y * cols));
}

const getRowsAndCols = (width, height, squareDims) => {
  const rows = Math.floor(height / squareDims.height);
  const cols = Math.floor(width / squareDims.width);

  return {
    rows: rows,
    cols: cols
  }
}