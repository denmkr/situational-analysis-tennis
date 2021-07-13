import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-winbar',
  templateUrl: './winbar.component.html',
  styleUrls: ['./winbar.component.less']
})
export class WinbarComponent implements OnInit {

  private container = null;
  width = 300;
  private leftMargin = 30;
  private rightMargin = 0;
  gaugeWidth = this.width - (this.leftMargin + this.rightMargin);
  private barheight = 17;
  private innerticks = 10;
  private tickpadding = 4;

  constructor() { }

  ngOnInit(): void {
    this.container = d3.select('#winbar');

    const tickdata = [];
    const stepwidth = this.gaugeWidth / this.innerticks;

    for (let i = stepwidth; i < this.gaugeWidth; i += stepwidth ) {
      tickdata.push(i);
    }

    this.container.select('g').selectAll('.tick').data(tickdata).join('line')
      .classed('tick', true)
      .attr('x1', d => d)
      .attr('x2', d => d)
      .attr('y1', this.tickpadding)
      .attr('y2', this.barheight - this.tickpadding)
      .attr('stroke', 'black');

    // add in the 0 and the 100 labels
    this.container.select('g').append('text')
      .attr('x', -15)
      .attr('y', 15)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '16px')
      .text('0');
    this.container.select('g').append('text')
      .attr('x', this.gaugeWidth + 5)
      .attr('y', 15)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '16px')
      .text('100');

    // this.updateWinningRatio(.5); // TODO:  Replace with real code
  }

  updateWinningRatio(ratio: number): void {
    console.log(ratio);
    const x = ratio * this.gaugeWidth;
    this.container.select('#indicator')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', -this.tickpadding)
      .attr('y2', this.barheight + this.tickpadding)
      .attr('stroke-width', 2);
  }

}
