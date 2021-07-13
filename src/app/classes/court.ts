import * as d3 from 'd3';
import { Shot } from '../interfaces/Shot';
import { StandardSummarySituation } from '../interfaces/StandardSummarySituation';

export class Court {
  private trajectoryStrokeWidth = 10; // stroke width for the ball trajectory
  private absBallRadius = 30; // tennis ball radius
  private realBallRadius = this.absBallRadius * 1.0; // tennis ball radius
  private playerSmallWidth = 45; // width of the small player rectangle

  private playerAbsSize = 120; // size of the small player rectangle
  private playerRealSize = 90; // size of the abstract player rectangle

  private realCourtWidth = 360;
  private realCourtHeight = 780;

  private depthP1 = d3.scaleOrdinal([0, 1, 2], [this.playerAbsSize * 4,
    this.playerAbsSize * 3, this.playerAbsSize * 2]);
  private depthP2 = d3.scaleOrdinal([0, 1, 2], [-this.playerAbsSize, 0, this.playerAbsSize]);

  private lrP1 = d3.scaleOrdinal(['OL', 'L', 'M', 'R', 'OR'], [-this.playerAbsSize, 0,
    this.playerAbsSize, this.playerAbsSize * 2, this.playerAbsSize * 3]);
  private lrP2 = d3.scaleOrdinal(['OL', 'L', 'M', 'R', 'OR'], [this.playerAbsSize * 3, this.playerAbsSize * 2,
    this.playerAbsSize, 0, -this.playerAbsSize]);

  private realCourtX = d3.scaleLinear([-4.5, 31.5], [0, this.realCourtWidth]);
  private realCourtY = d3.scaleLinear([0, 78], [0, this.realCourtHeight]);
  private absCourtX = d3.scaleLinear([0, 27], [0, this.playerAbsSize * 3]);
  private absCourtY = d3.scaleLinear([0, 78], [0, this.playerAbsSize * 4]);

  private color = d3.scaleLinear<string>().domain([0, 0.5, 1]).range(['rgba(255, 0, 0, 1)', 'rgba(255, 255, 255, 1)', 'rgba(0, 255, 0, 1)']);

  svg: any;
  elementsGroup: any;
  circleGroup: any;
  backgroundGroup: any;

  keySituationShots: number = undefined; // If standard situation

  svgAbsWidth: number;
  svgRealWidth: number;
  absCourtMargin: any;
  realCourtMargin: any;
  container: any;
  absCourtViewbox: Array<number> = [];
  realCourtViewbox: Array<number> = [];

  constructor(w, container, isAbstractView, borderEnabled, isKey)
  constructor(w?, container?, isAbstractView?, borderEnabled?, isKey?) {
    this.container = container;
    this.createCharts(w, isAbstractView, borderEnabled, isKey);
  }

  private createCharts(w, isAbstractView, borderEnabled, isKey): void {
    // Set the dimensions and margins of the court
    const space = this.playerAbsSize; // Use abs player size
    const absCourtMargin = {top: space, right: space, bottom: space, left: space};

    const realCourtMargin = {top: 160, right: 160, bottom: 160, left: 160};

    const svgAbsWidth = w - absCourtMargin.left - absCourtMargin.right;
    const svgRealWidth = w - realCourtMargin.left - realCourtMargin.right;

    this.absCourtViewbox = [0 - absCourtMargin.left, -absCourtMargin.top, 360 + absCourtMargin.right + absCourtMargin.left, 480 + absCourtMargin.bottom + absCourtMargin.top];
    this.realCourtViewbox = [0 - realCourtMargin.left, -realCourtMargin.top, 360 + realCourtMargin.right + realCourtMargin.left, 780 + realCourtMargin.bottom + realCourtMargin.top];

    let svg = this.container
      .append('svg')
        .classed('court-svg', true)
        .classed('border-2', borderEnabled);

    this.createGrids(svg);

    this.elementsGroup = svg.append('g').classed('elements', true);
    this.circleGroup = svg.append('g').classed('circle', true);
    this.backgroundGroup = svg.append('g').classed('back', true);

    this.svg = svg;
    this.svgAbsWidth = svgAbsWidth;
    this.svgRealWidth = svgRealWidth;
    this.absCourtMargin = absCourtMargin;
    this.realCourtMargin = realCourtMargin;

    if (isAbstractView) this.enableAbstractView();
    else this.disableAbstractView();

    if (isKey) this.setKeyCourt();
  }

