import * as d3 from 'd3';

export class OutcomeBox {
  constructor(container, isWinPoint, winPlayer, rightAdd)
  constructor(container?, isWinPoint?, winPlayer?, rightAdd?) {
    this.createChart(container, isWinPoint, winPlayer, rightAdd);
  }

  private createChart(container, isWinPoint, winPlayer, rightAdd): void {
    const block = container.append('div').classed('result-block-container', true);
    
    block.append('div')
      .classed('result-circle', true)
      .classed('blue', winPlayer == 1)
      .classed('orange', winPlayer == 2)
      .classed('win', isWinPoint)
      .classed('error', !isWinPoint);

    if (rightAdd > 0)
      block.append('div').text('+' + rightAdd);
  }
}
