import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { Court } from '../classes/court';
import { Shot } from '../interfaces/Shot';
import { StandardSummarySituation } from '../interfaces/StandardSummarySituation';
import * as d3 from 'd3';

@Component({
  selector: 'app-situationpanel',
  templateUrl: './situationpanel.component.html',
  styleUrls: ['./situationpanel.component.less']
})
export class SituationpanelComponent implements OnInit {
  @Output() onCurrentSituationChanged = new EventEmitter<any>();

  situationBlocks: Array<any> = [];
  maxKeyShotsNumber: number = 0;
  courtObjects: Array<Court> = [];

  constructor() { }

  ngOnInit(): void {
  }

  addSituation(situation: any, standard: boolean): void {
    if (this.situationBlocks.includes(situation)) {
      // Move the elem to the beginning
      const elemIndex = this.situationBlocks.indexOf(situation);
      this.situationBlocks.splice(elemIndex, 1);
      this.situationBlocks.unshift(situation);
    }
    else {
      // Add elem
      situation['current'] = false;
      situation['standard'] = standard;
      this.situationBlocks.unshift(situation);
      // this.maxKeyShotsNumber = (situation.keySituationShots.length > this.maxKeyShotsNumber) ? situation.keySituationShots.length : this.maxKeyShotsNumber;

      setTimeout(() => {
        let container = d3.select('#situationContainer0');
        let shotContainer = container.select(".shot");

        // Create Court svg object using the data
        let court: Court = new Court(80, shotContainer, true, false, false);

        // Display standard custom situation
        if (standard) court.updateDataForStandardSituation(situation);
        else court.updateDataForCustomSituation(situation);

        court.drawAbsBackgroundCircle(this.maxKeyShotsNumber);

        this.courtObjects.unshift(court);
      }, 1);
    }
  }

  public updateMaxKeyShotsNumber(maxKeyShotsNumber: number) {
    this.maxKeyShotsNumber = maxKeyShotsNumber;
  }

  onCloseBlockButtonClick(index): void {
    this.situationBlocks.splice(index, 1);
    this.courtObjects.splice(index, 1);
  }

  onSituationBlockClick(index): void {
    // Find current true and cancel it
    for (let s of this.situationBlocks) {
      if (s['current'] === true) {
        s['current'] = false;
        break;
      }
    }

    let situation = this.situationBlocks[index];
    situation['current'] = true;
    this.onCurrentSituationChanged.emit(situation);
  }

  // https://material.angular.io/cdk/drag-drop/overview
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.situationBlocks, event.previousIndex, event.currentIndex);
  }

}
