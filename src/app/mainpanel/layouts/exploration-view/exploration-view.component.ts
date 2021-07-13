import { Component, OnInit, EventEmitter, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import { DataService } from '../../../data.service';
import { Court } from '../../../classes/court';
import { StandardSummarySituation } from '../../../interfaces/StandardSummarySituation';
import { Shot } from '../../../interfaces/Shot';
import { CourtSelectionComponent } from './court-selection/court-selection.component';

import * as d3 from 'd3';

@Component({
  selector: 'app-exploration-view',
  templateUrl: './exploration-view.component.html',
  styleUrls: ['./exploration-view.component.less'],
  // for d3 created elements styles
  encapsulation: ViewEncapsulation.None
})
export class ExplorationViewComponent implements OnInit {
  @Output() onStandardSituationBlockClicked = new EventEmitter<any>();
  @Output() onCustomSituationAdd = new EventEmitter<any>();
  @Output() onMaxKeyShotsNumberUpdate = new EventEmitter<number>();

  @ViewChild(CourtSelectionComponent, {static: false}) courtSelectionComponent: CourtSelectionComponent;

  maxKeyShotsNumber: number = 0;
  courtObjects: Array<Court> = [];

  constructor(private dataService: DataService) { }

  updateData(matchId): void {
    this.plotStandardSituations(matchId, 1).then(() => {
    	this.plotStandardSituations(matchId, 2).then(() => {
			  this.plotCourtBackgroundCircles();
        this.onMaxKeyShotsNumberUpdate.emit(this.maxKeyShotsNumber);
    	});
    });
  }

  plotStandardSituations(matchId, playerNumber) {
  	/* Retrieve standard situations for the player */
  	return new Promise((resolve, reject) => {
	  	this.dataService.getStandardSituations(matchId, playerNumber.toString()).subscribe((res: Array<any>) => { 
	  	  res.forEach(situation => {
    			// Create container block for court svg
    			let container = d3.select("#p" + playerNumber.toString() + "-situation-blocks").append('div');
    			container.classed("situation-block", true).on('click', () => this.onSituationBlockClick(situation));

    			// Create Court svg object using the data
    			let court: Court = new Court(80, container, true, true, false);
    			// Draw the court based on data
    			court.updateDataForStandardSituation(situation);
    			this.courtObjects.push(court);

  			  // Find max keyShots number among situations
  	  		this.maxKeyShotsNumber = (situation.keySituationShots.length > this.maxKeyShotsNumber) ? situation.keySituationShots.length : this.maxKeyShotsNumber;
	      });

	      resolve(true);
	  	});
  	});
  }

  plotCourtBackgroundCircles() {
  	// Update courts background circle size
  	this.courtObjects.forEach(court => {
  	  court.drawAbsBackgroundCircle(this.maxKeyShotsNumber);
  	});
  }

  ngOnInit(): void {
  }

  addCustomSituation(data): void {
    this.onCustomSituationAdd.emit(data);
  }

  onSituationBlockClick(data: StandardSummarySituation): void {
    this.onStandardSituationBlockClicked.emit(data);
  }

}
