import * as d3 from 'd3';

export class BarChart {

  svg: any;
  xScale: any;
  yScale: any;
  colorScale: any;

  width: number;
  height: number;
  stacked: boolean;
  container: string;

  labels: [];
  subLabels: [];

  constructor(labels, subLabels, w, h, stacked, container)
  constructor(labels?, subLabels?, w?, h?, stacked?, container?) {
    this.stacked = stacked;
    this.labels = labels;
    this.subLabels = subLabels;
    this.container = container;

    this.createChart(w, h, container);
  }

  createChart(w, h, container) {
    // set the dimensions and margins of the graph
    const margin = {top: 20, right: 0, bottom: 40, left: 26},
      width = w - margin.left - margin.right ,
      height = h - margin.top - margin.bottom;

    this.width = width ;
    this.height = height;

    let x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1).align(0.1);
    let y = d3.scaleLinear().rangeRound([height, 0]);
    let color = d3.scaleOrdinal().range(["blue", "orange"]);

    let svg = d3.select(`#${container}`)
      .append('svg')
        .classed('bar-chart', true)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.svg = svg;
    this.xScale = x;
    this.yScale = y;
    this.colorScale = color;
  }

  plotData(data) {
    this.svg.selectAll('*').remove();

    let svg = this.svg;
    let xScale = this.xScale;
    let yScale = this.yScale;
    let colorScale = this.colorScale;

    const width = this.width;
    const height = this.height;
    const stacked = this.stacked;

    const labels = this.labels;
    const sublabels = this.subLabels;

    let keys = [];
    let colorKeys = [];

    // Prepare data
    data.forEach((d, i) => {
      let sum = 0;
      let num = 0;

      colorKeys.push(d.key);

      d.values.forEach(v => {
        d['v' + num] = v;
        if (i === 0) keys.push('v' + num);

        sum += v;
        num++;
      });

      d.total = sum;
    });

    if (data[0].values.length > 1) colorKeys = keys;

    //data.sort(function(a, b) { return b.total - a.total; });

    if (labels) xScale.domain(labels);
    else xScale.domain([data.map((d: any) => d.key)]);

    colorScale.domain(colorKeys);

    if (data[0].values.length === 1) {
      yScale.domain([0, d3.max(data, (d: any) => d.values[0])]).nice();
      this.drawSingleBars(data, svg, xScale, yScale, colorScale, height);
    }
    else {
      if (stacked) {
        yScale.domain([0, d3.max(data, (d: any) => d.total)]).nice();
        this.drawStackedBars(data, svg, xScale, yScale, colorScale, height, keys);
      }
      else {
        yScale.domain([0, d3.max(data, (d: any) => d3.max(d.values))]).nice();
        this.drawGroupBars(data, svg, xScale, yScale, colorScale, height, keys);
      }
    }

    // Add sublabels
    if (sublabels) {
      const labelsGroup = svg.append("g")
        .attr("class", "sub-axis")
        .attr("transform", "translate(0," + (height + 35) + ")")

      const number = sublabels.length;
      // ( ( 1 * (1 / number) ) +  ( 1 * (0 / number) )) / 2
      sublabels.forEach((label, i) => {
        labelsGroup.append("text")
          .attr("x", this.width * (((i+1) / number) + ((i) / number)) / 2)
          .attr("y", 0)
          .attr("font-size", 12)
          .attr("text-anchor", "middle")
          .text(label);
      });
    }

    // Add x axis
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    // Calculate max value of all columns
    let ticksNumber = data.map(d => d.total).reduce((v1, v2) => (v1 > v2) ? v1 : v2);
    if (ticksNumber > 8) ticksNumber = 8; // Max value for ticks

    // Add y axis
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).ticks(ticksNumber))//.tickFormat(d3.format("d")))
    .append("text")
      .attr("x", 2)
      .attr("y", yScale(yScale.ticks().pop()))
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");

    // Add legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", (d, i) => "translate(0," + i * 15 + ")");
  }

  drawSingleBars(data, svg, xScale, yScale, colorScale, height) {
    svg.append("g")
      .selectAll("g").data(data)
      .enter().append('rect')
        .attr('class', 'bar')
        //.attr('fill', function(d: any) { return colorScale(d.key); })
        .attr("class", function(d) { return d3.select(this).attr("class") + " " + colorScale(d.key); })
        .attr('x', function(d: any) { return xScale(d.key); })
        .attr('width', xScale.bandwidth())
        .attr('y', function(d: any) { return yScale(d.values[0]); })
        .attr('height', function(d: any) { return height - yScale(d.values[0]); });
  }

  drawGroupBars(data, svg, xScale, yScale, colorScale, height, keys) {
    svg.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(data))
      .enter().append("g")
        //.attr("fill", function(d) { return colorScale(d.key); })
        .attr("class", function(d) { return d3.select(this).attr("class") + " " + colorScale(d.key); })
        .attr("transform", (d, i) => { return `translate(${xScale.bandwidth() / keys.length * i}, 0)` })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return xScale(d.data.key); })
        .attr("y", function(d) {
          if (!isNaN(d[0]) && !isNaN(d[1])) return height - (yScale(d[0]) - yScale(d[1]))
        })
        .attr("height", function(d) {
          if (!isNaN(d[0]) && !isNaN(d[1])) return yScale(d[0]) - yScale(d[1]);
        })
        .attr("width", function(d, i) { return xScale.bandwidth() / keys.length } );
  }

  drawStackedBars(data, svg, xScale, yScale, colorScale, height, keys) {
    svg.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(data))
      .enter().append("g")
        //.attr("fill", function(d) { return colorScale(d.key); })
        .attr("class", function(d) { return d3.select(this).attr("class") + " " + colorScale(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return xScale(d.data.key); })
        .attr("y", function(d) { if (!isNaN(d[1])) return yScale(d[1]); })
        .attr("height", function(d) {
          if (!isNaN(d[0]) && !isNaN(d[1])) return yScale(d[0]) - yScale(d[1]);
        })
        .attr("width", xScale.bandwidth());
  }

}
