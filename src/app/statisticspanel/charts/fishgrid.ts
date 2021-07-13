import * as d3 from 'd3';

export class FishGrid {

  svg: any;
  xScale: any;
  yScale: any;
  sizeScale: any;

  width: number;
  height: number;
  container: string;

  constructor(w, h, container) {
    this.createChart(w, h, container);
  }

  createChart(w, h, container) {
    // set the dimensions and margins of the graph
    const margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

    const viewbox = [-50, -50, 300, 300];

    this.width = width;
    this.height = height;
    this.container = container;

    let svg: any = d3.select(`#${container}`)
      .append('svg')
        .attr('viewBox', viewbox.toString())
        .style('transform-origin', 'center')
        .style('transform', 'rotate(-45deg)')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        //.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.createGrid(svg);

    let x = d3.scaleBand().range([0, viewbox[3] + viewbox[0]]);
    let y = d3.scaleBand().range([0, viewbox[3] + viewbox[0]]);
    let size = d3.scaleLinear().range([3, (viewbox[3] + viewbox[0]) / 10]);

    this.addLabels(svg, viewbox);
    
    svg = svg.append('g').classed('plot', true)
      .attr('transform', 'translate(' + (viewbox[3] + viewbox[0]) / 10 + ',' + (viewbox[3] + viewbox[0]) / 10 + ')');

    this.svg = svg;
    this.xScale = x;
    this.yScale = y;
    this.sizeScale = size;
  }

  createGrid(svg) {
    let grid = svg.append('g').attr('id', 'grid');
          
    let gridPoints = ['M 0,0 200,0', 'm 0,50 200,0', 'm 0,100 200,0', 'm 0,150 250,0', 
      'm 0,200 250,0', 'M 0,0 0,200', 'm 50,0 0,200', 'm 100,0 0,200', 
      'm 150,0 0,250', 'm 200,0 0,250', 'm 250,150 0,50', 'm 150,250 50,0']

    gridPoints.forEach(d => {
      grid.append('path').attr('d', d)
        .style('fill', '#999')
        .style('fill-rule', 'evenodd')
        .style('stroke', '#999')
        .style('stroke-width', '1')
        .style('stroke-linecap', 'butt')
        .style('stroke-linejoin', 'miter')
        .style('stroke-opacity', '1');
    });
  }

  addLabels(svg, viewbox) {
    const scores = ['0', '15', '30', '40'];

    let x = d3.scaleBand().range([0, viewbox[3] + (viewbox[0] * 2)]).domain(scores);

    let scoreLabels = svg.append('g').attr('id', 'scores');

    scoreLabels.append('g')
      .attr('transform', 'translate(' + (viewbox[3] + viewbox[0]) / 10 + ',' + (viewbox[3] + viewbox[0]) / 10 + ')')
      .selectAll().data(scores)
      .enter().append('g').attr('transform', d => `translate(-50, ${x(d)})`)
        .append('text')
        .style('transform', 'rotate(45deg)')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(d => d);

    scoreLabels.append('g')
      .attr('transform', 'translate(' + (viewbox[3] + viewbox[0]) / 10 + ',' + (viewbox[3] + viewbox[0]) / 10 + ')')
      .selectAll().data(scores)
      .enter().append('g').attr('transform', d => `translate(${x(d)}, -40)`)
        .append('text')
        .style('transform', 'rotate(45deg)')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(d => d);
  }

  plotData(data) {
    this.svg.selectAll('*').remove();

    let svg = this.svg;
    let xScale = this.xScale;
    let yScale = this.yScale;
    let sizeScale = this.sizeScale;

    const width = this.width;
    const height = this.height;

    // Scale the range of the data in the domains
    xScale.domain([0, 1, 2, 3, 4]);
    yScale.domain([0, 1, 2, 3, 4]);
    sizeScale.domain([0, Math.sqrt(Math.PI * Math.pow(1, 2))]);

    if (!isNaN(data[0].ratio)) {
      svg.selectAll().data(data)
        .enter().append(d => {
          const area = Math.sqrt(Math.PI * Math.pow(d.ratio, 2));
          return this.getPieChart(d.values, sizeScale(area));
        })
        .attr('transform', d => `translate(${xScale(d.score[0])}, ${yScale(d.score[1])})`);
    }
  }

  getPieChart(data, r) {
    let width = r * 2,
      height = r * 2,
      radius = r

    let color = d3.scaleOrdinal().range(['blue', 'orange']);

    let arc: any = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

    let labelArc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius);

    let pie = d3.pie()
      .sort(null)
      .value((d: any) => d);

    let svg = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
      .attr('width', width)
      .attr('height', height)
    .append('g');

    let g: any = svg.selectAll('.arc')
      .data(pie(data))
    .enter().append('g')
      .attr('class', 'arc')
      .style('transform', 'rotate(45deg)');

    g.append('path')
      .attr('d', arc)
      .attr("class", function(d: any) { return d3.select(this).attr("class") + " " + color(d.data); });
      //.style('fill', (d: any) => color(d.data));

    return svg.node();
  }

}
