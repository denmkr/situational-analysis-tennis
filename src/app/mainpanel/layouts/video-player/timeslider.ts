import { EventEmitter } from '@angular/core';
import * as d3 from 'd3';

export class TimeSlider {

    onHandlesMoved = new EventEmitter<number[]>();
    onCurStart = new EventEmitter<boolean>();
    onCurMoved = new EventEmitter<number>();
    onCurrentSectorChanged = new EventEmitter<number>();

    rectHeight: number;
    videoWidth: number;
    margin: any;

    container: any;
    timescale: any;
    svg: any;

    cur: any;
    gCur: any;

    data: Array<any> = [];

    constructor(w, h, container)
    constructor(w?, h?, container?) {
        this.margin = {top: 6, right: 8, bottom: 6, left: 8};
        this.videoWidth = w - this.margin.left - this.margin.right,
        this.rectHeight = h - this.margin.top - this.margin.bottom;

        this.container = container;

        this.initTimeslider();
    }

    public plotData(data) {
        this.data = data;

        this.removePlot();

        this.createRectangles(data);
        this.createStrokelines(data);

        this.createBrush(data);
        this.createCurrentHandle();
    }

    public moveCurrentHandle(event) {
        const s = event;

        const x = this.timescale;
        const width = this.videoWidth;
        const gCur = this.gCur;
        const cur = this.cur;

        gCur.call(cur.move, [x(s), width]);
        // console.log(x(s) / width);

        const curSectorNumber = this.getCurrentTimeSectorNumber(x(s) / width);
        this.onCurrentSectorChanged.emit(curSectorNumber);
    }

    public getCurrentTimeSectorNumber(curPercent) {
      if (curPercent < this.data[0].startPercent) return 0;

      let count = -1;
      this.data.forEach((d, i) => {
        if (curPercent >= d.startPercent) count++;
      });

      return count;
    }

    private removePlot() {
        if (this.svg !== undefined) this.svg.selectAll('g').remove();
    }

