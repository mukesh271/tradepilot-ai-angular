import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import {
  CandlestickData,
  CandlestickSeries,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  UTCTimestamp
} from 'lightweight-charts';
import { Candle, TechnicalAnalysisTimeframe } from '../../core/models/technical-analysis.model';

@Component({
  selector: 'app-candlestick-chart',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <section class="chart-panel" aria-label="Historical candlestick chart">
      <header class="chart-heading">
        <div>
          <h2>Historical candles <span>{{ timeframe }}</span></h2>
          <p>Historical stored candles · latest candle {{ latestCandleAt ? (latestCandleAt | date:'medium') : 'N/A' }}</p>
        </div>
        <span class="chart-key"><i></i> Volume</span>
      </header>
      <div class="chart-wrap">
        <div #chartHost class="chart-host"></div>
        <div *ngIf="!candles.length" class="chart-empty" role="status">No candles available for this instrument and timeframe.</div>
      </div>
      <div class="ohlc" aria-live="polite">{{ hoverText }}</div>
    </section>
  `,
  styles: [
    '.chart-panel { min-width:0; border:1px solid var(--border); border-radius:18px; background:rgba(17,28,46,.78); padding:1rem; }',
    '.chart-heading { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:.7rem; }',
    'h2 { font-size:1.05rem; margin:0; }',
    'h2 span { color:var(--primary); font-size:.8rem; margin-left:.35rem; }',
    'p { color:var(--muted); margin:.35rem 0 0; font-size:.8rem; }',
    '.chart-key { color:var(--muted); font-size:.78rem; white-space:nowrap; }',
    '.chart-key i { display:inline-block; width:9px; height:9px; border-radius:2px; background:#5eead4; margin-right:.35rem; }',
    '.chart-host { width:100%; min-width:0; height:360px; }',
    '.chart-wrap { position:relative; min-width:0; }',
    '.chart-empty { position:absolute; inset:0; min-height:250px; display:grid; place-items:center; color:var(--muted); text-align:center; background:#111c2e; }',
    '.ohlc { min-height:1.4rem; color:#cbd5e1; font-size:.78rem; margin-top:.45rem; }',
    '@media(max-width:600px) { .chart-panel { padding:.75rem; } .chart-host { height:290px; } .chart-heading { align-items:flex-start; } }'
  ]
})
export class CandlestickChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() candles: Candle[] = [];
  @Input() timeframe: TechnicalAnalysisTimeframe = '15m';
  @ViewChild('chartHost') private chartHost?: ElementRef<HTMLDivElement>;

  latestCandleAt: string | null = null;
  hoverText = 'Hover a candle to inspect time and OHLC values.';

  private chart?: IChartApi;
  private candleSeries?: ISeriesApi<'Candlestick'>;
  private resizeObserver?: ResizeObserver;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
    if (this.chartHost) {
      this.resizeObserver = new ResizeObserver(() => this.chart?.applyOptions({ width: this.chartHost?.nativeElement.clientWidth ?? 0 }));
      this.resizeObserver.observe(this.chartHost.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candles']) {
      this.latestCandleAt = this.candles[this.candles.length - 1]?.timestamp ?? null;
      this.hoverText = 'Hover a candle to inspect time and OHLC values.';
    }
    if (this.viewReady && (changes['candles'] || changes['timeframe'])) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.remove();
  }

  private renderChart(): void {
    this.chart?.remove();
    this.chart = undefined;
    this.candleSeries = undefined;
    const host = this.chartHost?.nativeElement;
    if (!host || !this.candles.length) return;

    const backgroundColor = '#111c2e';
    this.chart = createChart(host, {
      width: host.clientWidth,
      height: host.clientHeight,
      layout: { background: { color: backgroundColor }, textColor: '#a7b5c9', attributionLogo: false },
      grid: { vertLines: { color: 'rgba(148,163,184,.08)' }, horzLines: { color: 'rgba(148,163,184,.08)' } },
      rightPriceScale: { borderColor: 'rgba(148,163,184,.2)' },
      timeScale: { borderColor: 'rgba(148,163,184,.2)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 }
    });

    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#f87171'
    });
    const volumeSeries = this.chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false
    });
    this.chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, visible: false });

    const candleData: CandlestickData<UTCTimestamp>[] = this.candles.map((candle) => ({
      time: Math.floor(new Date(candle.timestamp).getTime() / 1000) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    }));
    this.candleSeries.setData(candleData);
    volumeSeries.setData(this.candles.map((candle, index) => ({
      time: candleData[index].time,
      value: candle.volume,
      color: candle.close >= candle.open ? 'rgba(34,197,94,.35)' : 'rgba(248,113,113,.35)'
    })));
    this.chart.timeScale().fitContent();
    this.chart.subscribeCrosshairMove((param) => {
      if (!param.time || !this.candleSeries) {
        this.hoverText = 'Hover a candle to inspect time and OHLC values.';
        return;
      }
      const selected = param.seriesData.get(this.candleSeries) as CandlestickData<UTCTimestamp> | undefined;
      if (!selected) return;
      const timestamp = new Date(Number(param.time) * 1000).toLocaleString();
      this.hoverText = `${timestamp} · O ${selected.open.toFixed(2)} · H ${selected.high.toFixed(2)} · L ${selected.low.toFixed(2)} · C ${selected.close.toFixed(2)}`;
    });
  }
}