  private createGrids(svg) {
    this.createRealCourtGrid(svg);
    this.createAbsCourtGrid(svg);
  }

  private createAbsCourtGrid(svg) {
    let grid = svg.append('g').attr('id', 'abs-court-grid');
    let gridPoints = [{d: 'M 0,0 360,0'}, {d: 'M 0,480 360,480'}, {d: 'm 0,0 0,480'}, {d: 'm 360,0 0,480'}];

    // Display the abs tennis court lines
    grid.selectAll()
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

  private createRealCourtGrid(svg) {
    let grid = svg.append('g').attr('id', 'real-court-grid');

    let gridPoints = [{d: 'M 45,0 315,0', class: 'common-line vertical-line'}, {d: 'm 45,780 270,0', class: 'common-line vertical-line'},
    {d: 'M 45,180 315,180', class: 'full-line'}, {d: 'M 45,600 315,600', class: 'full-line'},
    {d: 'm 45,0 0,780', class: 'common-line'}, {d: 'm 315,0 0,780', class: 'common-line'},
    {d: 'M 0,0 45,0', class: 'full-line'}, {d:'M 315,0 360,0', class: 'full-line'}, {d:'m 0,390 45,0', class: 'full-line'}, {d:'m 315,390 45,0', class: 'full-line'}, {d:'m 0,780 45,0', class: 'full-line'}, {d:'m 315,780 45,0', class: 'full-line'},
    {d: 'm 0,0 0,780', class: 'full-line'}, {d:'m 360,0 0,780', class: 'full-line'}, {d:'m 180,180 0,420', class: 'full-line'},
    {d: 'm 45,390 270,0', class: 'full-line'},
    {d: 'M 180,0 180,10', class: 'full-line'}, {d: 'M 180,767 180,780', class: 'full-line'}];

    // Display the tennis court lines
    grid.selectAll()
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

  setEmptyNodeCourt() {
    this.enableAbstractView();
    this.svg.classed('empty-court', true);
  }

  setEmptyCourt(borderColor) {
    this.enableAbstractView();
    this.svg.classed('empty-court', true);
    this.svg.classed(`${borderColor}-border`, true);
  }

  updateDataForNode(data: Array<Shot>): void {
    // Abstract court view
    this.enableAbstractView();

    data.forEach((s, i) => {
      let ballX = s.ballx;
      let ballY = s.bally;
      if (s.isNextShotVolley){
        if (s.hittingplayer === 1){
          // bounce location should be ending location of player 2
          ballX = s.p2Endx;
          ballY = s.p2Endy;
        }else{
          // bounce location should be anding location of player 1
          ballX = s.p1Endx;
          ballY = s.p1Endy;
        }
      }

      const x1 = s.p1Startx;
      const y1 = s.p1Starty;
      const x2 = s.p2Startx;
      const y2 = s.p2Starty;

      const absX1 = s.p1LRCode;
      const absY1 = s.p1DepthCode;
      const absX2 = s.p2LRCode;
      const absY2 = s.p2DepthCode;
      const p1WinPercentage = s.p1WinningPercentage || 0.5; // if null
      const hittingPlayer = s.hittingplayer;
      const borderColor = (hittingPlayer == 1) ? 'blue' : 'orange';

      if (i == 0) {
        this.plotShotData(this.lrP1(absX1), this.depthP1(absY1), this.lrP2(absX2), this.depthP2(absY2), this.absCourtX(ballX), this.absCourtY(ballY), this.realCourtX(x1), this.realCourtY(y1), this.realCourtX(x2),
          this.realCourtY(y2), this.realCourtX(ballX), this.realCourtY(ballY), this.color(p1WinPercentage), borderColor,
          hittingPlayer, s.strokeside, s.shotindex, s.serveNumber, s.serveSide, s.winningPlayer, s.isNextShotVolley, false, s.id);

        // Serve and return
        if (s.shotindex <= 1) {
          this.drawAbsText(s.shotindex, hittingPlayer, s.serveSide);
          this.drawRealText(s.shotindex, hittingPlayer, s.serveSide);
        }
      }
      else {
        this.drawAbsTrajectory(this.lrP1(absX1), this.depthP1(absY1), this.lrP2(absX2), this.depthP2(absY2), this.absCourtX(ballX), this.absCourtY(ballY), hittingPlayer, s.shotindex, s.strokeside,
          s.serveNumber, s.winningPlayer, s.isNextShotVolley, s.id);
        this.drawRealTrajectory(this.realCourtX(x1), this.realCourtY(y1), this.realCourtX(x2),
          this.realCourtY(y2), this.realCourtX(ballX), this.realCourtY(ballY), hittingPlayer, s.shotindex, s.strokeside,
          s.serveNumber, s.winningPlayer, s.isNextShotVolley, s.id);

        this.drawRealRectangles(this.realCourtX(x1), this.realCourtY(y1), this.realCourtX(x2), this.realCourtY(y2), hittingPlayer, s.id);

        this.drawAbsBall(this.absCourtX(ballX), this.absCourtY(ballY), hittingPlayer, s.winningPlayer, s.isNextShotVolley, s.id);
        this.drawRealBall(this.realCourtX(ballX), this.realCourtY(ballY), hittingPlayer, s.winningPlayer, s.isNextShotVolley, s.id);
      }
    });

    this.fixLayersSequence();
  }

  updateDataForCustomSituation(data: any): void {
    // Real court view
    this.disableAbstractView();

    const p1WinPercentage = data.p1WinPercent || 0.5; // if null
    const hittingPlayer = data.hittingPlayerNumber;
    const borderColor = (hittingPlayer == 1) ? 'blue' : 'orange';

    const p1x1 = data.p1RectCoordinates[0];
    const p1y1 = data.p1RectCoordinates[1];
    const p1x2 = data.p1RectCoordinates[2];
    const p1y2 = data.p1RectCoordinates[3];
    const p2x1 = data.p2RectCoordinates[0];
    const p2y1 = data.p2RectCoordinates[1];
    const p2x2 = data.p2RectCoordinates[2];
    const p2y2 = data.p2RectCoordinates[3];

    this.plotCustomSituationData(this.realCourtX(p1x1), this.realCourtY(p1y1), this.realCourtX(p1x2), this.realCourtY(p1y2), this.realCourtX(p2x1), this.realCourtY(p2y1), this.realCourtX(p2x2), this.realCourtY(p2y2), this.color(p1WinPercentage), borderColor, hittingPlayer);
  }

  updateDataForStandardSituation(data: StandardSummarySituation): void {
    // Abstract court view
    this.enableAbstractView();

    const absX1 = data.p1LRCode;
    const absY1 = data.p1DepthCode;
    const absX2 = data.p2LRCode;
    const absY2 = data.p2DepthCode;
    const p1WinPercentage = data.p1WinPercent || 0.5; // if null
    const hittingPlayer = data.hittingPlayerNumber;
    const borderColor = (hittingPlayer == 1) ? 'blue' : 'orange';

    // Value for background circle
    this.keySituationShots = data.keySituationShots.length;

    this.plotStandardSituationData(this.lrP1(absX1), this.depthP1(absY1), this.lrP2(absX2), this.depthP2(absY2), this.color(p1WinPercentage), borderColor, hittingPlayer);
  }

  setKeySituationShotsNumber(number: number): void {
    this.keySituationShots = number;
  }

  fixLayersSequence(): void {
    this.backgroundGroup.raise();
    this.svg.select('#abs-court-grid').raise();
    this.svg.select('#real-court-grid').raise();
    this.circleGroup.raise();
    this.elementsGroup.raise();

    this.elementsGroup.selectAll('line').raise();
    this.elementsGroup.selectAll('rect').raise();
    this.elementsGroup.selectAll('circle').raise();
    this.elementsGroup.selectAll('text').raise();
  }

  updateDataForShot(data: Shot): void {
    // Abstract court view
    this.enableAbstractView();

    let ballX = data.ballx;
    let ballY = data.bally;
    if (data.isNextShotVolley){
      if (data.hittingplayer === 1){
        // bounce location should be ending location of player 2
        ballX = data.p2Endx;
        ballY = data.p2Endy;
      }else{
        // bounce location should be anding location of player 1
        ballX = data.p1Endx;
        ballY = data.p1Endy;
      }
    }

    const x1 = data.p1Startx;
    const y1 = data.p1Starty;
    const x2 = data.p2Startx;
    const y2 = data.p2Starty;

    const absX1 = data.p1LRCode;
    const absY1 = data.p1DepthCode;
    const absX2 = data.p2LRCode;
    const absY2 = data.p2DepthCode;
    const p1WinPercentage = data.p1WinningPercentage || 0.5; // if null
    const hittingPlayer = data.hittingplayer;
    const borderColor = (hittingPlayer == 1) ? 'blue' : 'orange';

    this.plotShotData(this.lrP1(absX1), this.depthP1(absY1), this.lrP2(absX2), this.depthP2(absY2), this.absCourtX(ballX), this.absCourtY(ballY), this.realCourtX(x1), this.realCourtY(y1), this.realCourtX(x2),
      this.realCourtY(y2), this.realCourtX(ballX), this.realCourtY(ballY), this.color(p1WinPercentage), borderColor,
      hittingPlayer, data.strokeside, data.shotindex, data.serveNumber, data.serveSide, data.winningPlayer, data.isNextShotVolley, true, data.id);
  }

  private plotCustomSituationData(p1x1, p1y1, p1x2, p1y2, p2x1, p2y1, p2x2, p2y2, background, borderColor, hittingPlayerNumber): void {
    this.drawRealBackground(background);
    this.drawLargeRectangles(p1x1, p1y1, p1x2, p1y2, p2x1, p2y1, p2x2, p2y2, hittingPlayerNumber);

    this.svg.classed(`${borderColor}-border`, true);
    this.fixLayersSequence();
  }

  private plotStandardSituationData(absX1, absY1, absX2, absY2, background, borderColor, hittingPlayerNumber): void {
    this.drawAbsBackground(background);
    this.drawRealBackground(background);
    this.drawAbsRectangles(absX1, absY1, absX2, absY2, hittingPlayerNumber);
    //this.drawAbsBackgroundCircle(currentSize, currentSize);

    this.svg.classed(`${borderColor}-border`, true);
    this.fixLayersSequence();
  }

  private plotShotData(absX1, absY1, absX2, absY2, absBallX, absBallY, x1, y1, x2, y2, ballX, ballY, background, borderColor, hittingPlayerNumber,
                   strokeSide, shotIndex, serveNumber, serveSide, winningPlayerNumber, isNextShotVolley, isTextShown, shotId): void {
    this.drawAbsBackground(background);
    this.drawRealBackground(background);

    this.drawAbsTrajectory(absX1, absY1, absX2, absY2, absBallX, absBallY, hittingPlayerNumber, shotIndex, strokeSide,
      serveNumber, winningPlayerNumber, isNextShotVolley, shotId);
    this.drawRealTrajectory(x1, y1, x2, y2, ballX, ballY, hittingPlayerNumber, shotIndex, strokeSide,
      serveNumber, winningPlayerNumber, isNextShotVolley, shotId);

    this.drawAbsRectangles(absX1, absY1, absX2, absY2, hittingPlayerNumber);
    this.drawRealRectangles(x1, y1, x2, y2, hittingPlayerNumber, shotId);

    this.drawAbsBall(absBallX, absBallY, hittingPlayerNumber, winningPlayerNumber, isNextShotVolley, shotId);
    this.drawRealBall(ballX, ballY, hittingPlayerNumber, winningPlayerNumber, isNextShotVolley, shotId);

    // Serve and return
    if (shotIndex <= 1 && isTextShown) {
      this.drawAbsText(shotIndex, hittingPlayerNumber, serveSide);
      this.drawRealText(shotIndex, hittingPlayerNumber, serveSide);
    }

    this.svg.classed(`${borderColor}-border`, true);
    this.fixLayersSequence();
  }


  /*** Court drawing elements ***/

  /* Draw abstract view players rectangles  */
  private drawLargeRectangles(p1x1, p1y1, p1x2, p1y2, p2x1, p2y1, p2x2, p2y2, hittingPlayerNumber) {
    this.elementsGroup.append('rect')
      .attr('x', p1x1)
      .attr('y', p1y1)
      .attr('width', Math.abs(p1x2 - p1x1))
      .attr('height', Math.abs(p1y2 - p1y1))
      .classed('blue', true)
      .classed('player', true)
      .classed('active', hittingPlayerNumber == 1 ? true : false)
      .classed('inactive', hittingPlayerNumber == 1 ? false : true)
      .classed('real-element', true);

    this.elementsGroup.append('rect')
      .attr('x', p2x1)
      .attr('y', p2y1)
      .attr('width', Math.abs(p2x2 - p2x1))
      .attr('height', Math.abs(p2y2 - p2y1))
      .classed('orange', true)
      .classed('player', true)
      .classed('active', hittingPlayerNumber == 2 ? true : false)
      .classed('inactive', hittingPlayerNumber == 2 ? false : true)
      .classed('real-element', true);
  }

  /* Draw abstract view players rectangles  */
  private drawAbsRectangles(absX1, absY1, absX2, absY2, hittingPlayerNumber) {
    this.elementsGroup.append('rect')
      .attr('x', absX1)
      .attr('y', absY1)
      .attr('width', this.playerAbsSize)
      .attr('height', this.playerAbsSize)
      .classed('blue', true)
      .classed('active', hittingPlayerNumber == 1 ? true : false)
      .classed('inactive', hittingPlayerNumber == 1 ? false : true)
      .classed('abs-element', true);

    this.elementsGroup.append('rect')
      .attr('x', absX2)
      .attr('y', absY2)
      .attr('width', this.playerAbsSize)
      .attr('height', this.playerAbsSize)
      .classed('orange', true)
      .classed('active', hittingPlayerNumber == 2 ? true : false)
      .classed('inactive', hittingPlayerNumber == 2 ? false : true)
      .classed('abs-element', true);
  }

  /* Draw real court view players rectangles */
  private drawRealRectangles(x1, y1, x2, y2, hittingPlayerNumber, id) {
  	let ids = id.split(':');
    ids.pop();

    this.elementsGroup.append('rect')
      .attr('x', x1 - this.playerRealSize / 2)
      .attr('y', y1 - this.playerRealSize / 2)
      .attr('width', this.playerRealSize)
      .attr('height', this.playerRealSize)
      .attr('id', 'player' + ids.join('-'))
      .classed('blue', true)
      .classed('player', true)
      .classed('active', hittingPlayerNumber == 1 ? true : false)
      .classed('inactive', hittingPlayerNumber == 1 ? false : true)
      .classed('real-element', true);

    this.elementsGroup.append('rect')
      .attr('x', x2 - this.playerRealSize / 2)
      .attr('y', y2 - this.playerRealSize / 2)
      .attr('width', this.playerRealSize)
      .attr('height', this.playerRealSize)
      .attr('id', 'player' + ids.join('-'))
      .classed('orange', true)
      .classed('player', true)
      .classed('active', hittingPlayerNumber == 2 ? true : false)
      .classed('inactive', hittingPlayerNumber == 2 ? false : true)
      .classed('real-element', true);
  }

  /* Draw background rectangle  */
  private drawAbsBackground(background) {
    // Background rectangle (red-green)
    this.backgroundGroup.append('rect')
      .attr('id', 'background')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 3 * this.playerAbsSize)
      .attr('height', this.playerAbsSize * 4)
      .attr('fill', background || '#fff')
      .classed('abs-element', true);
  }

  private drawRealBackground(background) {
    // Background rectangle (red-green)
    this.backgroundGroup.append('rect')
      .attr('id', 'background')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.realCourtWidth)
      .attr('height', this.realCourtHeight)
      .attr('fill', background || '#fff')
      .classed('real-element', true);
  }

