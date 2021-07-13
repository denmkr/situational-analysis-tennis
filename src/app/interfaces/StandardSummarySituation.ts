import {Shot} from './Shot';

export interface StandardSummarySituation{
  p1DepthCode: number;
  p1LRCode: string;
  p2DepthCode: number;
  p2LRCode: string;
  hittingPlayerNumber: number;
  p1WinPercent: number;
  keySituationShots: Shot[];
}
