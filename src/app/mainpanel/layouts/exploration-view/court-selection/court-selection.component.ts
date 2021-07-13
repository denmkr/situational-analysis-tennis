import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataService } from '../../../../data.service';

import * as d3 from 'd3';

@Component({
  selector: 'app-court-selection',
  templateUrl: './court-selection.component.html',
  styleUrls: ['./court-selection.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CourtSelectionComponent implements OnInit {
  @Output() onCustomSituationAdd = new EventEmitter<any>();

  @ViewChild('p1CheckBoxPanel', { static: true }) p1CheckBoxPanel: ElementRef;
  @ViewChild('p2CheckBoxPanel', { static: true }) p2CheckBoxPanel: ElementRef;
  @ViewChild('addPanel', { static: true }) addPanel: ElementRef;
  
  @ViewChild('ballCheckBoxPanel', { static: true }) ballCheckBoxPanel: ElementRef;

  p1ShotsShown: boolean = true;
  matchId: string;

  p1Check: boolean = true;
  p2Check: boolean = true;
  ballCheck: boolean = true;

  ballPositionsGroup: any;
  filteredBallPositionsGroup: any;
  filteredP1PositionsGroup: any;
  filteredP2PositionsGroup: any;
  p1PositionsGroup: any;
  p2PositionsGroup: any;

  scoresDict: any = {};
  
  p1SelectedData = [];
  p2SelectedData = [];
  ballSelectedData = [];
  finalSelectedData = [];

  prevP1SelectedData = [];
  prevP2SelectedData = [];
  prevBallSelectedData = [];

  selectedCustomSituation: any = null;

  p1S: any;
  p2S: any;
  ballS: any;

  toCh: boolean = true;

  data = [];

  xScale: any;
  yScale: any;

  p1Brush: any;
  p2Brush: any;
  ballBrush: any;

  p1BrushSelection: any;
  p2BrushSelection: any;
  ballBrushSelection: any;

  win: number = 0;
  lose: number = 0;

  // Visualization size
  visWidth = 350;

  // Constant court svg viewbox values
  svgViewBox: any = {x: 568, y: 400};

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.setupPlot();
    this.initSelection();
  }

  checkP1Change() {
  	this.p1PositionsGroup.classed('hide', !this.p1PositionsGroup.classed("hide"));
  	this.filteredP1PositionsGroup.classed('hide', !this.filteredP1PositionsGroup.classed("hide"));
  	this.p1PositionsGroup.select('g.brush').call(this.p1Brush.move, [[this.svgViewBox.x / 2 + 120, this.svgViewBox.y - 90], [this.svgViewBox.x / 2 + 180, this.svgViewBox.y - 30]]);

  	this.p2PositionsGroup.select('g.brush').call(this.p2Brush.move, this.p2BrushSelection);
    this.ballPositionsGroup.select('g.brush').call(this.ballBrush.move, this.ballBrushSelection);
  }

  checkP2Change() {
  	this.p2PositionsGroup.classed('hide', !this.p2PositionsGroup.classed("hide"));
  	this.filteredP2PositionsGroup.classed('hide', !this.filteredP2PositionsGroup.classed("hide"));
  	this.p2PositionsGroup.select('g.brush').call(this.p2Brush.move, [[this.svgViewBox.x / 2 - 180, this.svgViewBox.y - 90], [this.svgViewBox.x / 2 - 120, this.svgViewBox.y - 30]]);

  	this.p1PositionsGroup.select('g.brush').call(this.p1Brush.move, this.p1BrushSelection);
    this.ballPositionsGroup.select('g.brush').call(this.ballBrush.move, this.ballBrushSelection);
  }

  /*
  checkBallChange() {
  	this.ballPositionsGroup.classed('hide', !this.ballPositionsGroup.classed("hide"));
  	this.filteredBallPositionsGroup.classed('hide', !this.filteredBallPositionsGroup.classed("hide"));
  	this.ballPositionsGroup.select('g.brush').call(this.ballBrush.move, [[this.svgViewBox.x / 2 - 30, this.svgViewBox.y - 90], [this.svgViewBox.x / 2 + 30, this.svgViewBox.y - 30]]);

  	this.p1PositionsGroup.select('g.brush').call(this.p1Brush.move, this.p1BrushSelection);
    this.p2PositionsGroup.select('g.brush').call(this.p2Brush.move, this.p2BrushSelection);
  }
  */

  updateData(data) {
    this.showShotsForPlayer('1');
    this.p1ShotsShown = true;
    this.matchId = data;
  }

  showShotsForPlayer(hittingPlayer: string) {
    this.dataService.getShots(this.matchId, hittingPlayer).subscribe(shots => {
      /*
      let shots = [];
      points.forEach(p => p.shots.forEach(s => {
        if (s.hittingplayer === 1) {
          s['player1StartingPointCount'] = p.player1StartingPointCount;
          s['player2StartingPointCount'] = p.player2StartingPointCount;
          shots.push(s);
        }
      }));
      */

      this.data = shots;

      let scoresDict = {};
      let scoresData = d3.nest()
        //.key((d: any) => d.player1StartingPointCount + ' ' + d.player2StartingPointCount)
        //.sortKeys(d3.ascending) // P1, P2 ...
        .key((d: any) => d.winningPlayer)
        .sortKeys(d3.ascending) // P1, P2 ...
        .key((d: any) => d.matchid + ' ' + d.setsequencenumber + ' ' + d.gamesequencenumber + ' ' + d.pointsequencenumber)
        .entries(shots);

      scoresData.forEach(d => {
        let total = 0;

        d.values.forEach(v => {
          total += v.values.length;
        });

        scoresDict[d.key] = total
      });

      if (this.toCh) {
        this.scoresDict = scoresDict;
        this.toCh = false;
      }

      this.plotBallPositions(shots);
      this.plotPlayerOnePositions(shots);
      this.plotPlayerTwoPositions(shots);

      this.p1PositionsGroup.select('g.brush').call(this.p1Brush.move, this.p1BrushSelection);
      this.p2PositionsGroup.select('g.brush').call(this.p2Brush.move, this.p2BrushSelection);
    });
  }

  initSelection() {
    /* Create separate brushes for player and ball positions */
    this.p1Brush = d3.brush()
      .extent([[this.svgViewBox.x / 2, 0], [this.svgViewBox.x, this.svgViewBox.y]])
    this.p2Brush = d3.brush()
      .extent([[0, 0], [this.svgViewBox.x / 2, this.svgViewBox.y]])

    /* Create brush elements */
    let p1BrushEl = this.p1PositionsGroup.append('g').attr('class', 'brush');
    let p2BrushEl = this.p2PositionsGroup.append('g').attr('class', 'brush');

    /* Selection box panels */
    const p1Box = this.p1PositionsGroup.select('g.brush').append('rect')
      .classed('box-panel', true)
      .classed('p1', true)
      .attr('x', this.svgViewBox.x / 2 + 90)
      .attr('y', this.svgViewBox.y - 120)
    
    const p2Box = this.p2PositionsGroup.select('g.brush').append('rect')
      .classed('box-panel', true)
      .classed('p2', true)
      .attr('x', this.svgViewBox.x / 2 - 210)
      .attr('y', this.svgViewBox.y - 120)

    this.p1CheckBoxPanel.nativeElement.style.left = `${p1Box.node().getBoundingClientRect().x - 120}px`;
    this.p2CheckBoxPanel.nativeElement.style.left = `${p2Box.node().getBoundingClientRect().x - 120}px`;

    p1BrushEl.call(this.p1Brush);
    p2BrushEl.call(this.p2Brush);

    p1BrushEl.selectAll('.overlay').remove();
    p2BrushEl.selectAll('.overlay').remove();

    this.p1Brush.on('end', () => {
      this.p1BrushSelection = d3.event.selection;

      /* Update statistics */
      let selectedData = this.finalSelectedData;  
      if (selectedData.length === 0) selectedData = this.data;
    
      if (this.p1BrushSelection !== undefined && this.p2BrushSelection !== undefined) {
        let p1x1 = -100;
        let p1y1 = -100;
        let p1x2 = 100;
        let p1y2 = 39;

        if (this.p1SelectedData.length != 0) {
          p1x1 = this.xScale.invert(this.p1BrushSelection[0][0]);
          p1y1 = this.yScale.invert(this.p1BrushSelection[1][1])
          p1x2 = this.xScale.invert(this.p1BrushSelection[1][0]);
          p1y2 = this.yScale.invert(this.p1BrushSelection[0][1])
        }

        let p2x1 = -100;
        let p2y1 = 39;
        let p2x2 = 100;
        let p2y2 = 100;
        
        if (this.p2SelectedData.length != 0) {
          p2x1 = this.xScale.invert(this.p2BrushSelection[0][0]);
          p2y1 = this.yScale.invert(this.p2BrushSelection[1][1])
          p2x2 = this.xScale.invert(this.p2BrushSelection[1][0]);
          p2y2 = this.yScale.invert(this.p2BrushSelection[0][1])
        }

        if (this.p2SelectedData.length != 0 && this.p1SelectedData.length != 0) {
          this.dataService.getCustomSituation(this.matchId, this.p1ShotsShown ? '1' : '2', p1y1, p1x1, p1y2, p1x2, p2y1, p2x1, p2y2, p2x2).subscribe(res => {
            console.log(res);
            this.selectedCustomSituation = res;
          });
        }
        else this.selectedCustomSituation = null;
      }
    });

    this.p2Brush.on('end', () => {
      this.p2BrushSelection = d3.event.selection;

      /* Update statistics */
      let selectedData = this.finalSelectedData;  
      if (selectedData.length === 0) selectedData = this.data;
    
      //if (selectedData.length > 0) this.selectedDataChanged.emit([selectedData, this.scoresDict]);
      if (this.p1BrushSelection !== undefined && this.p2BrushSelection !== undefined) {
        let p1x1 = -100;
        let p1y1 = -100;
        let p1x2 = 100;
        let p1y2 = 39;

        if (this.p1SelectedData.length != 0) {
          p1x1 = this.xScale.invert(this.p1BrushSelection[0][0]);
          p1y1 = this.yScale.invert(this.p1BrushSelection[1][1])
          p1x2 = this.xScale.invert(this.p1BrushSelection[1][0]);
          p1y2 = this.yScale.invert(this.p1BrushSelection[0][1])
        }

        let p2x1 = -100;
        let p2y1 = 39;
        let p2x2 = 100;
        let p2y2 = 100;
        
        if (this.p2SelectedData.length != 0) {
          p2x1 = this.xScale.invert(this.p2BrushSelection[0][0]);
          p2y1 = this.yScale.invert(this.p2BrushSelection[1][1])
          p2x2 = this.xScale.invert(this.p2BrushSelection[1][0]);
          p2y2 = this.yScale.invert(this.p2BrushSelection[0][1])
        }

        if (this.p2SelectedData.length != 0 && this.p1SelectedData.length != 0) {
          this.dataService.getCustomSituation(this.matchId, this.p1ShotsShown ? '1' : '2', p1y1, p1x1, p1y2, p1x2, p2y1, p2x1, p2y2, p2x2).subscribe(res => {
            console.log(res);
            this.selectedCustomSituation = res;
          });
        }
        else this.selectedCustomSituation = null;
        
      }
    });

    this.p1Brush.on('brush', () => {
  	  const s = d3.event.selection;
  	  this.p1S = s;

  	  if (s === null && s === undefined)
        return false;

      let p1SelectedData = [];

  	  this.p1PositionsGroup.selectAll('.position')
  	    .classed('selected', false)
  	    .filter(function(d) {
  	      const x = d3.select(this).attr('x');
  	      const y = d3.select(this).attr('y');

  	      if (x >= s[0][0] && x <= s[1][0] && y >= s[0][1] && y <= s[1][1]) {
  	        d.values.forEach((v) => p1SelectedData.push(v));
  	      }
      	});

      if (this.p2SelectedData.length === 0 && this.ballSelectedData.length === 0) this.highlightSelectedData(s, this.p1PositionsGroup, false);
	    else this.highlightSelectedData(s, this.filteredP1PositionsGroup, false);

  	  if (!this.arraysEqual(p1SelectedData, this.prevP1SelectedData) || p1SelectedData.length === 0) {
        this.p1SelectedData = p1SelectedData;
        const selectedData = this.calculateSelectedData(this.p1SelectedData, this.ballSelectedData, this.p2SelectedData);
        this.finalSelectedData = selectedData[0];

        /* Change selections */
        this.plotFilteredBallPositions([selectedData[0], selectedData[1]]);
  	    this.plotFilteredP2Positions([selectedData[0], selectedData[2]]);

  	  	if (this.p1SelectedData.length === 0 && this.p2SelectedData.length === 0 && this.ballSelectedData.length === 0) {
      	  this.p1PositionsGroup.selectAll('.position').classed('selected', true);
      	  this.p2PositionsGroup.selectAll('.position').classed('selected', true);
      	  this.ballPositionsGroup.selectAll('.position').classed('selected', true);
        }

  	    if (this.p1SelectedData.length > 0) this.p1PositionsGroup.select('g.brush .selection').classed('disable', false);
        else this.p1PositionsGroup.select('g.brush .selection').classed('disable', true);

        this.prevP1SelectedData = p1SelectedData;

        if (p1SelectedData.length === 0) this.filteredP1PositionsGroup.selectAll('.position').classed('selected', true);
      }
  	});


    this.p2Brush.on('brush', () => {
      const s = d3.event.selection;
      this.p2S = s;

      if (s === null && s === undefined)
        return false;

      let p2SelectedData = [];

  	  this.p2PositionsGroup.selectAll('.position')
        .classed('selected', false)
        .filter(function(d) {
          const x = d3.select(this).attr('x');
          const y = d3.select(this).attr('y');

          if (x >= s[0][0] && x <= s[1][0] && y >= s[0][1] && y <= s[1][1]) {
            d.values.forEach((v) => p2SelectedData.push(v) );
          }
        });

      if (this.p1SelectedData.length === 0 && this.ballSelectedData.length === 0) this.highlightSelectedData(s, this.p2PositionsGroup, false);
  	  else this.highlightSelectedData(s, this.filteredP2PositionsGroup, false);

  	  if (!this.arraysEqual(p2SelectedData, this.prevP2SelectedData) || p2SelectedData.length === 0) {
      	this.p2SelectedData = p2SelectedData;
      	const selectedData = this.calculateSelectedData(this.p2SelectedData, this.ballSelectedData, this.p1SelectedData);
      	this.finalSelectedData = selectedData[0];

      	this.plotFilteredBallPositions([selectedData[0], selectedData[1]]);
      	this.plotFilteredP1Positions([selectedData[0], selectedData[2]]);

      	if (this.p1SelectedData.length === 0 && this.p2SelectedData.length === 0 && this.ballSelectedData.length === 0) {
      	  this.p1PositionsGroup.selectAll('.position').classed('selected', true);
      	  this.p2PositionsGroup.selectAll('.position').classed('selected', true);
      	  this.ballPositionsGroup.selectAll('.position').classed('selected', true);
      	}

      	if (this.p2SelectedData.length > 0) this.p2PositionsGroup.select('g.brush .selection').classed('disable', false);
      	else this.p2PositionsGroup.select('g.brush .selection').classed('disable', true);

      	this.prevP2SelectedData = p2SelectedData;

        if (p2SelectedData.length === 0) this.filteredP2PositionsGroup.selectAll('.position').classed('selected', true);
  	  }
      
    });

    this.p1PositionsGroup.select('g.brush .selection').classed('disable', true).classed('bordered', true);
    this.p1PositionsGroup.select('g.brush').call(this.p1Brush.move, [[this.svgViewBox.x / 2 + 120, this.svgViewBox.y - 90], [this.svgViewBox.x / 2 + 180, this.svgViewBox.y - 30]]);
  
    this.p2PositionsGroup.select('g.brush .selection').classed('disable', true);
    this.p2PositionsGroup.select('g.brush').call(this.p2Brush.move, [[this.svgViewBox.x / 2 - 180, this.svgViewBox.y - 90], [this.svgViewBox.x / 2 - 120, this.svgViewBox.y - 30]]);
  }

  onAddButtonClick() {
    if (this.selectedCustomSituation !== null) {
      this.onCustomSituationAdd.emit(this.selectedCustomSituation);
    }
  }

  highlightSelectedData(s, group, filter) {
  	const highlighted = group.selectAll('.position')
      .classed('selected', false)
      .filter(function(d) {
      	const domElem = d3.select(this);

      	let x = domElem.attr('x');
        let y = domElem.attr('y');

      	if (!domElem.attr('x')) {
		      x = domElem.attr('cx');
          y = domElem.attr('cy');
      	}

        if (x >= s[0][0] && x <= s[1][0] && y >= s[0][1] && y <= s[1][1]) return true;
        return false;
  	  }).classed('selected', true);
  }

  calculateSelectedData(selectedData, selectedData1, selectedData2) {
  	let combinedSelectedData = selectedData;
  	let selectedForData1 = [];
  	let selectedForData2 = [];

  	/* Multiply all 3 array of selected data (from player and ball selections) */
  	if (combinedSelectedData.length > 0) {
      if (selectedData1.length > 0) combinedSelectedData = combinedSelectedData.filter(x => selectedData1.includes(x));
      if (selectedData2.length > 0) combinedSelectedData = combinedSelectedData.filter(x => selectedData2.includes(x));
    }
  	else {
  	  if (selectedData1.length > 0 && selectedData2.length > 0) combinedSelectedData = selectedData1.filter(x => selectedData2.includes(x));
  	  else {
  	    if (selectedData1.length > 0) combinedSelectedData = selectedData1;
  	    if (selectedData2.length > 0) combinedSelectedData = selectedData2;
  	  }
    }

    // For Data 1
    if (selectedData.length > 0 && selectedData2.length > 0) selectedForData1 = selectedData.filter(x => selectedData2.includes(x));
    else {
      if (selectedData.length > 0) selectedForData1 = selectedData;
      if (selectedData2.length > 0) selectedForData1 = selectedData2;
    }

    // For Data 2
    if (selectedData.length > 0 && selectedData1.length > 0) selectedForData2 = selectedData.filter(x => selectedData1.includes(x));
    else {
      if (selectedData.length > 0) selectedForData2 = selectedData;
      if (selectedData1.length > 0) selectedForData2 = selectedData1;
    }

  	return [combinedSelectedData, selectedForData1, selectedForData2];
  }

  arraysEqual(array1, array2) {
  	return array1.length === array2.length && array1.sort().every(function(value, index) { return value === array2.sort()[index]});
  }

  setupPlot() {
    // Padding for out-of-court positions
    const margin = {x: 50, y: 50};
    this.svgViewBox.x += margin.x * 2;
    this.svgViewBox.y += margin.y * 2;

    // Set size and position for SVG
    //d3.select('#vis').attr('width', this.visWidth);
    d3.select('#vis').attr('viewBox', `0 0 ${this.svgViewBox.x} ${this.svgViewBox.y}`);
    d3.select('#court').attr('transform', `translate(${margin.x},${margin.y})`);

    // Add SVG group for visualizing ball positions
    this.ballPositionsGroup = d3.select('#vis').append('g').attr('id', 'shots');
    // Add SVG group for visualizing player positions
    this.p1PositionsGroup = d3.select('#vis').append('g').attr('id', 'positions-1');
    this.p2PositionsGroup = d3.select('#vis').append('g').attr('id', 'positions-2');

    // Add SVG group for visualizing filtered ball positions
    this.filteredBallPositionsGroup = d3.select('#vis').append('g').attr('id', 'filtered-balls');
    this.filteredP1PositionsGroup = d3.select('#vis').append('g').attr('id', 'filtered-p1');
    this.filteredP2PositionsGroup = d3.select('#vis').append('g').attr('id', 'filtered-p2');

    // Align data points positions and court image
    this.xScale = d3.scaleLinear().range([0 + margin.x, 565 + margin.x]);
    this.yScale = d3.scaleLinear().range([260 - 31.5 + margin.y, 0 + 29.5 + margin.y]);

    // Key positions for court align
    this.xScale.domain([0, 78]);
    this.yScale.domain([0, 27]);

    // d3.select('#group').node() as HTMLElement).getBoundingClientRect();
  }

  getGroupDataByValues(data, [xParam, yParam]) {
  	/* Group data by ballx and bally positions */
    const groupedData = d3.nest()
      .key((d: any) => d[xParam] + ' ' + d[yParam])
      .key((d: any) => d.matchid + ' ' + d.setsequencenumber + ' ' + d.gamesequencenumber + ' ' + d.pointsequencenumber)
      .entries(data);

    groupedData.forEach(d => {
      let p1 = 0;
      let p2 = 0;
      let values = [];

      let x, y;

      d.values.forEach(v => {
        x = v.values[0][xParam];
        y = v.values[0][yParam];

        if (v.values[0].winningPlayer === 1) p1++;
        else p2++;

        v.values.forEach(l => {
          values.push(l);
        });
      });

      d['x'] = x;
      d['y'] = y;
      d['values'] = values;

      d['p1_raw'] = p1;
      d['p2_raw'] = p2;
    });

    return groupedData;
  }

  smoothData(data) {
  	/* Smoothing filters (convolution) - 3x3 kernel */
    let kernel_mean = [
      [1/9,1/9,1/9],
      [1/9,1/9,1/9],
      [1/9,1/9,1/9]
    ];

    let kernel_blur = [
      [1/16,1/8,1/16],
      [1/8,1/4,1/8],
      [1/16,1/8,1/16]
    ];

    data.forEach((d: any) => {
      const x = d.x;
      const y = d.y;

      let p1 = 0;
      let p2 = 0;

      // Calculate neighbor cells numbers (of shots positions)
      for (let i=x-1; i<=x+1; i++) {
        for (let j=y-1; j<=y+1; j++) {
          // Get shots data based on cell number (in 2x2 matrix)
          const shot = data.filter(function(d: any) {
            return d.x === i && d.y === j;
          });

          // If shot exists, calculate new winning and losing values (based on the filter)
          if (shot.length) {
            p1 += shot[0]['p1_raw'] * kernel_mean[x-i+1][y-j+1];
            p2 += shot[0]['p2_raw'] * kernel_mean[x-i+1][y-j+1];
          }
        }
      }

      /* 
        p1 - winning value for Player 1
    		p2 - losing value for Player 1
    		p1prob - probability value of winning by Player 1 (at a certain ball position)
    		count - sum of winning and losing values
      */
      d['p1'] = p1;
      d['p2'] = p2;
      d['p1prob'] = p1 / (p1 + p2);
      d['count'] = p1 + p2;

    });
  }

  plotFilteredBallPositions(dataArray) {
  	/* Clear previous data */
    this.filteredBallPositionsGroup.selectAll('.position').remove();

    let data = dataArray[1];

  	if (data.length > 0) {
  	  this.ballPositionsGroup.selectAll('.position').classed('selected', false);
      //this.ballPositionsGroup.selectAll('.position').classed('filtered', false);

      const groupedData = this.getGroupDataByValues(data, ['ballx', 'bally']);
      this.smoothData(groupedData);

      this.plot(groupedData, true, this.filteredBallPositionsGroup, true);

      //this.highlightSelectedData(this.ballS, this.filteredBallPositionsGroup, true);
      if (this.ballSelectedData.length == 0) this.filteredBallPositionsGroup.selectAll('.position').classed('selected', true);
  	}
  }

  plotFilteredP1Positions(dataArray) {
  	/* Clear previous data */
  	this.filteredP1PositionsGroup.selectAll('.position').remove();

  	let data = dataArray[1];

  	if (data.length > 0) {
  		this.p1PositionsGroup.selectAll('.position').classed('selected', false);

      const groupedData = this.getGroupDataByValues(data, ['p1Startx', 'p1Starty']);
      this.smoothData(groupedData);

      this.plot(groupedData, false, this.filteredP1PositionsGroup, true);

      this.highlightSelectedData(this.p1S, this.filteredP1PositionsGroup, true);
      if (this.p1SelectedData.length == 0) this.filteredP1PositionsGroup.selectAll('.position').classed('selected', true);
  	}
  	else {
  		if (this.finalSelectedData.length > 0) this.highlightSelectedData(this.p1S, this.p1PositionsGroup, true);
  	}
  }

  plotFilteredP2Positions(dataArray) {
  	/* Clear previous data */
    this.filteredP2PositionsGroup.selectAll('.position').remove();

    let data = dataArray[1];

  	if (data.length > 0) {
  		this.p2PositionsGroup.selectAll('.position').classed('selected', false);

      const groupedData = this.getGroupDataByValues(data, ['p2Startx', 'p2Starty']);
      this.smoothData(groupedData);

      this.plot(groupedData, false, this.filteredP2PositionsGroup, true);

      this.highlightSelectedData(this.p2S, this.filteredP2PositionsGroup, true);
      if (this.p2SelectedData.length == 0) this.filteredP2PositionsGroup.selectAll('.position').classed('selected', true);
    }
    else {
    	if (this.finalSelectedData.length > 0) this.highlightSelectedData(this.p2S, this.p2PositionsGroup, true);
    }
  }

  plotBallPositions(data) {
  	/* Clear previous data */
    this.ballPositionsGroup.selectAll('.position').remove();

    const groupedData = this.getGroupDataByValues(data, ['ballx', 'bally']);
	  this.smoothData(groupedData);

    this.plot(groupedData, true, this.ballPositionsGroup, false);
    
  }

  plotPlayerOnePositions(data) {
  	/* Clear previous data */
    this.p1PositionsGroup.selectAll('.position').remove();

    const groupedData = this.getGroupDataByValues(data, ['p1Startx', 'p1Starty']);
	  this.smoothData(groupedData);

    this.plot(groupedData, false, this.p1PositionsGroup, false);
  }

  plotPlayerTwoPositions(data) {
    /* Clear previous data */
    this.p2PositionsGroup.selectAll('.position').remove();

    const groupedData = this.getGroupDataByValues(data, ['p2Startx', 'p2Starty']);
    this.smoothData(groupedData);

    this.plot(groupedData, false, this.p2PositionsGroup, false);
  }

  plot(data, isCircle, group, filtered) {
    /* Set diverging color based on probability */
    const colorGreen = d3.scaleLinear().range([0, 0.8])
      .domain([0, d3.max(data, (d: any) => { if (d.p1prob >= 0.5) return +d.p1prob })]);
    const colorRed = d3.scaleLinear().range([0, 0.8])
      .domain([0, d3.max(data, (d: any) => { if (d.p1prob < 0.5) return (1 - d.p1prob) })]); // * Math.abs(d.p1-d.p2);
    
    /* Set circle radius based on count */
    const radius = d3.scaleLinear().range([1, 5])
      .domain([0, d3.max(data, (d: any) => { return +d.count })]);

    /* Set square size based on count */
    const size = d3.scaleLinear().range([2, 8])
      .domain([0, d3.max(data, (d: any) => { return +d.count })]);

    /*
    // Set opacity based on count for colors (red, yellow, green)
    const opacity = d3.scaleLinear().range([0.15, 1])
      .domain(d3.extent(shotsByBallPos, (d: any) => { if (d.values[0].ballx !== 999) { return d.count; } }));
    
    // Opacity for each color separately
    const opacityRed = d3.scaleLinear().range([0.15, 1])
      .domain([1, d3.max(shotsByBallPos, (d: any) => { if (d.values[0].ballx !== 999 && d.p1prob < 0.4) { return d.count; } })]);
    const opacityYellow = d3.scaleLinear().range([0.15, 1])
      .domain([1, d3.max(shotsByBallPos, (d: any) => { if (d.values[0].ballx !== 999 && (d.p1prob >= 0.4 && d.p1prob <= 0.6)) { return d.count; } })]);
    const opacityGreen = d3.scaleLinear().range([0.15, 1])
      .domain([1, d3.max(shotsByBallPos, (d: any) => { if (d.values[0].ballx !== 999 && d.p1prob > 0.4) { return d.count; } })]);
    */
    
    //let tooltip = d3.select('.tooltip');

    // Shift color scale
    const colorShift = d3.scaleLinear().range([0, 1]).domain([0, 1]); //-0.3, 0.7

	  /* Plot data points */
    if (isCircle) {
	    group.selectAll()
	      .data(data)
	      .enter().append('circle')
	      .attr('cx', d => {
	        const xPos = d.y;
	        return (this.xScale(xPos) + 1); // Align objects with court image
	      })
	      .attr('cy', d => {
	        const yPos = d.x;
	        return (this.yScale(yPos) + 1); // Align objects with court image
	      })
	      .attr('r', d => `${radius(d.count)}px`)
	      .classed('position', true)
	      .classed('ball', true)
	      //.classed('filtered', true)
    }
    // Squares
    else {
	    group.selectAll()
	      .data(data)
	      .enter().append('rect')
	      .attr('x', d => {
	        const xPos = d.y;
	        return (this.xScale(xPos) - size(d.count) / 2 + 1); // Align rectangles with court image // -2
	      })
	      .attr('y', d => {
	        const yPos = d.x;
	        return (this.yScale(yPos) - size(d.count) / 2 + 1); // Align rectangles with court image
	      })
	      .attr('width', d => `${size(d.count)}px`)
	      .attr('height', d => `${size(d.count)}px`)
	      .classed('position', true)
	      .classed('player', true)
	      //.classed('filtered', true);
    }    

    if (filtered) group.selectAll('.position').classed('filtered', true);
      
      // 2. Color + Opacity
      /*
      .attr('fill', d => d3.interpolateRdYlGn(colorShift(d.p1prob)))
      .attr('fill-opacity', d => {
        return opacity(d.count);
      })
      */

      // !!! 3. Color (Probability and Amount) !!!
      /*
      d3.selectAll('.position').attr('fill', (d: any) => {
        if (d.p1prob >= 0.5) return d3.interpolateYlGn(colorGreen(d.p1prob));
        if (isNaN(colorRed(d.p1prob))) return d3.interpolateYlOrRd(colorGreen(1));
        return d3.interpolateYlOrRd(colorRed(1 - d.p1prob));
      })
      */
      // 4. Set color (red, yellow, green) + opacity based on count
 
    group.selectAll('.position')
      .attr('fill', (d: any) => {
        if (d.p1prob < 0.4) return '#ab2e2c';
        if (d.p1prob >= 0.4 && d.p1prob <= 0.6) return '#f0c844';
        if (d.p1prob > 0.6) return '#45994c';
      })

      .attr('stroke-width', 0.5)
      .style('opacity', 0.15) // opacity(d.count)
      .style('transition', 'fill 0.2s')
      .on('click', (d: any) => {
       // this.posClicked.emit(d.values);
      })
      .on('mouseover', (d: any) => {
        /*
        tooltip.style('display', 'block');
        
        this.win = Math.round(d.p1 * 10) / 10; // 1 decimal point
        this.lose = Math.round(d.p2 * 10) / 10;

        tooltip.style('left', d3.event.pageX + 'px');
        const size = (tooltip.node() as HTMLElement).getBoundingClientRect();
        tooltip.style('top', d3.event.pageY - size.height + 'px');
        */
      })
      .on('mouseout', (d: any) => {
        //tooltip.style('display', 'none');
      });
      
  }

  onP1ButtonClick() {
    this.p1ShotsShown = true;

    this.p2PositionsGroup.select('g.brush .selection').classed('bordered', false);
    this.p1PositionsGroup.select('g.brush .selection').classed('bordered', true);

    this.showShotsForPlayer('1');
  }

  onP2ButtonClick() {
    this.p1ShotsShown = false;

    this.p1PositionsGroup.select('g.brush .selection').classed('bordered', false);
    this.p2PositionsGroup.select('g.brush .selection').classed('bordered', true);

    this.showShotsForPlayer('2');
  }

}
