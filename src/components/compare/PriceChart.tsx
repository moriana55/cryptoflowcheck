"use client";
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, LineStyle, LineSeries } from "lightweight-charts";

interface ChartDataPoint {
  time: number;
  value: number;
}

interface PriceChartProps {
  coinAId: string;
  coinBId: string;
  coinASymbol: string;
  coinBSymbol: string;
  days: number;
  onDaysChange: (days: number) => void;
}

export function PriceChart({ coinAId, coinBId, coinASymbol, coinBSymbol, days, onDaysChange }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartRef.current || !coinAId || !coinBId) return;

    setLoading(true);

    fetch(`/api/coins/market-chart?ids=${coinAId},${coinBId}&days=${days}`)
      .then((r) => r.json())
      .then((results: { id: string; prices: [number, number][] }[]) => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
          chartInstance.current.remove();
          chartInstance.current = null;
        }

        const chart = createChart(chartRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: "transparent" },
            textColor: "#8E96A4",
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
          },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.03)" },
            horzLines: { color: "rgba(255,255,255,0.03)" },
          },
          crosshair: {
            vertLine: { color: "rgba(0,242,255,0.3)", width: 1, style: LineStyle.Dashed },
            horzLine: { color: "rgba(0,242,255,0.3)", width: 1, style: LineStyle.Dashed },
          },
          rightPriceScale: {
            borderColor: "rgba(255,255,255,0.05)",
            visible: true,
          },
          leftPriceScale: {
            borderColor: "rgba(255,255,255,0.05)",
            visible: true,
          },
          timeScale: {
            borderColor: "rgba(255,255,255,0.05)",
            timeVisible: days <= 7,
          },
          width: chartRef.current.clientWidth,
          height: 400,
        });

        const coinAData = results.find((r) => r.id === coinAId);
        const coinBData = results.find((r) => r.id === coinBId);

        if (coinAData?.prices.length) {
          const seriesA = chart.addSeries(LineSeries, {
            color: "#00F2FF",
            lineWidth: 2,
            priceScaleId: "right",
            crosshairMarkerBackgroundColor: "#00F2FF",
          });
          seriesA.setData(
            coinAData.prices.map(([t, v]) => ({
              time: Math.floor(t / 1000) as any,
              value: v,
            }))
          );
        }

        if (coinBData?.prices.length) {
          const seriesB = chart.addSeries(LineSeries, {
            color: "#9D00FF",
            lineWidth: 2,
            priceScaleId: "left",
            crosshairMarkerBackgroundColor: "#9D00FF",
          });
          seriesB.setData(
            coinBData.prices.map(([t, v]) => ({
              time: Math.floor(t / 1000) as any,
              value: v,
            }))
          );
        }

        chart.timeScale().fitContent();
        chartInstance.current = chart;

        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            chart.applyOptions({ width: entry.contentRect.width });
          }
        });
        observer.observe(chartRef.current);

        setLoading(false);

        return () => observer.disconnect();
      })
      .catch(() => setLoading(false));

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, [coinAId, coinBId, days]);

  const timeframes = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "1Y", value: 365 },
  ];

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase pl-3 border-l-2 border-accent-cyan">
          Price Chart
        </div>
        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onDaysChange(tf.value)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                days === tf.value
                  ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                  : "text-text-secondary hover:text-white border border-transparent"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] bg-accent-cyan rounded" />
          <span className="text-[10px] font-black text-accent-cyan uppercase">{coinASymbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] bg-accent-purple rounded" />
          <span className="text-[10px] font-black text-accent-purple uppercase">{coinBSymbol}</span>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-card/50 z-10 rounded-xl">
            <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest animate-pulse">
              Loading chart data...
            </div>
          </div>
        )}
        <div ref={chartRef} className="w-full rounded-xl overflow-hidden" />
      </div>
    </div>
  );
}
