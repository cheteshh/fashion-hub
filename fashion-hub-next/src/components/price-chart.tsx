"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, Legend
} from "recharts";
import { PlatformListing, PLATFORM_META, formatINR } from "@/lib/api";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface PriceChartProps {
  platforms: PlatformListing[];
}

const DAYS_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "60D", days: 60 },
  { label: "All", days: 999 },
];

const COLORS = ["#a855f7", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export default function PriceChart({ platforms }: PriceChartProps) {
  const [selectedDays, setSelectedDays] = useState(30);

  const { chartData, platformsWithHistory, lowestPrice, highestPrice } = useMemo(() => {
    const sinceDate = selectedDays === 999 ? new Date(0) : new Date(Date.now() - selectedDays * 24 * 60 * 60 * 1000);
    const platformsWithHistory = platforms.filter(p => p.priceHistory && p.priceHistory.length > 0);

    const timelineMap = new Map<string, ChartDataPoint>();

    platformsWithHistory.forEach(platform => {
      const meta = PLATFORM_META[platform.platformDomain];
      const label = meta?.label || platform.platformDomain;

      const filtered = (platform.priceHistory || [])
        .filter(r => new Date(r.timestamp) >= sinceDate)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Sample every Nth point to keep chart readable (max 60 points)
      const step = Math.max(1, Math.floor(filtered.length / 60));
      filtered.filter((_, i) => i % step === 0).forEach(record => {
        const d = new Date(record.timestamp);
        const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        if (!timelineMap.has(dateStr)) {
          timelineMap.set(dateStr, { date: dateStr } as ChartDataPoint);
        }
        timelineMap.get(dateStr)![label] = record.priceRecorded;
      });
    });

    const chartData = Array.from(timelineMap.values());

    let lowestPrice = Infinity;
    let highestPrice = 0;
    platformsWithHistory.forEach(p => {
      (p.priceHistory || []).forEach(r => {
        lowestPrice = Math.min(lowestPrice, r.priceRecorded);
        highestPrice = Math.max(highestPrice, r.priceRecorded);
      });
    });

    return { chartData, platformsWithHistory, lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice, highestPrice };
  }, [platforms, selectedDays]);

  if (platformsWithHistory.length === 0) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: 200 }}>
        <p className="text-white/30 text-sm">Price history not available yet</p>
      </div>
    );
  }

  // Compute trend for each platform (first vs last price)
  const trends = platformsWithHistory.map(p => {
    const hist = (p.priceHistory || []).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (hist.length < 2) return { platform: p.platformDomain, trend: 0 };
    const diff = hist[hist.length - 1].priceRecorded - hist[0].priceRecorded;
    return { platform: p.platformDomain, trend: diff };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card rounded-xl p-3 shadow-2xl text-[12px]" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
        <p className="text-white/50 mb-2 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-white/70">{entry.name}:</span>
            <span className="text-white font-semibold">{formatINR(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[13px] font-semibold text-white/80">Price History</h3>
          <p className="text-[11px] text-white/30 mt-0.5">
            All-time low: <span className="text-green-400 font-semibold">{formatINR(lowestPrice)}</span>
            {" · "}All-time high: <span className="text-red-400 font-semibold">{formatINR(highestPrice)}</span>
          </p>
        </div>

        {/* Days selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {DAYS_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => setSelectedDays(opt.days)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedDays === opt.days
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={selectedDays === opt.days ? { background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        {trends.map(({ platform, trend }, i) => {
          const meta = PLATFORM_META[platform];
          return (
            <div key={platform} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg" style={{ background: meta?.bgColor || 'rgba(255,255,255,0.05)' }}>
              <span style={{ color: meta?.color || COLORS[i] }} className="font-semibold">{meta?.label || platform}</span>
              {trend > 0 ? <TrendingUp className="w-3 h-3 text-red-400" /> : trend < 0 ? <TrendingDown className="w-3 h-3 text-green-400" /> : <Minus className="w-3 h-3 text-white/40" />}
              <span className={trend > 0 ? "text-red-400" : trend < 0 ? "text-green-400" : "text-white/40"}>
                {trend > 0 ? "+" : ""}{formatINR(Math.abs(trend))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.15)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.15)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
              width={46}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={lowestPrice} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 4" />

            {platformsWithHistory.map((platform, i) => {
              const meta = PLATFORM_META[platform.platformDomain];
              const label = meta?.label || platform.platformDomain;
              const color = meta?.color || COLORS[i % COLORS.length];
              return (
                <Line
                  key={platform.platformDomain}
                  type="monotone"
                  dataKey={label}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-white/30 text-sm">No data for this period</p>
        </div>
      )}
    </div>
  );
}
