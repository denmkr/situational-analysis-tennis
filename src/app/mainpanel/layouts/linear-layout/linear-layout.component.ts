import { Component, OnInit, HostListener } from '@angular/core';
import { DataService } from '../../../data.service';

import { Court } from '../../../classes/court';
import * as d3 from 'd3';

@Component({
  selector: 'app-linear-layout',
  templateUrl: './linear-layout.component.html',
  styleUrls: ['./linear-layout.component.less']
})
export class LinearLayoutComponent implements OnInit {
  situationPoints: Array<any> = [];
  courtObjects: Array<Court> = [];

  constructor(private dataService: DataService) { }

  updateData(data): void {
  	// Get standard situations shots based on the chosen situation
  	const matchId = sessionStorage.getItem('matchId');

    if (data.standard) {
      this.dataService.getLinearStandardSituationShots(matchId, data.hittingPlayerNumber, data.p1LRCode, data.p1DepthCode, data.p2LRCode, data.p2DepthCode).subscribe(res => {
        this.situationPoints = res;
        this.drawData(res);
      });
    }
    else {
      const p1X1 = data.p1RectCoordinates[0];
      const p1Y1 = data.p1RectCoordinates[1];
      const p1X2 = data.p1RectCoordinates[2];
      const p1Y2 = data.p1RectCoordinates[3];
      const p2X1 = data.p2RectCoordinates[0];
      const p2Y1 = data.p2RectCoordinates[1];
      const p2X2 = data.p2RectCoordinates[2];
      const p2Y2 = data.p2RectCoordinates[3];

      this.dataService.getLinearCustomSituationShots(matchId, data.hittingPlayerNumber, p1X1, p1Y1, p1X2, p1Y2, p2X1, p2Y1, p2X2, p2Y2).subscribe(res => {
        this.situationPoints = res;
        this.drawData(res);
      });
    }
  }

  drawData(data) {
    setTimeout(() => {
      data.forEach((d, i) => {
        // Outcome block
        if (d.pointOutcome == 'WINNER' || d.pointOutcome == 'FORCED_ERROR') d['isWinPoint'] = true;
        else d['isWinPoint'] = false;
        d['winPlayer'] = d.winningPlayer;

        // Serve block
        const serveShot = d.shots[0];
        d['servePlayer'] = serveShot.hittingplayer;
        d['serveSide'] = serveShot.serveSide;
        d['serveNumber'] = serveShot.serveNumber;

        // Shift positions
        const shifts = this.calculateShifts(d.keyShotIndex);
        const leftShift = shifts[0];
        const rightShift = shifts[1];

        d['rightAdd'] = d.shots.length - (d.keyShotIndex + 1) - 4;
        d['leftAdd'] = rightShift;

        /* Display shots */
        let container = d3.select('#shotsContainer' + i);

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
            shotContainer.attr("id", 'linearContainer' + i + '' + j);
            shotContainer.on("click", () => {
              console.log(s);
            });

            // Highlight key situation
            let isKeyShot = false;
            if (d.keyShotIndex == j) isKeyShot = true;

            // Create Court svg object using the data
            let court: Court = new Court(80, shotContainer, true, true, isKeyShot);
            court.updateDataForShot(s);
            
            // Set default circle size
            court.drawAbsBackgroundCircle(10);
            this.courtObjects.push(court);

            displayedShotsCount++;
          }
        });

        for (let k = 0; k < 9 - (displayedShotsCount + ((leftShift > 0) ? leftShift : 0)); k++) {
          let shotContainer = container.append('div');
          shotContainer.classed("shot", true);

          let color = '';
          if (d.servePlayer % 2 == (k + displayedShotsCount + rightShift) % 2) color = 'orange';
          else color = 'blue';

          // Create empty court svg object
          let court: Court = new Court(80, shotContainer, true, true, false);
          court.setEmptyCourt(color);
          this.courtObjects.push(court);
        }

      });
    }, 1);
  }

  private calculateShifts(keyShotIndex) {
    const leftShift = 4 - keyShotIndex;

    let rightShift = 0;
    if (leftShift < 0) rightShift = Math.abs(leftShift);

    return [leftShift, rightShift];
  }

  changeCourtModeView(fullMode): void {
    let elems = d3.select('#points-container').selectAll('.shots-container').classed('inview', false);
    elems.each((d, i, nodes) => {
      if (this.elementInViewport(nodes[i])) d3.select(nodes[i]).classed('inview', true);
    });

    //if (fullMode) d3.select('#points-container').selectAll('svg.court-svg').classed('small-size', false);
    //else d3.select('#points-container').selectAll('svg.court-svg').classed('small-size', true);

    if (fullMode) this.courtObjects.forEach((c: Court) => c.disableAbstractView());
    else this.courtObjects.forEach((c: Court) => c.enableAbstractView());
  }

  ngOnInit(): void {
    
  }


  private elementInViewport(el) {
    var rect = el.getBoundingClientRect(), top = rect.top, height = rect.height, 
      el = el.parentNode
    // Check if bottom of the element is off the page
    if (rect.bottom < 0) return false
    // Check its within the document viewport
    if (top > document.documentElement.clientHeight) return false

    rect = el.getBoundingClientRect()
    if (top <= rect.bottom === false) return false
    // Check if the element is out of view due to a container scrolling
    if ((top + height) <= rect.top) return false
    
    return true
  }

}
