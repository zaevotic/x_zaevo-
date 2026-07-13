'use client';

import { useState, useEffect, useRef } from 'react';

// Build a 52-week grid aligned to real calendar days
function buildWeekGrid(cells: string[]) {
  const weeks: string[][] = [];
  for (let w = 0; w < 52; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      week.push(cells[idx] || '');
    }
    weeks.push(week);
  }
  return weeks;
}

// Generate month labels (approximate – based on 52 weeks ago to today)
function getMonthLabels() {
  const labels: ({ col: number; label: string } | null)[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  let currentMonth = -1;
  for (let w = 0; w < 52; w++) {
    const d = new Date(start);
    d.setDate(d.getDate() + w * 7);
    const m = d.getMonth();
    if (m !== currentMonth) {
      currentMonth = m;
      labels.push({ col: w, label: d.toLocaleString('default', { month: 'short' }) });
    } else {
      labels.push(null);
    }
  }
  return labels;
}

// Generate tooltip date for a cell
function getCellDate(weekIdx: number, dayIdx: number) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  const d = new Date(start);
  d.setDate(d.getDate() + weekIdx * 7 + dayIdx);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const LEVEL_COLORS: Record<string, string> = {
  '':  'var(--bg3)', 
  l1:  'var(--red-mute)',
  l2:  'var(--red-dim)',
  l3:  'var(--red)',
  l4:  'var(--red-ember)',
};

// Layout constants (in pixels)
const CELL_SIZE = 12;
const GAP = 3;
const DAY_LABEL_WIDTH = 28;
const DAY_LABEL_GAP = 6;
const MONTH_LABEL_HEIGHT = 20;

export default function GithubHeatmap() {
  const [data, setData] = useState({ cells: Array(364).fill(''), counts: Array(364).fill(0), commits: 0, streak: 0 });
  const [tooltip, setTooltip] = useState<{ x: number, y: number, count: number, date: string } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate mock data since /api/github doesn't exist yet, preserving theme styling
    const mockCells = Array(364).fill('');
    const mockCounts = Array(364).fill(0);
    const LEVELS = ['', '', '', 'l1', 'l1', 'l2', 'l3', 'l4'];
    let commits = 0;
    
    for (let i = 0; i < 364; i++) {
      const r = Math.random();
      if (r > 0.6) {
        const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
        mockCells[i] = level;
        if (level === 'l1') mockCounts[i] = 1 + Math.floor(Math.random() * 2);
        if (level === 'l2') mockCounts[i] = 3 + Math.floor(Math.random() * 3);
        if (level === 'l3') mockCounts[i] = 6 + Math.floor(Math.random() * 4);
        if (level === 'l4') mockCounts[i] = 10 + Math.floor(Math.random() * 10);
        commits += mockCounts[i];
      }
    }
    
    // Calculate actual longest streak from mock data
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < 364; i++) {
      if (mockCounts[i] > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }
    
    setData({ cells: mockCells, counts: mockCounts, commits: commits || 347, streak: maxStreak });
  }, []);

  const weeks = buildWeekGrid(data.cells);
  const monthLabels = getMonthLabels();

  const handleCellEnter = (e: React.MouseEvent<SVGRectElement>, weekIdx: number, dayIdx: number, level: string) => {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const index = weekIdx * 7 + dayIdx;
    const count = data.counts?.[index] ?? 0;
    const date = getCellDate(weekIdx, dayIdx);
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 6, count, date });
  };

  const handleCellLeave = () => setTooltip(null);

  const streakLabel = data.streak > 0 ? `${data.streak}d` : '—';

  const colX = DAY_LABEL_WIDTH + DAY_LABEL_GAP;
  const weekWidth = CELL_SIZE + GAP;
  const gridWidth = 52 * CELL_SIZE + 51 * GAP; 
  const gridHeight = 7 * CELL_SIZE + 6 * GAP; 
  const topPadding = MONTH_LABEL_HEIGHT; 

  const svgWidth = colX + gridWidth;
  const svgHeight = topPadding + gridHeight;

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const renderDayLabels = () => {
    return dayLabels.map((d, i) => {
      if (i % 2 === 0) return null; // hide even indices
      const y = topPadding + i * weekWidth + CELL_SIZE / 2;
      return (
        <text
          key={i}
          x={DAY_LABEL_WIDTH - 2}
          y={y}
          fill="var(--text3)"
          fontSize={10}
          fontFamily="var(--mono)"
          textAnchor="end"
          dominantBaseline="central"
        >
          {d}
        </text>
      );
    });
  };

  const renderMonthLabels = () => {
    return monthLabels.map((ml, i) => {
      if (!ml) return null;
      const x = colX + ml.col * weekWidth; 
      return (
        <text
          key={i}
          x={x}
          y={12}
          fill="var(--text3)"
          fontSize={10}
          fontFamily="var(--mono)"
          textAnchor="start"
          dominantBaseline="auto"
        >
          {ml.label}
        </text>
      );
    });
  };

  const renderCells = () => {
    const cells = [];
    for (let wi = 0; wi < weeks.length; wi++) {
      const week = weeks[wi];
      for (let di = 0; di < week.length; di++) {
        const level = week[di];
        const x = colX + wi * weekWidth;
        const y = topPadding + di * weekWidth;
        cells.push(
          <rect
            key={`${wi}-${di}`}
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            rx={2}
            ry={2}
            fill={LEVEL_COLORS[level] || 'var(--border)'}
            style={{ 
              outline: level === 'l4' ? '1px solid var(--red-ember)' : 'none',
              outlineOffset: -1,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => handleCellEnter(e, wi, di, level)}
            onMouseLeave={handleCellLeave}
            className="transition-opacity duration-150 hover:opacity-75"
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="w-full relative mt-[8px]">
      <div className="overflow-x-auto pb-[10px] custom-scrollbar">
        <div style={{ width: svgWidth }}>
          <svg
            className="block"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            width={svgWidth}
            height={svgHeight}
            preserveAspectRatio="xMidYMid meet"
          >
            {renderDayLabels()}
            {renderCells()}
            <g>{renderMonthLabels()}</g>
          </svg>

          <div className="flex items-center justify-between mt-[14px]">
            {/* Legend */}
            <div className="flex items-center gap-[4px] text-[10px]" style={{ color: 'var(--text3)' }}>
              <span>Less</span>
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: LEVEL_COLORS[''] }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: LEVEL_COLORS.l1 }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: LEVEL_COLORS.l2 }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: LEVEL_COLORS.l3 }} />
              <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: LEVEL_COLORS.l4, outline: '1px solid var(--red-ember)', outlineOffset: -1 }} />
              <span>More</span>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-[12px] text-[10px]">
              <span style={{ color: 'var(--text2)' }}>
                <b style={{ color: 'var(--red-ember)' }}>{data.commits}</b> contributions this year
              </span>
              <span style={{ color: 'var(--border2)' }}>·</span>
              <span style={{ color: 'var(--text2)' }}>
                <b style={{ color: 'var(--red-ember)' }}>{streakLabel}</b> streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none whitespace-nowrap transform -translate-x-1/2 -translate-y-full flex flex-col items-center p-[6px_10px] rounded-[4px] text-[11px] shadow-lg border"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y,
            background: 'var(--bg2)',
            borderColor: 'var(--border)',
            fontFamily: 'var(--sans)',
            color: 'var(--text)'
          }}
        >
          <span className="font-semibold mb-[2px]">
            {tooltip.count === 0 ? 'No contributions' : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
          </span>
          <span style={{ color: 'var(--text3)', fontSize: '10px' }}>{tooltip.date}</span>
        </div>
      )}
    </div>
  );
}
