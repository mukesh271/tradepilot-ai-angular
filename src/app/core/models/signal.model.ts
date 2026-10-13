import { Instrument } from './instrument.model';
import { Strategy } from './strategy.model';

export enum SignalDirection {
  Bullish = 1,
  Bearish = 2,
  Neutral = 3
}

export enum SignalStatus {
  Detected = 1,
  Alerted = 2,
  Confirmed = 3,
  Expired = 4,
  Invalidated = 5
}

export interface SignalCondition {
  id: number;
  signalId: number;
  name: string;
  score: number;
  passed: boolean;
  explanation: string;
  createdAtUtc: string;
}

export interface Signal {
  id: number;
  instrumentId: number;
  instrument?: Instrument;
  strategyId: number;
  strategy?: Strategy;
  direction: SignalDirection;
  signalScore: number;
  entryPrice: number;
  stopLoss: number;
  target: number;
  riskRewardRatio: number;
  timeFrame: string;
  explanation: string;
  status: SignalStatus;
  createdAtUtc: string;
  expiresAtUtc?: string;
  conditions?: SignalCondition[];
}
