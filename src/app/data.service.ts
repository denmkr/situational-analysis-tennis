import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }

  getShots(matchID: string, hittingPlayer: string) {
    const httpParams = new HttpParams()
      .append('hittingPlayer', hittingPlayer);

    return this.http.post<any>('http://localhost:8080/api/v1/shots', httpParams, { reportProgress: true });
  }

  getLoadedMatchData() {
    const httpParams = new HttpParams();
    return this.http.get<any>('http://localhost:8080/api/v1/match_info', { params: httpParams, reportProgress: true });
  }

  loadMatchData(matchID: string) {
    let httpParams = new HttpParams()
      .append('matchID', matchID);

    return this.http.post<any>('http://localhost:8080/api/v1/load_match', httpParams, { reportProgress: true });
  }

  getCommonEdgesData(locationIds: Array<string>) {
    let httpParams = new HttpParams()
      .append('nodeGroupLocationIDs', locationIds.join(','));

    return this.http.post<any>('http://localhost:8080/api/v1/common_edges', httpParams, { reportProgress: true });
  }

  getHistogramData(matchID) {
    const httpParams = new HttpParams()
      .append('matchID', matchID);

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/histogram_data', { params: httpParams, reportProgress: true });
  }

  getScoreboardData(matchID, setIndex, gameIndex, pointIndex) {
    const httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('setIndex', setIndex)
      .append('gameIndex', gameIndex)
      .append('pointIndex', pointIndex);

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/scoreboard', { params: httpParams, reportProgress: true });
  }

  getCustomSituation(matchID, playerNumber, p1X1, p1Y1, p1X2, p1Y2, p2X1, p2Y1, p2X2, p2Y2) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', playerNumber)
      .append('p1X1', p1X1)
      .append('p1X2', p1X2)
      .append('p1Y1', p1Y1)
      .append('p1Y2', p1Y2)
      .append('p2X1', p2X1)
      .append('p2X2', p2X2)
      .append('p2Y1', p2Y1)
      .append('p2Y2', p2Y2);

    return this.http.get<any>('http://localhost:8080/api/v1/custom_situation', { params: httpParams, reportProgress: true });
  }

  getStandardSituations(matchID, playerNumber: string) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('playerNumber', playerNumber);

    return this.http.get<any>('http://localhost:8080/api/v1/standard_summary_situations', { params: httpParams, reportProgress: true });
  }

  getStatisticsForMatch(matchID) {
    let httpParams = new HttpParams()
      .append('matchID', matchID);

    return this.http.get<any>('http://localhost:8080/api/v1/stat_panel_match', { params: httpParams, reportProgress: true });
  }

  getStatisticsForStandard(matchID, hittingPlayerNumber, p1LRCode, p1DepthCode, p2LRCode, p2DepthCode) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', hittingPlayerNumber)
      .append('p1LRCode', p1LRCode)
      .append('p1DepthCode', p1DepthCode)
      .append('p2LRCode', p2LRCode)
      .append('p2DepthCode', p2DepthCode);

    return this.http.get<any>('http://localhost:8080/api/v1/stat_panel_standard', { params: httpParams, reportProgress: true });
  }

  getStatisticsForCustom(matchID, hittingPlayerNumber, p1RectCoordinates, p2RectCoordinates) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', hittingPlayerNumber)
      .append('p1X1', p1RectCoordinates[0])
      .append('p1Y1', p1RectCoordinates[1])
      .append('p1X2', p1RectCoordinates[2])
      .append('p1Y2', p1RectCoordinates[3])
      .append('p2X1', p2RectCoordinates[0])
      .append('p2Y1', p2RectCoordinates[1])
      .append('p2X2', p2RectCoordinates[2])
      .append('p2Y2', p2RectCoordinates[3]);

    return this.http.get<any>('http://localhost:8080/api/v1/stat_panel_custom', { params: httpParams, reportProgress: true });
  }

  getLinearStandardSituationShots(matchID, hittingPlayerNumber, p1LRCode, p1DepthCode, p2LRCode, p2DepthCode) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', hittingPlayerNumber)
      .append('p1LRCode', p1LRCode)
      .append('p1DepthCode', p1DepthCode)
      .append('p2LRCode', p2LRCode)
      .append('p2DepthCode', p2DepthCode);

    return this.http.get<any>('http://localhost:8080/api/v1/standard_situation_shots', { params: httpParams, reportProgress: true });
  }

  getLinearCustomSituationShots(matchID, hittingPlayerNumber, p1X1, p1Y1, p1X2, p1Y2, p2X1, p2Y1, p2X2, p2Y2) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', hittingPlayerNumber)
      .append('p1X1', p1X1)
      .append('p1X2', p1X2)
      .append('p1Y1', p1Y1)
      .append('p1Y2', p1Y2)
      .append('p2X1', p2X1)
      .append('p2X2', p2X2)
      .append('p2Y1', p2Y1)
      .append('p2Y2', p2Y2);

    return this.http.get<any>('http://localhost:8080/api/v1/custom_situation_shots', { params: httpParams, reportProgress: true });
  }

  getNodeLinkStandardSituationShots(matchID, hittingPlayerNumber, p1LRCode, p1DepthCode, p2LRCode, p2DepthCode) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', hittingPlayerNumber)
      .append('p1LRCode', p1LRCode)
      .append('p1DepthCode', p1DepthCode)
      .append('p2LRCode', p2LRCode)
      .append('p2DepthCode', p2DepthCode);

    return this.http.get<any>('http://localhost:8080/api/v1/nodegroup_array_standard', { params: httpParams, reportProgress: true });
  }

  getNodeLinkCustomSituationShots(matchID, hittingPlayerNumber, p1X1, p1Y1, p1X2, p1Y2, p2X1, p2Y1, p2X2, p2Y2) {
    let httpParams = new HttpParams()
      .append('matchID', matchID)
      .append('hittingPlayerNumber', hittingPlayerNumber)
      .append('p1X1', p1X1)
      .append('p1X2', p1X2)
      .append('p1Y1', p1Y1)
      .append('p1Y2', p1Y2)
      .append('p2X1', p2X1)
      .append('p2X2', p2X2)
      .append('p2Y1', p2Y1)
      .append('p2Y2', p2Y2);

    return this.http.get<any>('http://localhost:8080/api/v1/nodegroup_array_custom', { params: httpParams, reportProgress: true });
  }

  /*
  getShots() {
    const httpParams = new HttpParams();

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/shots', { params: httpParams, reportProgress: true });
  }

  getP1ShotsWith(serves, rally, returns) {
    let httpParams = new HttpParams()
      .append('serves', serves)
      .append('rally', rally)
      .append('returns', returns);

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/shots/p1', { params: httpParams, reportProgress: true });
  }

  getP2PositionsWith(serves, rally, returns) {
    let httpParams = new HttpParams()
      .append('serves', serves)
      .append('rally', rally)
      .append('returns', returns);

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/shots/p2', { params: httpParams, reportProgress: true });
  }

  getServes() {
    const httpParams = new HttpParams();

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/shots/serves', { params: httpParams, reportProgress: true });
  }

  getWonShots() {
    const httpParams = new HttpParams();

    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/shots/last', { params: httpParams, reportProgress: true });
  }
  */

  /*
  getCustomSitutations() {
    // Get shots entities from backend
    return this.http.get<any>('http://localhost:8080/api/v1/shots/last', { params: httpParams, reportProgress: true });
  }
  */
}
