import { Component, OnInit, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { LinearLayoutComponent } from './layouts/linear-layout/linear-layout.component';
import { NodelinkLayoutComponent } from './layouts/nodelink-layout/nodelink-layout.component';
import { VideoPlayerComponent } from './layouts/video-player/video-player.component';
import { ExplorationViewComponent } from './layouts/exploration-view/exploration-view.component';

@Component({
  selector: 'app-mainpanel',
  templateUrl: './mainpanel.component.html',
  styleUrls: ['./mainpanel.component.less']
})
export class MainpanelComponent implements OnInit {
  @Output() newStandardSituationExplored = new EventEmitter<any>();
  @Output() newCustomSituationExplored = new EventEmitter<any>();
  @Output() onMaxKeyShotsNumberUpdate = new EventEmitter<number>();

  @ViewChild(LinearLayoutComponent, {static: false}) linearLayoutComponent: LinearLayoutComponent;
  @ViewChild(NodelinkLayoutComponent, {static: false}) nodelinkLayoutComponent: NodelinkLayoutComponent;
  @ViewChild(VideoPlayerComponent, {static: false}) videoPlayerComponent: VideoPlayerComponent;
  @ViewChild(ExplorationViewComponent, {static: false}) explorationViewComponent: ExplorationViewComponent;

  constructor() { }

  ngOnInit(): void {
  }

  updateMaxKeyShotsNumber(event): void {
    this.onMaxKeyShotsNumberUpdate.emit(event);
  }

  updateExplorationView(data): void {
    this.explorationViewComponent.updateData(data);
    this.explorationViewComponent.courtSelectionComponent.updateData(data);
  }

  newExploredStandardSituation(event): void {
    this.newStandardSituationExplored.emit(event);
  }

  newExploredCustomSituation(event): void {
    this.newCustomSituationExplored.emit(event);
  }

  changeCurrentSituation(event): void {
    this.linearLayoutComponent.updateData(event);
    this.nodelinkLayoutComponent.updateData(event);
    this.videoPlayerComponent.updateData(event);
  }

  changeCourtModeView(mode): void {
    this.linearLayoutComponent.changeCourtModeView(mode);
    this.nodelinkLayoutComponent.changeCourtModeView(mode);
    this.videoPlayerComponent.situationsComponent.changeCourtModeView(mode);
  }

}
