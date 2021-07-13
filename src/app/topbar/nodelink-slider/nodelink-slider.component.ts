import { Component, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-nodelink-slider',
  templateUrl: './nodelink-slider.component.html',
  styleUrls: ['./nodelink-slider.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class NodelinkSliderComponent implements OnInit {
  @Output() onNodelinkSliderChange = new EventEmitter<number>();

  nodelinkSliderValue: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  onNodelinkSliderValueChange(event) {
    this.onNodelinkSliderChange.emit(event.value);
  }

  onNodelinkSliderMoved(event) {
    this.nodelinkSliderValue = event.value;
  }

}