  public updateHoverCircle(maxSize) {
    const size = this.elementsGroup.selectAll('.ball.abs-element:not(.disabled)').size();

    //this.circleGroup.select('circle.center-circle.abs-element').classed('disabled', true);
    //this.circleGroup.select('circle.center-circle.real-element').classed('disabled', true);

    // Circle’s area is proportional to the radius (sqrt)
    let circle = d3.scaleSqrt([0, maxSize], [0, this.playerAbsSize * 1.5]);
    this.circleGroup.select('.hover-circle.abs-element').attr('r', circle(size) || circle(1)).classed('disabled', false);

    circle = d3.scaleSqrt([0, maxSize], [0, this.realCourtWidth / 2]);
    this.circleGroup.select('.hover-circle.real-element').attr('r', circle(size) || circle(1)).classed('disabled', false);
  }

  public updateSelectedCircle(maxSize) {
    const size = this.elementsGroup.selectAll('.ball.abs-element:not(.disabled).selected').size();

    //this.circleGroup.select('circle.center-circle.abs-element').classed('disabled', true);
    //this.circleGroup.select('circle.center-circle.real-element').classed('disabled', true);

    // Circle’s area is proportional to the radius (sqrt)
    let circle = d3.scaleSqrt([0, maxSize], [0, this.playerAbsSize * 1.5]);
    this.circleGroup.select('.selected-circle.abs-element').attr('r', circle(size) || circle(1)).classed('disabled', false);

    circle = d3.scaleSqrt([0, maxSize], [0, this.realCourtWidth / 2]);
    this.circleGroup.select('.selected-circle.real-element').attr('r', circle(size) || circle(1)).classed('disabled', false);
  }

