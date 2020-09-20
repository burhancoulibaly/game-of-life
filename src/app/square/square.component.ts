import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Square } from '../square';

let isMouseDown: boolean = false;
let prevPoint: any = {
  x: null,
  y: null
}

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.css']
})
export class SquareComponent implements OnInit {
  @Input() square: Square;
  @Output() activationStateChange: EventEmitter<any> = new EventEmitter();
  

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {

  }
  
  ngOnDestroy(): void {

  }

  handler(e){
    if(e.type === "mousedown"){
      prevPoint.x = this.square.x;
      prevPoint.y = this.square.y;

      this.triggerActivationStateChange();

      return isMouseDown = true;
    }

    if(e.type === "mouseover" && isMouseDown){
      if(prevPoint.x !== this.square.x || prevPoint.y !== this.square.y){
        prevPoint.x = this.square.x;
        prevPoint.y = this.square.y;

        return this.triggerActivationStateChange();
      }
    }

    if(e.type === "mouseup"){
      if(isMouseDown){
        return isMouseDown = false;
      }
    }
  }

  triggerActivationStateChange(){
    this.activationStateChange.emit({...this.square, isActivated: !this.square.isActivated, x: this.square.x, y: this.square.y});
  }
}
