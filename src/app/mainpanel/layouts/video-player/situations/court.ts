import * as d3 from 'd3';

export class Court {
  svg: any;
  xScale: any;
  yScale: any;
  sizeScale: any;

  width: number;
  container: any;

  constructor(w, container)
  constructor(w?, container?) {
    this.container = container;
  	this.createChart(w);
  }

  createChart(w) {
    // Set the dimensions and margins of the court
    const margin = {top: 120, right: 120, bottom: 120, left: 120},
      width = w - margin.left - margin.right;

    const viewbox = [0 - margin.left, -margin.top, 360 + margin.right + margin.left, 780 + margin.bottom + margin.top];

    let svg: any = d3.select(this.container)
      .append('svg')
        .classed('court-svg', true)
        .attr('viewBox', viewbox.toString())
        .attr('width', width + margin.left + margin.right);

    this.createGrid(svg);

    let x = d3.scaleBand().range([0, viewbox[3] + viewbox[0]]);
    let y = d3.scaleBand().range([0, viewbox[3] + viewbox[0]]);
    let size = d3.scaleLinear().range([3, (viewbox[3] + viewbox[0]) / 10]);

    this.svg = svg;
    this.xScale = x;
    this.yScale = y;
    this.sizeScale = size;
    this.width = width;
  }

  createGrid(svg) {
    let grid = svg.append('g').attr('id', 'court-grid');
          
    let gridPoints = [{d: 'M 45,0 315,0', class: 'common-line vertical-line'}, {d: 'm 45,777 270,0', class: 'common-line vertical-line'},
    {d: 'M 45,180 315,180', class: 'full-line'}, {d: 'M 45,600 315,600', class: 'full-line'}, 
    {d: 'm 45,0 0,777', class: 'common-line'}, {d: 'm 315,0 0,777', class: 'common-line'},
    {d: 'M 0,0 45,0', class: 'full-line'}, {d:'M 315,0 360,0', class: 'full-line'}, {d:'m 0,390 45,0', class: 'full-line'}, {d:'m 315,390 45,0', class: 'full-line'}, {d:'m 0,777 45,0', class: 'full-line'}, {d:'m 315,777 45,0', class: 'full-line'},
    {d: 'm 0,0 0,777', class: 'full-line'}, {d:'m 360,0 0,777', class: 'full-line'}, {d:'m 180,180 0,420', class: 'full-line'}, 
    {d: 'm 45,390 270,0', class: 'full-line'},
    {d: 'M 180,0 180,10', class: 'full-line'}, {d: 'M 180,767 180,777', class: 'full-line'}];

  	grid.append('g').selectAll()
  	  .data(gridPoints).enter().append('path')
  	    .attr('d', d => d.d)
  	    .attr('class', d => d.class)
          .style('fill', '#333')
          .style('fill-rule', 'evenodd')
          .style('stroke', '#333')
          .style('stroke-width', '6')
          .style('stroke-linecap', 'butt')
          .style('stroke-linejoin', 'miter')
          .style('stroke-opacity', '1');
  }

  plotData(x1, y1, x2, y2, background, circleSize, borderColor) {
  	let scaleGroup = this.svg.append('g').classed('scale', true);
  	let nonScaleGroup = this.svg.append('g').classed('non-scale', true);

    scaleGroup.append('rect')
      .attr('id', 'background')
      .attr('x', 45)
      .attr('y', 0)
      .attr('width', 270)
      .attr('height', 780)
      .attr('opacity', 0)
      .attr('fill', background);

  	scaleGroup.append('rect')
  	  .attr('x', x1)
  	  .attr('y', y1)
  	  .attr('width', 40)
  	  .attr('height', 40)
  	  .attr('fill', 'steelblue');

  	scaleGroup.append('rect')
  	  .attr('x', x2)
  	  .attr('y', y2)
  	  .attr('width', 40)
  	  .attr('height', 40)
  	  .attr('fill', 'orange');

  	nonScaleGroup.append('circle')
  	  .attr('cx', 180)
  	  .attr('cy', 390)
  	  .attr('r', circleSize)
  	  .attr('fill', 'gray')
  	  .attr('fill-opacity', '0.6')
  	  .attr('class', 'non-scale');

    this.svg.style('border', `2px solid ${borderColor}`);
  }

  disableSmallView() {
  	this.svg.classed("small-size", false);
  }

  enableSmallView() {
    this.svg.classed("small-size", true);
  }
}