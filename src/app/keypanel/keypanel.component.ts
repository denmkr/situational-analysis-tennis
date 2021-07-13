import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-keypanel',
  templateUrl: './keypanel.component.html',
  styleUrls: ['./keypanel.component.less']
})
export class KeypanelComponent implements OnInit {
  shotCounter = 12;
  showTrajectory = true;
  keyMargin = 10;

  constructor() { }

  ngOnInit(): void {
  }


}
