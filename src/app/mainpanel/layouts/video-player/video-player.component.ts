import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { TimeSlider } from './timeslider';
import { VideoComponent } from './video/video.component';
import { ControlsComponent } from './controls/controls.component';
import { SituationsComponent } from './situations/situations.component';
import { ScorePanelComponent } from './score-panel/score-panel.component';

import { DataService } from '../../../data.service';

import * as moment from 'moment';
import * as d3 from 'd3';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class VideoPlayerComponent implements OnInit {
  @ViewChild(VideoComponent, {static: false}) videoComponent: VideoComponent;
  @ViewChild(ControlsComponent, {static: false}) controlsComponent: ControlsComponent;
  @ViewChild(SituationsComponent, {static: false}) situationsComponent: SituationsComponent;
  @ViewChild(ScorePanelComponent, {static: false}) scorePanelComponent: ScorePanelComponent;
 
  timeslider: TimeSlider;

  timescale: any;
  startLimit: number;
  endLimit: number;
  data: Array<any>;

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.initVideo();
  }

  ngOnInit(): void {
    this.initTimeslider();
    this.addTimesliderListeners();
  }
  
  updateData(data): void {
    // Get standard situations shots based on the chosen situation
    const matchId = sessionStorage.getItem('matchId');
    if (data.standard) {
      this.dataService.getLinearStandardSituationShots(matchId, data.hittingPlayerNumber, data.p1LRCode, data.p1DepthCode, data.p2LRCode, data.p2DepthCode).subscribe(res => {
        // Update situations
        this.situationsComponent.updateSituations(res);
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
        // Update situations
        this.situationsComponent.updateSituations(res);
      });
    }
  }

  updateCurrentPoint(point): void {
    // Get necessary data
    const data = this.getData(point);

    // Update video time
    this.videoComponent.updateVideoTime(data[0].startTimestamp, data[data.length - 1].endTimestamp);

    // Get time boundaries for scale calculation
    const timeBoundaries = this.getTimeBoundaries(data);
    this.timescale = d3.scaleLinear().domain(d3.extent(timeBoundaries)).range([0, 1]);
    this.startLimit = timeBoundaries[0];
    this.endLimit = timeBoundaries[1];

    // Transform data and use it for timeslider
    const transformedData = this.transformData(data);
    this.data = transformedData;
    this.timeslider.plotData(transformedData);

    // Update scoreboard data
    this.scorePanelComponent.updateData(point);
  }

  private initVideo(): void {
    this.videoComponent.setSourceVideo('/assets/videos/federer.mp4');
    this.videoComponent.pause();
    // this.videoComponent.updateVideoTime("2007-01-31 00:20:21.20", "2007-01-31 00:21:04.30");
  }

  private initTimeslider(): void {
    this.timeslider = new TimeSlider(620, 40, "#slider-container");
  }

  private transformData(data) {
    let transformedData = [];

    data.forEach(d => {
      let newData = {};

      newData['startPercent'] = this.timescale(this.calculateSecondsFromTimestamp(d.startTimestamp));
      newData['endPercent'] = this.timescale(this.calculateSecondsFromTimestamp(d.endTimestamp));
      newData['color'] = (d.hittingPlayerNumber === 1) ? 'blue' : 'orange';
      newData['dashed'] = !(d.strokeside === 'Forehand');
      newData['keyShot'] = d.keyShot;

      transformedData.push(newData);
    });

    return transformedData;
  }

  private calculateSecondsFromTimestamp(timestamp) {
    const mnt = moment.utc(timestamp);
    const seconds = +moment.duration(mnt.format("HH:mm:ss.SSS")).asSeconds();

    return seconds;
  }

  private getTimeBoundaries(data) {
    const startTimestamp = data[0].startTimestamp;
    const endTimestamp = data[data.length - 1].endTimestamp;

    const startSeconds = this.calculateSecondsFromTimestamp(startTimestamp);
    const endSeconds = this.calculateSecondsFromTimestamp(endTimestamp);

    return [startSeconds, endSeconds];
  }

  private getSectorsPercentages() {
    const data = this.data;
    let percentages = data.map(d => d.startPercent);
    percentages.push(1);

    return percentages;
  }

  private addTimesliderListeners() {
    this.timeslider.onCurStart.subscribe((res) => {
      this.videoComponent.pause();
    });

    this.timeslider.onHandlesMoved.subscribe((res) => {
      const boundaries = [this.timescale.invert(res[0]), this.timescale.invert(res[1])];
      this.videoComponent.updatePlayBoundaries(boundaries[0], boundaries[1]);

      this.startLimit = boundaries[0];
      this.endLimit = boundaries[1];
    });

    this.timeslider.onCurMoved.subscribe((res) => {
      this.videoComponent.updateCurrentTime(this.timescale.invert(res));
    });

    // Timeslider sector changed (played shot changed)
    this.timeslider.onCurrentSectorChanged.subscribe(res => {
      this.situationsComponent.updateCurrentShot(res);
    });
  }

  private getData(allData) {
    let data = [];
    const keyShotIndex = allData.keyShotIndex;

    allData.shots.forEach((s, i) => {
      let shot = {};

      shot['startTimestamp'] = s.starttimestamp;

      if (s.endtimestamp !== null) shot['endTimestamp'] = s.endtimestamp;
      else shot['endTimestamp'] = s.bouncetimestamp;

      shot['hittingPlayerNumber'] = s.hittingplayer;
      shot['strokeside'] = s.strokeside;
      shot['keyShot'] = (keyShotIndex == i);

      data.push(shot);
    });

    /*
    const data = [
      {
          startTimestamp:           "2007-01-31 00:20:21.20",
          endTimestamp:             "2007-01-31 00:20:25.20",
          hittingPlayerNumber:    1, //1 or 2
          strokeside:             'Backhand' //forehand or first serve
      },
      {
          startTimestamp:           "2007-01-31 00:20:25.20",
          endTimestamp:             "2007-01-31 00:20:32.20",
          hittingPlayerNumber:    2, //1 or 2
          strokeside:             'Forehand' //forehand or first serve
      },
      {
          startTimestamp:           "2007-01-31 00:20:32.20",
          endTimestamp:             "2007-01-31 00:20:49.20",
          hittingPlayerNumber:    1, //1 or 2
          strokeside:             'Forehand' //forehand or first serve
      },
      {
          startTimestamp:           "2007-01-31 00:20:49.20",
          endTimestamp:             "2007-01-31 00:20:55.20",
          hittingPlayerNumber:    2, //1 or 2
          strokeside:             'Backhand' //forehand or first serve
      },
      {
          startTimestamp:           "2007-01-31 00:20:55.20",
          endTimestamp:             "2007-01-31 00:21:04.30",
          hittingPlayerNumber:    1, //1 or 2
          strokeside:             'Forehand' //forehand or first serve
      }
    ];
    */

    return data;
  }

  speedSliderChanged(event) {
    this.videoComponent.changePlaybackRate(event);
  }

  controlButtonClicked(event) {
    switch (event.event) {
      case 'loop':
        this.videoComponent.enableLoop(event.value);
        break; 

      case 'play':
        if (event.value === true) this.videoComponent.play();
        else this.videoComponent.pause();
        break;

      case 'start':
        this.videoComponent.updateCurrentTime(this.startLimit);
        break;

      case 'sector_start': {
        const sectors = this.getSectorsPercentages();
        const startValue = this.timescale(this.videoComponent.getCurrentTime());

        const closestStart = sectors.reduce(function(prev, curr) {
          const closest = (Math.abs(curr - startValue) < Math.abs(prev - startValue) ? curr : prev);

          if (closest < startValue) return closest;
          else return prev;
        });

        this.videoComponent.updateCurrentTime(this.timescale.invert(closestStart));
        break;
      }

      case 'next_sector': {
        const sectors = this.getSectorsPercentages();
        const startValue = this.timescale(this.videoComponent.getCurrentTime());

        const closestEnd = sectors.reduce(function(prev, curr) {
          const closest = (Math.abs(curr - startValue) < Math.abs(prev - startValue) ? curr : prev);
          
          if (closest > startValue) return closest;
          else return curr;
        });

        this.videoComponent.updateCurrentTime(this.timescale.invert(closestEnd));
        break;
      }

      case 'end':
        this.videoComponent.updateCurrentTime(this.endLimit);
        break;
      
      default:
        break;
    }
  }

  /* Court view button change */
  @HostListener('document:click', ['$event'])
  onDocumentClicked(event) {
    /* Full court view button clicked */
    if (event.target.id === 'full-court-button') this.situationsComponent.setFullCourtView();
    else if (event.target.id === 'small-court-button') this.situationsComponent.setSmallCourtView();
  }

  /* Situations Listeners */
  currentSituationChanged() {
    this.videoComponent.pause();
    this.controlsComponent.showPlayButton();
  }

  /* Video Component Listeners */
  currentTimeChanged(event) {
    if (this.timescale === undefined) return;
    
    const currentTime = event;
    this.timeslider.moveCurrentHandle(this.timescale(currentTime));
  }

  videoPlayedPaused(event) {
    const played = event;

    if (played) this.controlsComponent.showPauseButton();
    else this.controlsComponent.showPlayButton();
  }

  /* Situations Component Listeners */
  currentPointChanged(event) {
    this.updateCurrentPoint(event);
  }

}
