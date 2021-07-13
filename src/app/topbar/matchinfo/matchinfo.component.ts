import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-matchinfo',
  templateUrl: './matchinfo.component.html',
  styleUrls: ['./matchinfo.component.less']
})
export class MatchinfoComponent implements OnInit {
  p1Name: string;
  p2Name: string;
  score: string; 
  date: string;
  divider: string;

  constructor() { }

  ngOnInit(): void {
  }

  updateMatchInfo(p1Name, p2Name, score, date): void {
  	this.p1Name = p1Name;
  	this.p2Name = p2Name;

  	this.score = score;
  	this.date = date;
  	this.divider = 'vs';
  }

}
