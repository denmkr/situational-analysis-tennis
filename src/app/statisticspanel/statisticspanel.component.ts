import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { BarChart } from './charts/barchart';
import { FishGrid } from './charts/fishgrid';
import * as d3 from 'd3';

import { DataService } from '../data.service';

const StatPanelWidth = 280;
const FishGridWidth = 260;
const FishGridHeight = 260;

@Component({
  selector: 'app-statisticspanel',
  templateUrl: './statisticspanel.component.html',
  styleUrls: ['./statisticspanel.component.less']
})
export class StatisticspanelComponent implements OnInit {
  /* Bar chart objects */
  strokeChart: BarChart;
  outcomeChart: BarChart;
  serveChart: BarChart;
  lengthChart: BarChart;
  reverseChart: BarChart;
  keyChart: BarChart;

  fishgrid: FishGrid;

  settingsWindowActive: boolean = false;
  statisticsBlocks: Array<any> = [];
  newBlocks: Array<any> = [];

  /* Static names of charts */
  blocks = [{name: 'Player-stroke side', container: 'stroke-container'}, {name: 'Point outcomes', container: 'outcome-container'}, {name: 'Server-serve number', container: 'serve-container'}, {name: 'Point length', container: 'length-container'}, {name: 'Reverse Key Shot Index', container: 'reverse-container'}, {name: 'Key Shot Index', container: 'key-container'}, {name: 'Fish Grid', container: 'fish-container'}];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    /* Initialize statistics blocks */
    this.initStatisticsBlocks();
  }

  ngAfterViewInit(): void {
    /* Initialize statistics charts */
    this.initCharts();
  }

  updateDataForStandardSituation(matchId, data): void {
    // Get statistics data based on the chosen situation
    this.dataService.getStatisticsForStandard(matchId, data.hittingPlayerNumber, data.p1LRCode, data.p1DepthCode, data.p2LRCode, data.p2DepthCode).subscribe(res => {
      this.updateCharts(res);
    });
  }

  updateDataForCustomSituation(matchId, data): void {
    // Get statistics data based on the chosen situation
    this.dataService.getStatisticsForCustom(matchId, data.hittingPlayerNumber, data.p1RectCoordinates, data.p2RectCoordinates).subscribe(res => {
      this.updateCharts(res);
    });
  }

  updateDataForMatch(matchId): void {
    this.dataService.getStatisticsForMatch(matchId).subscribe(res => {
      this.updateCharts(res);
    });
  }

  private updateCharts(res): void {
    const strokeData = this.getJsonChartData(['P1', 'P2', 'P1`', 'P2`'], [res.strokeSideHistogramValuesP1Wins, res.strokeSideHistogramValuesP2Wins]);
    this.strokeChart.plotData(strokeData);

    const outcomeData = this.getJsonChartData(['P1', 'P2', 'P1`', 'P2`'], [res.pointOutcomeHistogramValues]);
    this.outcomeChart.plotData(outcomeData);

    const serveData = this.getJsonChartData(['P1-1', 'P1-2', 'P2-1', 'P2-2', 'P1-1`', 'P1-2`', 'P2-1`', 'P2-2`'], [res.serveHistogramValuesP1Wins, res.serveHistogramValuesP2Wins]);
    this.serveChart.plotData(serveData);

    const lengthData = this.getJsonChartData(['S', 'R', '3', '4', '5-8', '9+'], [res.pointLengthHistogramValuesP1Wins, res.pointLengthHistogramValuesP2Wins]);
    this.lengthChart.plotData(lengthData);

    const reverseData = this.getJsonChartData(['<-3', '-3', '-2', '-1', '0'], [res.reverseKeyShotHistogramP1Wins, res.reverseKeyShotHistogramP2Wins]);
    this.reverseChart.plotData(reverseData);

    const keyData = this.getJsonChartData(['2', '3', '4', '5', '6+'], [res.keyShotHistogramP1Wins, res.keyShotHistogramP2Wins]);
    this.keyChart.plotData(keyData);

    const fishData = this.getJsonFishgridData(res.p1WinningPointsFishGrid, res.p2WinningPointsFishGrid, res.maxFishGridPoints);
    this.fishgrid.plotData(fishData);
  }

  private initCharts(): void {
    this.strokeChart = new BarChart(['P1', 'P2', 'P1`', 'P2`'], ['Backhands', 'Forehands'], StatPanelWidth, 190, true, 'stroke-container');
    this.outcomeChart = new BarChart(['P1', 'P2', 'P1`', 'P2`'], ['Winners', 'Errors'], StatPanelWidth, 190, false, 'outcome-container');
    this.serveChart = new BarChart(['P1-1', 'P1-2', 'P2-1', 'P2-2', 'P1-1`', 'P1-2`', 'P2-1`', 'P2-2`'], ['Ad', 'Deuce'], StatPanelWidth, 190, true, 'serve-container');
    this.lengthChart = new BarChart(['S', 'R', '3', '4', '5-8', '9+'], [], StatPanelWidth, 190, true, 'length-container');
    this.reverseChart = new BarChart(['<-3', '-3', '-2', '-1', '0'], [], StatPanelWidth, 190, true, 'reverse-container');
    this.keyChart = new BarChart(['2', '3', '4', '5', '6+'], [], StatPanelWidth, 190, true, 'key-container');

    this.fishgrid = new FishGrid(FishGridWidth, FishGridHeight, 'fish-container');
  }

  private initStatisticsBlocks(): void {
  	this.blocks.forEach(n => this.statisticsBlocks.push({ id: n.name.replace(/ /g, ''), name: n.name, container: n.container, active: true }));
  }

  private getJsonChartData(keys, data): any {
    let transformedData = [];

    // const keys = ['P1', 'P2', 'P1`', 'P2`'];
    data[0].forEach((d, i) => {
      let elem = {};
      elem['key'] = keys[i];

      elem['values'] = Array<number>();
      data.forEach(l => elem['values'].push(l[i]));

      transformedData.push(elem);
    });

    // let transformedData = [{key: "P1", values: [86, 64]}, {key: "P2", values: [80, 128]}, {key: "P1`", values: [20, 104]}, {key: "P2`", values: [76, 58]}];
    // let transformedData = [{key: "P1", values: [86]}, {key: "P2", values: [128]}, {key: "P1`", values: [104]}, {key: "P2`", values: [76]}];
    // let transformedData = [{key: "P1-1", values: [86, 64]}, {key: "P1-2", values: [80, 128]}, {key: "P2-1", values: [20, 104]}, {key: "P2-2", values: [76, 58]}, {key: "P1-1`", values: [86, 64]}, {key: "P1-2`", values: [80, 128]}, {key: "P2-1`", values: [20, 104]}, {key: "P2-2`", values: [76, 58]}];
    // let transformedData = [{key: "S", values: [86, 64]}, {key: "R", values: [80, 128]}, {key: "3", values: [20, 104]}, {key: "4", values: [76, 58]}, {key: "5-8", values: [86, 64]}, {key: "9+", values: [80, 128]}];
    // let transformedData = [{key: "<-3", values: [86, 64]}, {key: "-3", values: [80, 128]}, {key: "-2", values: [20, 104]}, {key: "-1", values: [76, 58]}, {key: "0", values: [86, 64]}];
    // let transformedData = [{key: "2", values: [86, 64]}, {key: "3", values: [80, 128]}, {key: "4", values: [20, 104]}, {key: "5", values: [76, 58]}, {key: "6+", values: [86, 64]}];
    return transformedData;
  }

  private getJsonFishgridData(p1Data, p2Data, maxNumber): any {
    let transformedData = [];

    p1Data.forEach((d, i) => {
      d.forEach((l, j) => {
        let elem = {};
        elem['score'] = [i, j];
        elem['values'] = [l, p2Data[i][j]];
        elem['ratio'] = (l + p2Data[i][j]) / maxNumber;

        transformedData.push(elem);
      });
    });

    // let fishgridData = [{score: [0, 0], values: [4, 1], ratio: 1},]
    return transformedData;
  }


  closeBlockClick(block): void {
  	block.active = false;
  }

  checkBoxChangeClick(block): void {
  	block.active = !block.active;
  }

  toggleSettingsWindow(): void {
  	if (this.settingsWindowActive) this.settingsWindowActive = false;
  	else this.settingsWindowActive = true;
  }

  // https://material.angular.io/cdk/drag-drop/overview
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.statisticsBlocks, event.previousIndex, event.currentIndex);
  }

}
