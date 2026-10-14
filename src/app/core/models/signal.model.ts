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
  instrumentSymbol?: string;
  strategyId: number;
  strategy?: Strategy;
  strategyName?: string;
  statusLabel?: string;
  direction: SignalDirection;
  signalScore: number;
  entryPrice: number;
  stopLoss: number;
  target: number;
  riskRewardRatio: number;
  timeFrame: string;
  explanation: string;
  status: SignalStatus | string;
  createdAtUtc: string;
  expiresAtUtc?: string;
  conditions?: SignalCondition[];
}

export interface SignalDto {
  id: number;
  instrumentId: number;
  instrumentSymbol: string;
  strategyId: number;
  strategyName: string;
  direction: 'Bullish' | 'Bearish' | 'Neutral' | string;
  signalScore: number;
  entryPrice: number;
  stopLoss: number;
  target: number;
  riskRewardRatio: number;
  timeFrame: string;
  explanation: string;
  status: 'Detected' | 'Active' | 'Expired' | string;
  createdAtUtc: string;
  expiresAtUtc: string | null;
  conditions: Array<{
    id: number;
    name: string;
    score: number;
    passed: boolean;
    explanation: string;
    createdAtUtc: string;
  }>;
}

export interface CreateSignalRequest {
  instrumentId: number;
  strategyId: number;
  direction: 'Bullish' | 'Bearish' | 'Neutral';
  signalScore: number;
  entryPrice: number;
  stopLoss: number;
  target: number;
  timeFrame: string;
  explanation: string;
  expiresAtUtc: string | null;
  conditions: Array<{
    name: string;
    score: number;
    passed: boolean;
    explanation: string;
  }>;
}
