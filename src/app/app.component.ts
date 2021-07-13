import { Component, ViewChild } from '@angular/core';
import { MainpanelComponent } from './mainpanel/mainpanel.component';
import { SituationpanelComponent } from './situationpanel/situationpanel.component';
import { StatisticspanelComponent } from './statisticspanel/statisticspanel.component';
import { SpectrumpanelComponent } from './spectrumpanel/spectrumpanel.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  @ViewChild(MainpanelComponent, {static: false}) mainpanelComponent: MainpanelComponent;
  @ViewChild(SituationpanelComponent, {static: false}) situationpanelComponent: SituationpanelComponent;
  @ViewChild(StatisticspanelComponent, {static: false}) statisticspanelComponent: StatisticspanelComponent;
  @ViewChild(SpectrumpanelComponent, {static: false}) spectrumpanelComponent: SpectrumpanelComponent;
  @ViewChild(TopbarComponent, {static: false}) topbarComponent: TopbarComponent;

  constructor(private dataService: DataService) { }
  
  title = 'SAT';
  matchId: string;

  courtModeChanged(mode: boolean): void {
    this.mainpanelComponent.changeCourtModeView(mode);
  }

  selectedMatchChanged(matchId: string): void {
  	this.loadMatch(matchId);
  }

  newStandardSituationExplored(event): void {
  	this.situationpanelComponent.addSituation(event, true);
  }

  newCustomSituationExplored(event): void {
    this.situationpanelComponent.addSituation(event, false);
  }

  currentSituationChanged(event): void {
    const matchId = sessionStorage.getItem('matchId');

    this.mainpanelComponent.changeCurrentSituation(event);
    
    if (event.standard) this.statisticspanelComponent.updateDataForStandardSituation(matchId, event);
    else this.statisticspanelComponent.updateDataForCustomSituation(matchId, event);
    
  }

  loadMatch(matchId): void {
    this.dataService.loadMatchData(matchId).subscribe(res => {
      sessionStorage.setItem('matchId', res.matchID.toString());
      this.updateComponentsOnMatchId(res.matchID.toString());
      this.updateComponentsOnP1WinPercentage(res.p1WinningPercentage.toString());
      this.updateComponentsOnPlayerNames(res.p1FirstName.charAt(0) + '. ' + res.p1LastName, res.p2FirstName.charAt(0) + '. ' + res.p2LastName);
      this.updateComponentsOnPlayerNamesAndScoreAndDate(res.p1FirstName.charAt(0) + '. ' + res.p1LastName, res.p2FirstName.charAt(0) + '. ' + res.p2LastName, res.score || '', res.playDate);
    });
  }

  updateComponentsOnPlayerNames(p1Name, p2Name): void {
    this.mainpanelComponent.videoPlayerComponent.scorePanelComponent.updatePlayersNames(p1Name, p2Name);
  }

  updateComponentsOnPlayerNamesAndScoreAndDate(p1Name, p2Name, score, date): void {
    this.topbarComponent.matchinfoComponent.updateMatchInfo(p1Name, p2Name, score, date);
  }

  updateComponentsOnMatchId(matchId): void {
    this.mainpanelComponent.updateExplorationView(matchId);
    this.spectrumpanelComponent.updateData(matchId);
    this.statisticspanelComponent.updateDataForMatch(matchId);
  }

  updateComponentsOnP1WinPercentage(p1WinningPercentage): void {
    this.topbarComponent.updateBackgroundColor(parseFloat(p1WinningPercentage));
    this.topbarComponent.winbarComponent.updateWinningRatio(parseFloat(p1WinningPercentage));
  }

  updateMaxKeyShotsNumber(number): void {
    this.situationpanelComponent.updateMaxKeyShotsNumber(number);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataService.getLoadedMatchData().subscribe(res => {
      if (res == null) return;

      sessionStorage.setItem('matchId', res.matchID);
      this.updateComponentsOnMatchId(res.matchID.toString());
      this.updateComponentsOnP1WinPercentage(res.p1WinningPercentage.toString());
      this.updateComponentsOnPlayerNames(res.p1FirstName.charAt(0) + '. ' + res.p1LastName, res.p2FirstName.charAt(0) + '. ' + res.p2LastName);
      this.updateComponentsOnPlayerNamesAndScoreAndDate(res.p1FirstName.charAt(0) + '. ' + res.p1LastName, res.p2FirstName.charAt(0) + '. ' + res.p2LastName, res.score || '', res.playDate);

      this.topbarComponent.selectMatchId(res.matchID.toString());
    });

    /*
    const matchId = sessionStorage.getItem('matchId');
    if (matchId != null) {
      this.updateComponentsOnMatchId(matchId);

      const p1WinningPercentage = sessionStorage.getItem('p1WinningPercentage');
      this.updateComponentsOnP1WinPercentage(p1WinningPercentage);
    }
    */
  }
}
