import { ClusteredShot } from './ClusteredShot';

export interface StandardShotSituation {
  p1DepthCode: number;
  p1LRCode: string;
  p2DepthCode: number;
  p2LRCode: string;
  hittingPlayerNumber: number;
  p1WinPercent: number;
  clusteredShots: ClusteredShot[];
}
