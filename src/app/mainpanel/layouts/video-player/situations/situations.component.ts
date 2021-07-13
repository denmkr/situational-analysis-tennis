import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

import { Court } from '../../../../classes/court';
import * as d3 from 'd3';

@Component({
  selector: 'app-situations',
  templateUrl: './situations.component.html',
  styleUrls: ['./situations.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class SituationsComponent implements OnInit {
  @Output() onCurrentPointChange = new EventEmitter<any>();
  @Output() onCurrentSituationChanged = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) { }

  customOptions: OwlOptions = {
    animateIn:'slideInUp',
    animateOut: 'slideOutUp',
    loop: false,
    autoWidth: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    items: 1,
    nav: false
  };

  situationPoints: Array<any> = [];
  courtObjects: Array<Court> = [];

  /* Slider vars */
  lastSlideNumber: number = 0;
  situationsNumber: number = 0;
  currentSituationNumber: number = 0;
  leftAdd: number = 0;
  rightAdd: number = 0;

  isWinPoint: boolean;
  winPlayer: number;
  servePlayer: number;
  serveSide: string;
  serveNumber: number;

  updateCurrentShot(shotNumber): void {
    const curSliderNum = this.currentSituationNumber - 1;

    d3.select('#container' + curSliderNum).selectAll('.shot').classed('current', false);
    d3.select('#situationContainer' + curSliderNum + '' + shotNumber)
      .classed('current', true);
  }

  updateSituations(data): void {
    this.situationPoints = data;
    this.situationsNumber = data.length;

    setTimeout(() => {
      data.forEach((d, i) => {
        // Create container block for court svg
        let container = d3.select('#container' + i);

        const shifts = this.calculateShifts(d.keyShotIndex);
        const leftShift = shifts[0];
        const rightShift = shifts[1];

        for (let k = 0; k < leftShift; k++) {
          let shotContainer = container.append('div');
          shotContainer.classed("shot", true);

          let color = '';
          if (d.servePlayer % 2 == (k + leftShift) % 2) color = 'orange';
          else color = 'blue';

          // Create empty court svg object
          let court: Court = new Court(80, shotContainer, true, true, false);
          court.setEmptyCourt(color);
          this.courtObjects.push(court);
        }

        let displayedShotsCount = 0;

        d.shots.forEach((s, j) => {
          if (j < (9 - leftShift) && (j >= rightShift)) {
            let shotContainer = container.append('div');
            shotContainer.classed("shot", true);
            shotContainer.attr("id", 'situationContainer' + i + '' + j);

            // Highlight key situation
            let isKeyShot = false;
            if (d.keyShotIndex == j) isKeyShot = true;

            // Create Court svg object using the data
            let court: Court = new Court(80, shotContainer, true, true, isKeyShot);
            court.updateDataForShot(s);
            this.courtObjects.push(court);

            displayedShotsCount++;
          }
        });

        for (let k = 0; k < 9 - (displayedShotsCount + ((leftShift > 0) ? leftShift : 0)); k++) {
          let shotContainer = container.append('div');
          shotContainer.classed("shot", true);

          let color = '';
          if (d.servePlayer % 2 == (k + leftShift) % 2) color = 'orange';
          else color = 'blue';

          // Create empty court svg object
          let court: Court = new Court(80, shotContainer, true, true, false);
          court.setEmptyCourt(color);
          this.courtObjects.push(court);
        }
      });

      // Update current slide number
      this.currentSituationNumber = 1;

      const firstPoint = data[0];
      this.rightAdd = firstPoint.shots.length - (firstPoint.keyShotIndex + 1) - 4;
      this.leftAdd = this.calculateShifts(firstPoint.keyShotIndex)[1];
    }, 1);

    // Change detection error
    this.cdr.detectChanges();
  }

  private calculateShifts(keyShotIndex) {
    const leftShift = 4 - keyShotIndex;

    let rightShift = 0;
    if (leftShift < 0) rightShift = Math.abs(leftShift);

    return [leftShift, rightShift];
  }

  currentSituationChanged(data): void {
    const currentData = this.situationPoints[data.startPosition];
    this.onCurrentPointChange.emit(currentData);

    this.currentSituationNumber = data.startPosition + 1;
    this.rightAdd = currentData.shots.length - (currentData.keyShotIndex + 1) - 4;
    this.leftAdd = this.calculateShifts(currentData.keyShotIndex)[1];

    /* Result block */
    if (currentData.pointOutcome == 'WINNER') this.isWinPoint = true;
    else this.isWinPoint = false;
    this.winPlayer = currentData.winningPlayer;

    /* Serve block */
    const serveShot = currentData.shots[0];
    this.servePlayer = serveShot.hittingplayer;
    this.serveSide = serveShot.serveSide;
    this.serveNumber = serveShot.serveNumber;

    if (data.slides.length > 0) {
      // console.log(data.slides[0].id);
    }

    // console.log(this.situationPoints[data.startPosition]);

    //const nextSlideNumber = data.startPosition;
    // if (nextSlideNumber < this.lastSlideNumber) {
      

    //this.lastSlideNumber = nextSlideNumber;

    this.onCurrentSituationChanged.emit();
    
    // Change detection error
    this.cdr.detectChanges();
  }


  ngOnInit(): void {
  }

  changeCourtModeView(fullMode): void {
    if (fullMode) this.courtObjects.forEach((c: Court) => c.disableAbstractView());
    else this.courtObjects.forEach((c: Court) => c.enableAbstractView());
  }

  setSmallCourtView() {
    /*
    this.situations.forEach((s: Court) => {
      s.enableSmallView();
    });
    */
  }

  setFullCourtView() {
    /*
    this.situations.forEach((s: Court) => {
      s.disableSmallView();
    });
    */
  }
}
