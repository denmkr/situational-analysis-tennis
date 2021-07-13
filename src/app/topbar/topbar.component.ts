import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { WinbarComponent } from './winbar/winbar.component';
import { MatchinfoComponent } from './matchinfo/matchinfo.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.less']
})
export class TopbarComponent implements OnInit {
  @Output() onFullCourtModeChanged = new EventEmitter<boolean>();
  @Output() onMatchChanged = new EventEmitter<string>();

  @ViewChild(WinbarComponent, {static: false}) winbarComponent: WinbarComponent;
  @ViewChild(MatchinfoComponent, {static: false}) matchinfoComponent: MatchinfoComponent;

  colorScale: any;
  
  selectedMatch = null;
  matches = ['89', '90', '91'];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.colorScale = this.getColorMap();
  }

  onSelectedMatchChange(matchId: string) {
    // Get id value
    this.onMatchChanged.emit(matchId.split(': ')[1]);
    this.selectedMatch = matchId;
  }

  selectMatchId(matchId: string) {
    this.selectedMatch = matchId;
  }

  onMiniCourtViewButtonClick() {
  	this.onFullCourtModeChanged.emit(false);
  }

  onFullCourtViewButtonClick() {
  	this.onFullCourtModeChanged.emit(true);
  }

  public updateBackgroundColor(p1WinningPercentage): void {
    d3.select('.navbar').style('background', this.colorScale(p1WinningPercentage));
  }

  private getColorMap(): (_: number) => string {
    const stops = [[223, 54, 40], [255, 255, 255], [6, 168, 92]];
    const jetrgb = stops.map(x => d3.rgb.apply(null, x.map(y => y)) as string);
    return d3.piecewise(d3.interpolateRgb, jetrgb);
  }



}
