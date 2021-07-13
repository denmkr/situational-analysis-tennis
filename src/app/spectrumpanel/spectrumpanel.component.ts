import { Component, OnInit } from '@angular/core';
import { HistogramBar } from '../interfaces/HistogramBar';
import { SpectrumPanel } from '../interfaces/SpectrumPanel';

import * as d3 from 'd3';

import { DataService } from '../data.service';

@Component({
  selector: 'app-spectrumpanel',
  templateUrl: './spectrumpanel.component.html',
  styleUrls: ['./spectrumpanel.component.less']
})
export class SpectrumpanelComponent implements OnInit {
  private dataBars = [];
  private maxHeightPercentage; // max % of totasl points represented by any one bar
  private nbins = 20;

  width = 300;
  leftMargin = 30;
  rightMargin = 33;
  gaugeWidth = this.width - this.rightMargin;
  container: any;
  splitView: boolean = false;

  private color = this.getColorMap();
  splitButtonColor = 'rgb(240, 240, 240)';

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  updateData(matchId): void {
    this.dataService.getHistogramData(matchId).subscribe((data: SpectrumPanel) => {
      this.dataBars = data.histogramBars;
      this.maxHeightPercentage = data.maxBarHeightPercentage;
      this.updateVis();
    });
  }

  private updateVis(): void {
  	const container = d3.select('#spectrum');
    container.selectAll('*').remove(); // Remove last values

  	const data = this.dataBars;
  	const scalef = d3.scaleLinear().domain([0, this.maxHeightPercentage * 1.3]).range([0, 70]);
  	const sel = container.selectAll('rect').data(data);
  	const binwidth = this.gaugeWidth / this.nbins;
  	const xOffset = 3;

  	// now draw gray dotted lines every 10% above and below the line (behind graphics)
  	const numIntervals = Math.ceil(this.maxHeightPercentage * 10);
  	const dashArray = '3,1';
  	let lineColor = 'gray';

  	for (let i = -numIntervals; i < numIntervals; i++) {
  		if (i !== 0) {
  		  container.append('line')
  		    .attr('x1', -xOffset)
  		    .attr('y1', -scalef(i / 10))
  		    .attr('x2', this.gaugeWidth - xOffset)
  		    .attr('y2', -scalef(i / 10))
  		    .attr('stroke-dasharray', dashArray)
  		    .attr('stroke-width', '1px')
  		    .attr('stroke', lineColor);
  		  container.append('text')
  		    .attr('x', this.gaugeWidth)
  		    .attr('y', -scalef(i / 10) + 3)
  		    .attr('font-family', 'verdana')
  		    .attr('font-size', '12px')
  		    .attr('fill', lineColor)
  		    .text(Math.abs(i) * 10);
  		}

  		container.append('text')
  		  .attr('x', -28)
  		  .attr('y', this.gaugeWidth + 28 )
  		  //.attr('font-family', 'verdana')
  		  .attr('font-size', '12px')
  		  .attr('fill', lineColor)
  		  .attr('transform', 'rotate(-90)')
  		  .text('% points');
  	}

  	const rect = sel.join('rect');
  	rect.attr('height', d => scalef(d.barHeightPercentage))
  	  .attr('width', binwidth)
  	  .attr('fill', (d, i) => this.color(i / this.nbins))
  	  .attr('stroke', 'black')
  	  .classed('transition', true);
  	  // .attr('transform', (d, i) => `translate(` + i * binwidth + `,` - scalef(d.barHeightPercentage) + `)`)

  	if (this.splitView) rect.attr('transform', (d, i) => `translate(` + (i * binwidth - xOffset) + `,` + (-scalef((1 - d.dividingLinePercentage) * d.barHeightPercentage)) + `)`)
  	else rect.attr('transform', (d, i) => `translate(` + (i * binwidth - xOffset) + `,` + (-scalef(d.barHeightPercentage)) + `)`)

  	// now draw black solid line as the baselineline (in front of graphics)
  	lineColor = 'black';
  	container.append('line')
  	  .attr('x1', -xOffset)
  	  .attr('y1', 0)
  	  .attr('x2', this.gaugeWidth - xOffset)
  	  .attr('y2', 0)
  	  .attr('stroke-width', '1px')
  	  .attr('stroke', lineColor);

  	this.container = container;

  	// now draw the split view of the circle button
  	container.append('g').attr('id', 'splitButtonGroup');
  	this.drawSplitButton();
  }

  private getColorMap(): (_: number) => string {
    const stops = [[223, 54, 40], [255, 255, 255], [6, 168, 92]];
    const jetrgb = stops.map(x => d3.rgb.apply(null, x.map(y => y)) as string);
    return d3.piecewise(d3.interpolateRgb, jetrgb);
  }

  private updateRectangles(): void {
  	const sel = this.container.selectAll('rect').data(this.dataBars);
  	const rect = sel.join('rect');

  	const binwidth = this.gaugeWidth / this.nbins;
	  const xOffset = 3;
	  const scalef = d3.scaleLinear().domain([0, this.maxHeightPercentage * 1.3]).range([0, 70]);

  	if (this.splitView) rect.transition().duration(200).attr('transform', (d, i) => `translate(` + (i * binwidth - xOffset) + `,` + (-scalef((1 - d.dividingLinePercentage) * d.barHeightPercentage)) + `)`)
	  else rect.transition().duration(200).attr('transform', (d, i) => `translate(` + (i * binwidth - xOffset) + `,` + (-scalef(d.barHeightPercentage)) + `)`)
  }

  private onCircleClick(): void {
  	this.splitView = !this.splitView;
  	this.drawSplitButton();

  	this.updateRectangles();
  }

  private drawSplitButton(): void {
  	const container = this.container.select('#splitButtonGroup');
  	const splitView = this.splitView;

  	container.selectAll('*').remove();

    container.append('circle')
      .attr('cx', -24)
      .attr('cy', 0)
      .style('stroke', 'black')
      .style('fill', this.splitButtonColor)
      .attr('r', 14);

    if (splitView) {
      container.append('text')
        .attr('x', -28)
        .attr('y', -2)
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .attr('fill', 'orange')
        .text('2');

      container.append('text')
        .attr('x', -28)
        .attr('y', 10)
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .attr('fill', 'steelblue')
        .text('1');

      container.append('line')
        .attr('x1', -28)
        .attr('y1', 0)
        .attr('x2', -20)
        .attr('y2', 0)
        .attr('stroke-width', '1px')
        .attr('stroke', 'black');
    }
    else {
      container.append('text')
        .attr('x', -36)
        .attr('y', 4)
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .attr('fill', 'steelblue')
        .text('1');

      container.append('text')
        .attr('x', -20)
        .attr('y', 4)
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .attr('fill', 'orange')
        .text('2');

      container.append('text')
        .attr('x', -28)
        .attr('y', 3)
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text('+');
    }

    // Transparent circle for click action
    container.append('circle')
      .attr('cx', -24)
      .attr('cy', 0)
      .style('stroke', 'black')
      .style('fill', 'transparent')
      .style('cursor', 'pointer')
      .attr('r', 14)
      .on('click', () => this.onCircleClick());
  }
}
