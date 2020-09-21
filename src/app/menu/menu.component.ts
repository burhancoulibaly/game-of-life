import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Menu } from '../menu';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  public menuState: Menu = {
    running: false,
    paused: false,
    cleared: true,
    speed: 0,
  }
  
  @Input() gridCleared: BehaviorSubject<boolean>;
  @Output() runStateChange: EventEmitter<boolean> = new EventEmitter();
  @Output() pauseStateChange: EventEmitter<boolean> = new EventEmitter();
  @Output() clearStateChange: EventEmitter<boolean> = new EventEmitter();
  @Output() speedStateChange: EventEmitter<number> = new EventEmitter();

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.runStateChange.emit(this.menuState.running);
    this.pauseStateChange.emit(this.menuState.paused);
    this.clearStateChange.emit(this.menuState.cleared);
    this.speedStateChange.emit(this.menuState.speed);

    this.gridCleared
      .subscribe((clearState) => {
        // console.log("Grid cleared", clearState);
        
        this.menuState.cleared = clearState;
      });
  }

  ngAfterViewInit(): void {
    this.menuState.speed = parseInt(this.elementRef.nativeElement.querySelector("#speed").textContent);
    this.speedStateChange.emit(this.menuState.speed);
  }

  runStateChanged(e){
    this.menuState.running = true;
    this.menuState.paused = false;
    this.runStateChange.emit(this.menuState.running);
    this.pauseStateChange.emit(this.menuState.paused);
  }

  pauseStateChanged(e){
    if(this.menuState.running){
      this.menuState.running = false;
      this.menuState.paused = true;
      this.runStateChange.emit(this.menuState.running);
      this.pauseStateChange.emit(this.menuState.paused);      
    }
  }
  
  clearStateChanged(e){
    this.menuState.running = false;
    this.menuState.paused = false;
    this.menuState.cleared = false;
    this.runStateChange.emit(this.menuState.running);
    this.pauseStateChange.emit(this.menuState.paused);
    this.clearStateChange.emit(this.menuState.cleared);
  }

  speedStateChanged(e){
    this.menuState.speed = e.value;
    this.speedStateChange.emit(this.menuState.speed);
  }
}