  /* Draw background circle */
  public drawAbsBackgroundCircle(maxSize) {
    this.circleGroup.select('circle.center-circle.abs-element').remove();

    // Circle’s area is proportional to the radius (sqrt)
    const circle = d3.scaleSqrt([0, maxSize], [0, this.playerAbsSize * 1.5]);

    this.circleGroup.append('circle')
      .attr('cx', this.playerAbsSize * 1.5)
      .attr('cy', this.playerAbsSize * 2)
      .attr('r', circle(this.keySituationShots) || circle(1))
      //.attr('fill', 'rgba(128, 128, 128, 0.7)')
      .attr('fill', 'rgb(162, 162, 162)')
      .classed('center-circle', true)
      .classed('default-circle', true)
      .classed('abs-element', true);

    this.circleGroup.append('circle')
      .attr('cx', this.playerAbsSize * 1.5)
      .attr('cy', this.playerAbsSize * 2)
      .attr('r', circle(0))
      //.attr('fill', 'rgba(128, 128, 128, 0.7)')
      .attr('fill', 'steelblue')
      .classed('center-circle', true)
      .classed('selected-circle', true)
      .classed('disabled', true)
      .classed('abs-element', true);

    this.circleGroup.append('circle')
      .attr('cx', this.playerAbsSize * 1.5)
      .attr('cy', this.playerAbsSize * 2)
      .attr('r', circle(0))
      //.attr('fill', 'rgba(128, 128, 128, 0.7)')
      .attr('fill', 'rgb(214, 214, 60)')
      .classed('center-circle', true)
      .classed('hover-circle', true)
      .classed('disabled', true)
      .classed('abs-element', true);
  }

