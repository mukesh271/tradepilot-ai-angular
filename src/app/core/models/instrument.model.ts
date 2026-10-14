export enum InstrumentType {
  Equity = 1,
  Future = 2,
  Option = 3
}

export interface Instrument {
  id: number;
  symbol: string;
  exchange: string;
  type: InstrumentType | string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  underlyingSymbol?: string;
  expiryDate?: string;
  strikePrice?: number;
  optionType?: string;
  lotSize?: number;
}
