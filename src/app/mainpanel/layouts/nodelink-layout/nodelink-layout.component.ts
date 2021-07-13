import { Component, OnInit, ViewEncapsulation, Renderer2, ElementRef } from '@angular/core';
import { DataService } from '../../../data.service';

import { Court } from '../../../classes/court';
import { ServeBox } from '../../../classes/servebox';
import { OutcomeBox } from '../../../classes/outcomebox';
import * as d3 from 'd3';

import 'leader-line';
declare let LeaderLine: any;

// declare var LeaderLine: any;

@Component({
  selector: 'app-nodelink-layout',
  templateUrl: './nodelink-layout.component.html',
  styleUrls: ['./nodelink-layout.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class NodelinkLayoutComponent implements OnInit {
  servesColumn: any = [];
  outcomeColumn: any = [];
  situationColumns: Array<any> = [];
  edgeLists: Array<any> = [];

  courtObjects = new Map();
  edgeObjects = new Map();
  highlightedEdgeObjects = new Set();
  selectedEdgeObjects = new Set();

  selectedNodes = new Map();

  constructor(private dataService: DataService, private renderer: Renderer2, private elem: ElementRef) { }

  ngOnInit(): void {
  }

  updateData(data): void {
  	// Get standard situations shots based on the chosen situation
  	const matchId = sessionStorage.getItem('matchId');

    if (data.standard) {
      this.dataService.getNodeLinkStandardSituationShots(matchId, data.hittingPlayerNumber, data.p1LRCode, data.p1DepthCode, data.p2LRCode, data.p2DepthCode).subscribe(res => {
        this.drawData(res);
      });
    }
    else {
      const p1X1 = data.p1RectCoordinates[0];
      const p1Y1 = data.p1RectCoordinates[1];
      const p1X2 = data.p1RectCoordinates[2];
      const p1Y2 = data.p1RectCoordinates[3];
      const p2X1 = data.p2RectCoordinates[0];
      const p2Y1 = data.p2RectCoordinates[1];
      const p2X2 = data.p2RectCoordinates[2];
      const p2Y2 = data.p2RectCoordinates[3];

      this.dataService.getNodeLinkCustomSituationShots(matchId, data.hittingPlayerNumber, p1X1, p1Y1, p1X2, p1Y2, p2X1, p2Y1, p2X2, p2Y2).subscribe(res => {
        this.drawData(res);
      });
    }
  }

  drawData(res): void {
    this.removeEdges();

    this.situationColumns = res.nodeGroupColumns;
    this.edgeLists = res.edges;
    this.servesColumn = [];
    this.outcomeColumn = [];
    this.highlightedEdgeObjects.clear();
    this.selectedEdgeObjects.clear();
    this.selectedNodes.clear();

    setTimeout(() => {
      let maxKeyShotsNumber = 0;

      res.nodeGroupColumns.forEach((d, columnIndex) => {
        /* Display shots */
        let container = d3.select('#nodesContainer' + columnIndex);

        d.forEach((s, rowIndex) => {
          const shot = s.uinodes[0].shot;

          let nodeContainer = container.append('div');
          nodeContainer.classed("shot", true);
          nodeContainer.attr("id", 'nodeContainer' + columnIndex + '-' + rowIndex);

          this.drawNode(s, nodeContainer, shot, columnIndex, rowIndex);

          const shots = s.uinodes.filter(n => (n.shot != null)).map(n => n.shot);
          if (shots.length > 0) maxKeyShotsNumber = (s.uinodes.length > maxKeyShotsNumber) ? s.uinodes.length : maxKeyShotsNumber;

          /* CLICK */
          nodeContainer.on('click', () => this.onClick(s, nodeContainer, maxKeyShotsNumber));

          /* HOVER */
          nodeContainer.on('mouseenter', () => this.onMouseEnter(s, nodeContainer, maxKeyShotsNumber));
          nodeContainer.on('mouseleave', () => this.onMouseLeave());
        });
      });

      this.updateBackgroundCircles(maxKeyShotsNumber);
      setTimeout(() => {
        this.updateEdges(false);
      }, 5);

    }, 1);
  }

  drawNode(s, nodeContainer, shot, columnIndex, rowIndex) {
    // Serve Box
    if (s.serveNode && columnIndex == 0) {
      new ServeBox(nodeContainer, shot.hittingplayer, shot.serveSide, shot.serveNumber, s.numberOfPreAnalysisShots);
    }
    else {
      // Outcome Box
      if (s.outcomeNode) {
        let isWinPoint = false;
        if (s.standardSituationCode.includes('WINNER') || (s.standardSituationCode.includes('FORCED_ERROR') && !s.standardSituationCode.includes('UNFORCED_ERROR'))) 
          isWinPoint = true;

        new OutcomeBox(nodeContainer, isWinPoint, shot.winningPlayer, s.numberOfPostAnalysisShots);
      }
      else {
        // Normal Court
        const shots = s.uinodes.filter(n => (n.shot != null)).map(n => n.shot);

        // Create Court svg object using the data
        let court: Court = new Court(80, nodeContainer, true, false, false);

        if (shots.length > 0) court.updateDataForNode(shots);
        else court.setEmptyNodeCourt();

        court.setKeySituationShotsNumber(s.uinodes.length);
        this.courtObjects.set('nodeContainer' + columnIndex + '-' + rowIndex, court);
      }
    }
  }

  onClick(s, nodeContainer, maxKeyShotsNumber) {
    nodeContainer.classed('main-selected', !nodeContainer.classed('main-selected'));

    const ids = s.uinodes[0].locationID.split('-');
    const id = ids[0] + '-' + ids[1];

    if (this.selectedNodes.has(id)) this.selectedNodes.delete(id);
    else this.selectedNodes.set(id, s);

    this.getSelectedNodeData(maxKeyShotsNumber);
  }

  getSelectedNodeData(maxKeyShotsNumber) {
    this.dataService.getCommonEdgesData(Array.from(this.selectedNodes.keys())).subscribe(res => {
      this.unselectNodes();
      this.unselectEdges();
      this.enableNodesEdges(false);

      /* Make nodes and edges selected */
      res.forEach(e => {
        e.uinodes.forEach(n => {
          const id0 = e.edgeColumnIndex + '-' + e.fromIndex;
          const id1 = (parseInt(e.edgeColumnIndex) + 1) + '-' + e.toIndex;

          this.selectNode(id0);
          this.selectNode(id1);
          this.selectEdge(id0, id1, e);
        });
      });

      /* Get common point ids from selection to display shots correctly */
      const pointIds = this.getNodePointIdsToUpdate();

      /* Update selected nodes elements */
      let listedIds = new Set();
      this.selectedNodes.forEach((v, k) => {
        v.uinodes.forEach(n => {
          n.edgeIDList.forEach(e => {
            const vals = e.split(':');
            const column = vals[0];
            const row = vals[1].split('-');
            const id = (parseInt(column) + 1) + '-' + row[1];

            if (!listedIds.has(id)) this.enableNodeElements(false, id);
            listedIds.add(id);

            if (pointIds.includes(n.pointID)) this.selectNodeElementsByPointId(id, n.pointID);
            this.updateSelectedCircle(id, maxKeyShotsNumber);
          });
        });
      });
    });
  }

  getNodePointIdsToUpdate() {
    let commonIds = [];
    if (this.selectedNodes.size > 0)
      commonIds = Array.from(this.selectedNodes.values()).map(v => v.uinodes.map(n => n.pointID)).reduce((v1, v2) => v1.map(e1 => v2.filter(e2 => (e1 == e2)).flat()).flat());

    if (commonIds.length == 0)
      commonIds = Array.from(this.selectedNodes.values()).map(v => v.uinodes.map(n => n.pointID).flat()).reduce((acc, val) => acc.concat(val), []);

    var counts = {};
    commonIds.forEach(e => counts[e] = (counts[e] || 0) + 1);
    const max = Object.values(counts).reduce((v1, v2) => (v1 > v2) ? v1 : v2);

    return commonIds.filter(id => counts[id] === max);
  }

  onMouseEnter(s, nodeContainer, maxKeyShotsNumber) {
    //if (nodeContainer.classed('selected')) return;

    this.enableNodesEdges(false);
    let listedIds = new Set();

    s.uinodes.forEach(n => {
      n.edgeIDList.forEach(e => {
        const vals = e.split(':');
        const column = vals[0];
        const row = vals[1].split('-');

        const id0 = column + '-' + row[0];
        const id1 = (parseInt(column) + 1) + '-' + row[1];

        if (!listedIds.has(id1)) this.enableNodeElements(false, id1);
        listedIds.add(id1);

        this.enableNode(true, id0);
        this.enableNode(true, id1);
        this.enableEdge(true, id0, id1);

        this.enableNodeElementsByPointId(true, id1, n.pointID);

        const node0Id = id0.replace('-', ':')
        const node1Row = id1.split('-')[1];

        let width = 1;
        const weightLine = s.weightedEdgeIDList.filter(w => w.includes(node0Id + '-' + node1Row));
        if (weightLine !== undefined && weightLine !== null && weightLine.length > 0) width = weightLine[0].split(':').pop();
        this.modifyEdge(width, id0, id1);

        this.updateHoverCircle(id1, maxKeyShotsNumber); 
      });
    });

    setTimeout(() => this.highlightEdges(), 1);
  }

  onMouseLeave() {
    d3.selectAll('#nodelink-container .shot svg g.circle .hover-circle').classed('disabled', true);
    this.enableNodeElements(true, null);

    // Highlighted edges to default (or selected)
    this.highlightedEdgeObjects.forEach((k, e: any) => {
      d3.select('#edges-container .edge#edge' + e.id).classed('highlighted', false);

      if (this.selectedEdgeObjects.has(e)) d3.select('#edges-container .edge#edge' + e.id + ' svg defs use').style('stroke-width', e.selectedWidth * 1.5 + 'px');
      else d3.select('#edges-container .edge#edge' + e.id + ' svg defs use').style('stroke-width', e.width * 1.5 + 'px');
    });

    this.highlightedEdgeObjects.clear();

    if (this.selectedNodes.size == 0) 
      this.enableNodesEdges(true);
    else {
      this.enableNodesEdges(false);
      this.disableUnselectedNodeElements();
    }
  }


  /* QUERY FUNCTIONS */
  removeEdges() {
    document.querySelectorAll('.leader-line').forEach(e => e.remove());
  }

  unselectNodes() {
    d3.selectAll('#nodelink-container .shot').classed('selected', false);
    d3.selectAll('#nodelink-container .shot svg g.elements .ball.selected').classed('selected', false);
    d3.selectAll('#nodelink-container .shot svg g.elements line.selected').classed('selected', false);
    d3.selectAll('#nodelink-container .shot svg g.elements .player.selected').classed('selected', false);

    d3.selectAll('#nodelink-container .shot svg g.circle .selected-circle').classed('disabled', true);
  }

  unselectEdges() {
    d3.selectAll('#edges-container .edge').classed('selected', false);

    // Selected edges to default
    this.selectedEdgeObjects.forEach((k, e: any) => {
      d3.select('#edges-container .edge:not(.selected)#edge' + e.id).classed('selected', false);
      d3.select('#edges-container .edge:not(.selected)#edge' + e.id + ' svg defs use').style('stroke-width', e.width * 1.5 + 'px');
    });

    this.selectedEdgeObjects.clear();
  }

  unselectMainNodes() {
    d3.selectAll('#nodelink-container .shot').classed('main-selected', false);
  }

  enableNodeElements(enabled, id) {
    const specificNodeQuery = (id != null) ? '#nodeContainer' + id : '';

    d3.selectAll('#nodelink-container .shot' + specificNodeQuery + ' svg g.elements .ball:not(.selected)').classed('disabled', !enabled);
    d3.selectAll('#nodelink-container .shot' + specificNodeQuery + ' svg g.elements line:not(.selected)').classed('disabled', !enabled);
    d3.selectAll('#nodelink-container .shot' + specificNodeQuery + ' svg g.elements .player:not(.selected)').classed('disabled', !enabled);
  }

  disableUnselectedNodeElements() {
    d3.selectAll('#nodelink-container .shot.selected svg g.elements .ball:not(.selected)').classed('disabled', true);
    d3.selectAll('#nodelink-container .shot.selected svg g.elements line:not(.selected)').classed('disabled', true);
    d3.selectAll('#nodelink-container .shot.selected svg g.elements .player:not(.selected)').classed('disabled', true);
  }

  enableNodesEdges(enabled) {
    d3.selectAll('#nodelink-container .shot:not(.selected)').classed('disabled', !enabled);
    d3.selectAll('#edges-container .edge:not(.selected)').classed('disabled', !enabled);
  }

  enableNode(enabled, id) {
    const specificNodeQuery = (id != null) ? '#nodeContainer' + id : '';
    d3.select('#nodelink-container .shot:not(.selected)' + specificNodeQuery).classed('disabled', !enabled);
  }

  enableEdge(enabled, id0, id1) {
    const specificEdgeQuery = (id0 != null && id1 != null) ? '#edge' + id0 + '-' + id1 : '';
    d3.select('#edges-container .edge:not(.selected)' + specificEdgeQuery).classed('disabled', !enabled);
  }

  selectNode(id) {
    const specificNodeQuery = (id != null) ? '#nodeContainer' + id : '';
    d3.select('#nodelink-container .shot:not(.selected)' + specificNodeQuery).classed('disabled', false).classed('selected', true);
  }

  selectEdge(id0, id1, e) {
    const specificEdgeQuery = (id0 != null && id1 != null) ? '#edge' + id0 + '-' + id1 : '';
    d3.select('#edges-container .edge:not(.selected)' + specificEdgeQuery).classed('disabled', false).classed('selected', true);
    d3.select('#edges-container .edge:not(.selected)' + specificEdgeQuery + ' svg defs use').style('stroke-width', e.selectedEdgeWeight * 1.5 + 'px');

    if (this.edgeObjects.has(id0 + '-' + id1)) {
      const edge = this.edgeObjects.get(id0 + '-' + id1);
      this.selectedEdgeObjects.add(edge);
    }
  }

  highlightEdges() {
    this.highlightedEdgeObjects.forEach((k, e: any) => {
      d3.select('#edges-container .edge#edge' + e.id).classed('highlighted', true);
    });
  }

  modifyEdge(width, id0, id1) {
    if (this.edgeObjects.has(id0 + '-' + id1)) {
      const edge = this.edgeObjects.get(id0 + '-' + id1);

      const specificEdgeQuery = (id0 != null && id1 != null) ? '#edge' + id0 + '-' + id1 : '';
      d3.select('#edges-container .edge' + specificEdgeQuery + ' svg defs use').style('stroke-width', 1.5 * width + 'px');
      this.highlightedEdgeObjects.add(edge);
    }
  }

  /*
  unhoverEdges() {

  }
  */

  updateEdgeWidth(id0, id1, width) {
    const specificEdgeQuery = (id0 != null && id1 != null) ? '#edge' + id0 + '-' + id1 : '';
    d3.select('#edges-container .edge' + specificEdgeQuery + ' svg > defs > use').style('stroke-width', '3px');
  }

  enableNodeElementsByPointId(enabled, id, pointId) {
    d3.selectAll('#nodeContainer' + id + ' svg g.elements .ball:not(.selected)#ball' + pointId).classed('disabled', !enabled); // Enable related ball and trajectory
    d3.selectAll('#nodeContainer' + id + ' svg g.elements line:not(.selected)#traj' + pointId).classed('disabled', !enabled); // Enable related ball and trajectory
    d3.selectAll('#nodeContainer' + id + ' svg g.elements .player:not(.selected)#player' + pointId).classed('disabled', !enabled); // Enable related ball and trajectory
  }

  selectNodeElementsByPointId(id, pointId) {
    d3.selectAll('#nodeContainer' + id + ' svg g.elements .ball:not(.selected)#ball' + pointId).classed('disabled', false).classed('selected', true); // Enable related ball and trajectory
    d3.selectAll('#nodeContainer' + id + ' svg g.elements line:not(.selected)#traj' + pointId).classed('disabled', false).classed('selected', true); // Enable related ball and trajectory
    d3.selectAll('#nodeContainer' + id + ' svg g.elements .player:not(.selected)#player' + pointId).classed('disabled', false).classed('selected', true); // Enable related ball and trajectory
  }

  /* */


  updateEdges(fullMode) {
    let centerElement = '.center-circle';
    if (fullMode) centerElement = '.court-svg';

    d3.select('#edges-container').selectAll('*').remove();

    this.edgeLists.forEach((s, i) => {
      let startingElement = d3.select(`#nodeContainer${s.edgeColumnIndex}-${s.fromIndex}`).node();
      let endingElement = d3.select(`#nodeContainer${s.edgeColumnIndex+1}-${s.toIndex}`).node();

      if (endingElement != null && startingElement != null) {
        // const line = new LeaderLine(LeaderLine.areaAnchor({element: startingElement, x: '15%', y: '15%', width: '65%', height: '65%', radius: 90}), LeaderLine.areaAnchor({element: endingElement, x: '15%', y: '15%', width: '65%', height: '65%', radius: 90}));
        const line = new LeaderLine(LeaderLine.pointAnchor(startingElement, {x: '50%', y: '50%'}), LeaderLine.pointAnchor(endingElement, {x: '50%', y: '50%'}));
        line.endPlug = 'behind';
        line.startPlug = 'behind';
        line.color = 'rgb(162, 162, 162)';
        line.size = s.edgeWeight * 1.5;
        line.path = 'straight';

        const id = s.edgeColumnIndex + '-' + s.fromIndex + '-' + (s.edgeColumnIndex + 1) + '-' + s.toIndex;
        this.edgeObjects.set(id, {'line': line, 'id': id, 'width': s.edgeWeight, 'selectedWidth': s.edgeWeight});

        d3.select('#edges-container').append('div')
          .classed('edge', true)
          .attr('id', 'edge' + id);
      }
    });

    const edges = document.querySelectorAll('.leader-line');
    const edgesContainers = document.querySelectorAll('#edges-container .edge');
    edges.forEach((e, i) => {
      this.renderer.appendChild(edgesContainers[i], e);
    });
  }

  updateEdgesVisibility() {
    // Update edges opacity after new lines
    this.dataService.getCommonEdgesData(Array.from(this.selectedNodes.keys())).subscribe(res => {
      if (res.length == 0) {
        d3.selectAll('#edges-container .edge').classed('disabled', false);
        return;
      }

      d3.selectAll('#edges-container .edge').classed('disabled', true);

      res.forEach(e => {
        e.uinodes.forEach(n => {
          const id0 = e.edgeColumnIndex + '-' + e.fromIndex;
          const id1 = (parseInt(e.edgeColumnIndex) + 1) + '-' + e.toIndex;
          d3.select('#edge' + id0 + '-' + id1).classed('disabled', false);
        });
      });
    });
  }

  updateBackgroundCircles(maxKeyShotsNumber: number): void {
    this.courtObjects.forEach((s, k) => {
      s.drawAbsBackgroundCircle(maxKeyShotsNumber);
      s.drawRealBackgroundCircle(maxKeyShotsNumber);
    });
  }

  updateSelectedCircle(id, maxKeyShotsNumber) {
    if (this.courtObjects.has('nodeContainer' + id)) {
      let court: Court = this.courtObjects.get('nodeContainer' + id);
      if (court !== undefined) court.updateSelectedCircle(maxKeyShotsNumber);
    }
  }

  updateHoverCircle(id, maxKeyShotsNumber) {
    if (this.courtObjects.has('nodeContainer' + id)) {
      let court: Court = this.courtObjects.get('nodeContainer' + id);
      if (court !== undefined) court.updateHoverCircle(maxKeyShotsNumber);
    }
  }

  changeCourtModeView(fullMode): void {
    let elems = d3.select('#nodes-container').selectAll('.column-container .shots-content .shot').classed('inview', false);
    elems.each((d, i, nodes) => {
      if (this.elementInViewport(nodes[i])) d3.select(nodes[i]).classed('inview', true);
    });

    if (fullMode) this.courtObjects.forEach((c: Court, k) => c.disableAbstractView());
    else this.courtObjects.forEach((c: Court, k) => c.enableAbstractView());

    this.updateEdges(fullMode);
    this.updateEdgesVisibility();
  }

  private elementInViewport(el) {
    var rect = el.getBoundingClientRect(), top = rect.top, height = rect.height, 
      el = el.parentNode
    // Check if bottom of the element is off the page
    if (rect.bottom < 0) return false
    // Check its within the document viewport
    if (top > document.documentElement.clientHeight) return false

    rect = el.getBoundingClientRect()
    if (top <= rect.bottom === false) return false
    // Check if the element is out of view due to a container scrolling
    if ((top + height) <= rect.top) return false
    
    return true
  }
}
