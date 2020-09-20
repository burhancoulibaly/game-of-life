import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Menu } from '../menu';

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit {
  private menuState: Menu = {
    running: null,
    paused: null,
    cleared: null,
    speed: null,
  }

  public runState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.menuState.running);
  public pauseState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.menuState.paused);
  public clearState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.menuState.cleared);
  public speedState: BehaviorSubject<number> = new BehaviorSubject<number>(this.menuState.speed);

  constructor() { }

  ngOnInit(): void {
  }

  handleRunStateChange(runningState){
    this.menuState.running = runningState;
    this.runStateChanged();
  }

  handlePauseStateChange(pauseState){
    this.menuState.paused = pauseState;
    this.pauseStateChanged();
  }

  handleClearStateChange(clearState){
    this.menuState.cleared = clearState;
    this.clearStateChanged();
  }

  handleSpeedStateChange(speedState){
    this.menuState.speed = speedState;
    this.speedStateChanged();
  }

  runStateChanged(){
    this.runState.next(this.menuState.running);
    return; 
  }

  pauseStateChanged(){
    this.pauseState.next(this.menuState.paused);
    return; 
  }

  clearStateChanged(){
    this.clearState.next(this.menuState.cleared);
    return; 
  }

  speedStateChanged(){
    this.speedState.next(this.menuState.speed);
    return; 
  }
}
