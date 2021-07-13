import * as d3 from 'd3';

export class ServeBox {
  constructor(container, servePlayer, serveSide, serveNumber, leftAdd)
  constructor(container?, servePlayer?, serveSide?, serveNumber?, leftAdd?) {
    this.createChart(container, servePlayer, serveSide, serveNumber, leftAdd);
  }

  private createChart(container, servePlayer, serveSide, serveNumber, leftAdd): void {
    const block = container
      .append('div').classed('serve-block-container', true)
        .append('div')
          .classed('serve-block', true)
          .classed('blue', servePlayer == 1)
          .classed('orange', servePlayer == 2)
          .classed('solid', serveNumber == 1)
          .classed('dashed', serveNumber == 2);

    let cellNum = 0;

    if (servePlayer == 1) {
      if (serveSide == 'Ad') cellNum = 2;
      else if (serveSide == 'Deuce') cellNum = 3;
    }
    else if (servePlayer == 2) {
      if (serveSide == 'Ad') cellNum = 1;
      else if (serveSide == 'Deuce') cellNum = 0;
    }

    for (let i=0; i<4; i++) {
      const cell = block.append('div').classed('cell', true);
      if (i == cellNum) cell.append('div').classed('cell-block', true).text(serveNumber);
    }
  }
}
