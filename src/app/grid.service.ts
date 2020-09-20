import { ElementRef, HostListener, Injectable, ViewChild } from '@angular/core';
import { Square } from './square';
import { GridDims } from './grid-dims';
import { SquareDims } from './square-dims';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const width = this.grid.nativeElement.offsetWidth;
    const height = this.grid.nativeElement.offsetHeight;
    const { squareWidth, squareHeight } = getSquareDimensions(width, height, this.cols, this.rows);
    
    this.gridDims = {
      width: width,
      height: height
    }

    this.squareDims = {
      width: squareWidth,
      height: squareHeight
    }

    console.log("Grid Dims: ", this.gridDims);
    console.log("Square Dims", this.squareDims);
  }

  @ViewChild('grid') grid: ElementRef;
  

  private gridDims: GridDims = null;
  private squareDims: SquareDims = null;
  public currentGridDims: BehaviorSubject<GridDims> = new BehaviorSubject<GridDims>(this.gridDims);
  public currentSquareDims: BehaviorSubject<SquareDims> = new BehaviorSubject<SquareDims>(this.squareDims);


  public rows: number = 50;
  public cols: number = 100;

  constructor() { }

  ngAfterViewInit() {
    const width = this.grid.nativeElement.offsetWidth;
    const height = this.grid.nativeElement.offsetHeight;
    const { squareWidth, squareHeight } = getSquareDimensions(width, height, this.cols, this.rows);
    
    this.gridDims = {
      width: width,
      height: height
    }

    this.squareDims = {
      width: squareWidth,
      height: squareHeight
    }

    console.log("Grid Dims: ", this.gridDims);
    console.log("Square Dims", this.squareDims);
  }

  gridDimsChanged(){
    this.currentGridDims.next(this.gridDims);
    return; 
  }

  squareDimsChanged(){
    this.currentSquareDims.next(this.squareDims);
    return; 
  }

  getRows(){
    return this.rows;
  }

  getCols(){
    return this.cols
  }

  
}

const getSquareDimensions = (width, height, cols, rows) => {
  let squareWidth;
  let squareHeight;

  if((width / cols) > (height / rows)){
    squareWidth = width / cols;
    squareHeight = (height / rows) * (squareWidth / (height / rows));
  }else if((height / rows) > (width / cols)){
    squareHeight = height / rows;
    squareWidth = (width / cols) * (squareHeight / (width / cols));
  }else{
    squareHeight = height / rows;
    squareWidth = width / cols;
  }

  return {
    squareWidth: squareWidth,
    squareHeight: squareHeight
  }
}
