import { Component, OnInit } from '@angular/core';

import { DataService } from '../../../../data.service';

@Component({
  selector: 'app-score-panel',
  templateUrl: './score-panel.component.html',
  styleUrls: ['./score-panel.component.less']
})
export class ScorePanelComponent implements OnInit {
  p1Name: string = '';
  p2Name: string = '';
  p1Point: string; 
  p2Point: string;
  p1Serve: boolean;

  games = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  	

  	// this.p1Serve = true;
  }

  updatePlayersNames(p1Name, p2Name): void {
    this.p1Name = p1Name;
    this.p2Name = p2Name;
  }

  updateData(data): void {
    const shot = data.shots[0];
    
    this.dataService.getScoreboardData(shot.matchid, shot.setsequencenumber, shot.gamesequencenumber, shot.pointsequencenumber).subscribe(res => {
      const points = this.transformPoint(res.p1Points, res.p2Points, res.p1SetsGameScores[res.p1SetsGameScores.length - 1], res.p2SetsGameScores[res.p2SetsGameScores.length - 1]);
      this.p1Point = points[0];
      this.p2Point = points[1];

      this.p1Serve = res.servingPlayerNumber == 1;

      this.games = [];
      res.p1SetsGameScores.forEach((d, i) => {
        this.games.push({ p1: d, p2: res.p2SetsGameScores[i] });
      });
    });
  }

  private transformPoint(p1PointIndex, p2PointIndex, p1SetIndex, p2SetIndex) {
    // Tie break
    if (p1SetIndex == 6 && p1SetIndex == p2SetIndex) return [p1PointIndex, p2PointIndex];

    // Normal game
    let p1Point = '0';
    let p2Point = '0';

    if (p1PointIndex == 0) p1Point = '0';
    else if (p1PointIndex == 1) p1Point = '15';
    else if (p1PointIndex == 2) p1Point = '30';
    else if (p1PointIndex == 3) p1Point = '40';
    else if (p1PointIndex >= 4) {
      if (p2PointIndex > p1PointIndex) {
        p1Point = '40';
        p2Point = 'AD';
      }
      else if (p1PointIndex > p2PointIndex) {
        p1Point = 'AD';
        p2Point = '40';
      }
      else {
        p1Point = '40';
        p2Point = '40';
      }

      return [p1Point, p2Point];
    }

    
    if (p2PointIndex == 0) p2Point = '0';
    else if (p2PointIndex == 1) p2Point = '15';
    else if (p2PointIndex == 2) p2Point = '30';
    else if (p2PointIndex == 3) p2Point = '40';
    else if (p2PointIndex >= 4) p2Point = 'AD';

    return [p1Point, p2Point];
  }

}