    private initTimeslider() {
        this.svg = d3.select(this.container)
        	.append('svg')
            	.attr('width', this.videoWidth + this.margin.left + this.margin.right)
            	.attr('height', this.rectHeight + this.margin.top + this.margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.timescale = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, this.videoWidth]);
    }

    private createCurrentHandle() {
        const x = this.timescale;
        const width = this.videoWidth;
        let onCurMoved = this.onCurMoved;
        let onCurStart = this.onCurStart;

        // Create brush for cur
        const cur = d3.brushX()
            .extent([[0, 0], [this.videoWidth, this.rectHeight]])
            .on("start brush", moved)
            .on("end", end);

        // Add cur and move it
        const gCur = this.svg.append("g")
            .attr("id", "cur")
            .call(cur)
            .call(cur.move, [0, 1].map(x));

        this.cur = cur;
        this.gCur = gCur;

        // Remove selection area and leave only one handle
        gCur.select('.overlay').remove()
        gCur.select('.selection').remove()
        gCur.select('.handle--e').remove();

        // Check selection area positions (boundaries)
        function moved(event) {
            if (d3.event.type === "start" && d3.event.sourceEvent != null) {
                onCurStart.emit(true);
            }

            let s = d3.event.selection;
            if (s === null)
                return;

            s = s[0];

            const sStart = +d3.select("#brush").select('.handle--w').attr('x');
            const sEnd = +d3.select("#brush").select('.handle--e').attr('x');
            const handleWidth = +d3.select("#brush").select('.handle--e').attr('width');

            // Limit min and max cur positions
            if (s < sStart + handleWidth / 2) {
                s = sStart + handleWidth / 2;
                gCur.call(cur.move, [s, width]);
            }

            if (s > sEnd + handleWidth / 2 - 1) {
                s = sEnd + handleWidth / 2 - 1;
                gCur.call(cur.move, [s, width]);
            }
        }

        function end(event) {
            const mode = d3.event.mode;
            //console.log(d3.event);

            if (d3.event.sourceEvent != null) { // cur moved by handle
                var s = d3.event.selection;
                onCurMoved.emit(x.invert(s[0]));
            }
        }
    }

    private createBrush(data) {
        const x = this.timescale;
        const width = this.videoWidth;
        let onHandlesMoved = this.onHandlesMoved;

        let timestamps = data.map(d => d.startPercent);
        timestamps.push(1); // Last end

        const brush = d3.brushX()
            .extent([[0, 0], [this.videoWidth, this.rectHeight]])
            .on("start brush", brushed)
            .on("end", brushEnd);

        const gBrush = this.svg.append("g")
            .attr("id", "brush")
            .call(brush)
            .call(brush.move, [0, 1.0].map(x));

        const triangle = d3.symbol()
            .type(d3.symbolTriangle)
            .size(70);

        gBrush.append('path')
            .classed('handle-top', true)
            .attr('id', 'handle-top1')
            .attr('d', triangle)
            .attr("transform", function(d) { return "translate(" + (x(0) - 1) + ", 0) rotate(180)"; });

        gBrush.append('path')
            .classed('handle-top', true)
            .attr('id', 'handle-top2')
            .attr('d', triangle)
            .attr("transform", function(d) { return "translate(" + (x(1) - 1) + ", 0) rotate(180)"; });

        gBrush.select('.overlay').remove();
        gBrush.select('.selection').remove();

        function brushed(event) {
            const s = d3.event.selection;

            // Move caps
            d3.select('#handle-top1').attr('transform', "translate(" + (s[0] - 1) + ", 0) rotate(180)");
            d3.select('#handle-top2').attr('transform', "translate(" + (s[1] - 1) + ", 0) rotate(180)");
        }

        function brushEnd(event) {
        	const s = d3.event.selection;

        	// Move handle to nearest timestamp
            const startValue = x.invert(s[0]);
            const endValue = x.invert(s[1]);

            let closestStart = startValue;
            let closestEnd = endValue;

            // If selection is not sectors values, find closest values and move handles
            if (!timestamps.some(v => { return Math.abs(v - startValue) < Number.EPSILON }) || !timestamps.some(v => { return Math.abs(v - endValue) < Number.EPSILON })) {
            	closestStart = timestamps.reduce(function(prev, curr) {
					return (Math.abs(curr - startValue) < Math.abs(prev - startValue) ? curr : prev);
				});
				closestEnd = timestamps.reduce(function(prev, curr) {
					return (Math.abs(curr - endValue) < Math.abs(prev - endValue) ? curr : prev);
				});

				// Move handle if same timestamp
				if (closestStart === closestEnd) {
					const indexEnd = timestamps.indexOf(closestEnd);
					if (indexEnd < (timestamps.length - 1)) {
						closestEnd = timestamps[indexEnd + 1];
					}
					else {
						const indexStart = timestamps.indexOf(closestStart);
						closestStart = timestamps[indexStart - 1];
					}
				}

				gBrush.call(brush.move, [x(closestStart), x(closestEnd)]);
            }
            else {
                // If start and end handles were changed to closes ones, send new values to parent
                onHandlesMoved.emit([closestStart, closestEnd]);
            }
        }
    }

    private createRectangles(data) {
        let timescale = this.timescale;
        let rectHeight = this.rectHeight;
        let svg = this.svg;

        svg.append('g')
            .attr('id', 'rectangles-group')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .selectAll('rect').data(data).enter()
            .append('rect')
                .attr('x', (d: any) => timescale(d.startPercent) - this.margin.left)
                .attr('y', 0)
                .attr('height', rectHeight - this.margin.top - this.margin.bottom)
                .attr('width', (d: any) => timescale(d.endPercent) - timescale(d.startPercent))
                .attr('stroke', '#333')
                .attr('stroke-width', '2px')
                //.attr('fill', (d: any) => d.color)
                .attr("class", function(d) { return d3.select(this).attr("class") + " " + (d.color); })
                .classed('active', (d: any) => d.keyShot)
                .on('click', function() {
                    /*
                    svg.select('#rectangles-group')
                        .selectAll('rect')
                        .classed('active', false);

                    d3.select(this).classed('active', true);
                    */
                });
    }

    private createStrokelines(data) {
        let timescale = this.timescale;
        let rectHeight = this.rectHeight;
        let svg = this.svg;

        svg.append('g')
        	.attr('id', 'strokelines-group')
        	.selectAll('line').data(data).enter()
            .append('line')
                .attr('x1', (d: any) => timescale(d.startPercent) + 4)
                .attr('y1', rectHeight / 2.0)
                .attr('x2', (d: any) => timescale(d.endPercent) - 4)
                .attr('y2',  rectHeight / 2.0)
                .attr("stroke", (d: any) => d.dashed ? 'white' : 'transparent')
                .attr("stroke-width", rectHeight * .08)
                .style("stroke-dasharray", 6)
    }


}