  public drawRealBackgroundCircle(maxSize) {
    this.circleGroup.select('circle.center-circle.real-element').remove();

    // Circle’s area is proportional to the radius (sqrt)
    const circle = d3.scaleSqrt([0, maxSize], [0, this.realCourtWidth / 2]);

    this.circleGroup.append('circle')
      .attr('cx', this.realCourtWidth / 2)
      .attr('cy', this.realCourtHeight / 2)
      .attr('r', circle(this.keySituationShots) || circle(1))
      //.attr('fill', 'rgba(128, 128, 128, 0.7)')
      .attr('fill', 'rgb(162, 162, 162)')
      .classed('center-circle', true)
      .classed('default-circle', true)
      .classed('real-element', true);

    this.circleGroup.append('circle')
      .attr('cx', this.realCourtWidth / 2)
      .attr('cy', this.realCourtHeight / 2)
      .attr('r', circle(0))
      //.attr('fill', 'rgba(128, 128, 128, 0.7)')
      .attr('fill', 'steelblue')
      .classed('center-circle', true)
      .classed('selected-circle', true)
      .classed('disabled', true)
      .classed('real-element', true);

    this.circleGroup.append('circle')
      .attr('cx', this.realCourtWidth / 2)
      .attr('cy', this.realCourtHeight / 2)
      .attr('r', circle(0))
      //.attr('fill', 'rgba(128, 128, 128, 0.7)')
      .attr('fill', 'rgb(214, 214, 60)')
      .classed('center-circle', true)
      .classed('hover-circle', true)
      .classed('disabled', true)
      .classed('real-element', true);
  }

