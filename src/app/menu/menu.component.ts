import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  @Output() runStateChange: EventEmitter<boolean> = new EventEmitter();
  @Output() pauseStateChange: EventEmitter<boolean> = new EventEmitter();
  @Output() clearStateChange: EventEmitter<boolean> = new EventEmitter();
  @Output() speedStateChange: EventEmitter<number> = new EventEmitter()

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.runStateChange.emit(this.menuState.running);
    this.pauseStateChange.emit(this.menuState.paused);
    this.clearStateChange.emit(this.menuState.cleared);
    this.speedStateChange.emit(this.menuState.speed);
  }

  ngAfterViewInit(): void {
    this.menuState.speed = parseInt(this.elementRef.nativeElement.querySelector("#speed").textContent);
    this.speedStateChange.emit(this.menuState.speed);
  }

  runStateChanged(e){
    this.menuState.running = !this.menuState.running
    this.runStateChange.emit(this.menuState.running);
  }

  pauseStateChanged(e){
    this.menuState.paused = !this.menuState.paused
    this.pauseStateChange.emit(this.menuState.paused);
  }
  
  clearStateChanged(e){
    this.menuState.cleared = !this.menuState.cleared;
    this.clearStateChange.emit(this.menuState.cleared);
  }

  speedStateChanged(e){
    this.menuState.speed = e.value;
    this.speedStateChange.emit(this.menuState.speed);
  }
}
