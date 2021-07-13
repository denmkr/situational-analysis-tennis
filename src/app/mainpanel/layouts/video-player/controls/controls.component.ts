import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ControlsComponent implements OnInit {
  @Output() onControlButtonClick = new EventEmitter<{event: string, value: boolean}>();
  @Output() onSpeedSliderChange = new EventEmitter<number>();

  isLoopButtonActive: boolean = false;
  isPlayButtonActive: boolean = true;
  speedSliderValue: number = 1;

  iconName: string;

  constructor() { }

  ngOnInit(): void {
  }

  showPlayButton() {
    this.isPlayButtonActive = true;
  }

  showPauseButton() {
    this.isPlayButtonActive = false;
  }

  onLoopClick() {
    this.isLoopButtonActive = !this.isLoopButtonActive;
    this.onControlButtonClick.emit({event: 'loop', value: this.isLoopButtonActive});
  }

  onPlayClick() {
  	this.onControlButtonClick.emit({event: 'play', value: true});
  }

  onPauseClick() {
    this.onControlButtonClick.emit({event: 'play', value: false});
  }

  onToStartClick() {
  	this.onControlButtonClick.emit({event: 'start', value: true});
  }

  onToSectorStartClick() {
  	this.onControlButtonClick.emit({event: 'sector_start', value: true});
  }

  onToNextSectorClick() {
  	this.onControlButtonClick.emit({event: 'next_sector', value: true});
  }

  onToEndClick() {
  	this.onControlButtonClick.emit({event: 'end', value: true});
  }

  onSpeedSliderValueChange(event) {
    this.onSpeedSliderChange.emit(event.value);
  }

  onSpeedSliderMoved(event) {
    this.speedSliderValue = event.value;
  }

}