  /* Draw S/R letter */
  private drawAbsText(shotIndex, hittingPlayerNumber, serveSide) {
    const padding = 20;
    const viewbox = this.absCourtViewbox;

    let y = 0;
    let x = 0;

    const letter = (shotIndex == 0) ? 'S' : 'R';

    if (hittingPlayerNumber == 1) {
      // Upper left corner or right corner
      y = viewbox[3] + viewbox[1] - padding;
      if (serveSide == 'Deuce') x = viewbox[2] + viewbox[0] - 80 - padding
      else x = viewbox[0] + padding
    }
    else {
      // Bottom left corner or right corner
      y = viewbox[1] + 80 + padding
      if (serveSide == 'Deuce') x = viewbox[0] + padding
      else x = viewbox[2] + viewbox[0] - 80 - padding
    }

    this.elementsGroup.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '100px')
      .classed('abs-element', true)
      .text(letter);
  }

  private drawRealText(shotIndex, hittingPlayerNumber, serveSide) {
    const padding = 20;
    const viewbox = this.realCourtViewbox;

    let y = 0;
    let x = 0;

    const letter = (shotIndex == 0) ? 'S' : 'R';

    if (hittingPlayerNumber == 1) {
      // Upper left corner or right corner
      y = viewbox[3] + viewbox[1] - padding;
      if (serveSide == 'Deuce') x = viewbox[2] + viewbox[0] - 80 - padding
      else x = viewbox[0] + padding
    }
    else {
      // Bottom left corner or right corner
      y = viewbox[1] + 80 + padding
      if (serveSide == 'Deuce') x = viewbox[0] + padding
      else x = viewbox[2] + viewbox[0] - 80 - padding
    }

    this.elementsGroup.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '110px')
      .classed('real-element', true)
      .text(letter);
  }

  /******* Ball Trajectory *********************************************************/
  private drawAbsTrajectory(absX1, absY1, absX2, absY2, absBallX, absBallY, hittingPlayerNumber, shotIndex,
                       strokeSide, serveNumber, winningPlayerNumber, isNextShotVolley, id) {
    const ballColor = winningPlayerNumber === 1 ? '#00a0e3' : '#ff9933';
    // Now we draw the stroke based on the hitting player, forehand vs. backhand, and point winner
    // This is for the abstract view
    let ballStartX = (hittingPlayerNumber == 1) ? absX1 : absX2;
    let ballStartY = (hittingPlayerNumber == 1) ? absY1 : absY2;
    let dashArray = '0,0';

    let ids = id.split(':');
    ids.pop();

    if (shotIndex == 0) {
      if (serveNumber == 2) dashArray = '50, 30';
    } else if (strokeSide == 'Backhand') dashArray = '50, 30';

    this.elementsGroup.append('line')
      .style('stroke', ballColor)
      .style('stroke-width', this.trajectoryStrokeWidth)
      .attr('x1', ballStartX + this.playerAbsSize / 2)
      .attr('y1', ballStartY + this.playerAbsSize / 2)
      .attr('x2', absBallX)
      .attr('y2', absBallY)
      .attr('id', 'traj' + ids.join('-'))
      .style('stroke-dasharray', dashArray)
      .classed('abs-element', true);
  }

  /******* Ball Trajectory *********************************************************/
  private drawRealTrajectory(x1, y1, x2, y2, ballX, ballY, hittingPlayerNumber, shotIndex,
                       strokeSide, serveNumber, winningPlayerNumber, isNextShotVolley, id) {
    const ballColor = winningPlayerNumber === 1 ? '#00a0e3' : '#ff9933';
    // Now we draw the stroke based on the hitting player, forehand vs. backhand, and point winner
    // This is for the real court view
    let dashArray = '0,0';

    let ids = id.split(':');
    ids.pop();

    if (shotIndex == 0) {
      if (serveNumber == 2) dashArray = '50, 30';
    } else if (strokeSide == 'Backhand') dashArray = '50, 30';

    // Draw trajectory - tenis court view
    let ballStartX = hittingPlayerNumber == 1 ? x1 : x2;
    let ballStartY = hittingPlayerNumber == 1 ? y1 : y2;

    this.elementsGroup.append('line')
      .style('stroke', ballColor)
      .style('stroke-width', this.trajectoryStrokeWidth)
      .attr('x1', ballStartX)
      .attr('y1', ballStartY)
      .attr('x2', ballX)
      .attr('y2', ballY)
      .attr('id', 'traj' + ids.join('-'))
      .style('stroke-dasharray', dashArray)
      .classed('real-element', true);
  }

  /******* Ball *********************************************************/
  private drawAbsBall(ballX, ballY, hittingPlayerNumber, winningPlayerNumber, isNextShotVolley, id) {
    const ballColor = winningPlayerNumber === 1 ? '#00a0e3' : '#ff9933';
    let ids = id.split(':');
    ids.pop();

    // Draw either a solid circle if the ball bounces or a hollow circle if it is a volley
    this.elementsGroup.append('circle')
      .attr('cx', ballX)
      .attr('cy', ballY)
      .attr('r', this.absBallRadius)
      .attr('fill', isNextShotVolley ? 'white' : ballColor)
      .attr('stroke', ballColor)
      .attr('stroke-width', 17)
      .attr('id', 'ball' + ids.join('-'))
      .classed('ball', true)
      .classed('abs-element', true);
  }

  private drawRealBall(ballX, ballY, hittingPlayerNumber, winningPlayerNumber, isNextShotVolley, id) {
    const ballColor = winningPlayerNumber === 1 ? '#00a0e3' : '#ff9933';
    let ids = id.split(':');
    ids.pop();

    this.elementsGroup.append('circle')
      .attr('cx', ballX)
      .attr('cy', ballY)
      .attr('r', this.realBallRadius)
      .attr('fill', isNextShotVolley ? 'white' : ballColor)
      .attr('stroke', ballColor)
      .attr('stroke-width', 25)
      .attr('id', 'ball' + ids.join('-'))
      .classed('ball', true)
      .classed('real-element', true);
  }

  setKeyCourt() {
    this.svg.classed("highlight", true);
  }

  disableAbstractView() {
  	this.svg.classed("small-size", false);

    const viewBox = this.realCourtViewbox;
    const width = this.svgRealWidth;
    const margin = this.realCourtMargin;

    this.svg
      .attr('viewBox', viewBox.toString())
      .attr('width', width + margin.left + margin.right);
  }

  enableAbstractView() {
    this.svg.classed("small-size", true);

    const viewBox = this.absCourtViewbox;
    const width = this.svgAbsWidth;
    const margin = this.absCourtMargin;

    this.svg
      .attr('viewBox', viewBox.toString())
      .attr('width', width + margin.left + margin.right);
  }

  /*
  hideLines() {
    this.svg.classed("hidden", true);
  }
  */
}
