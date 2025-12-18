import React, { memo, useEffect, useMemo, useState } from 'react';
import { RESUME_DATA } from '../constants';

const Timeline: React.FC = () => {
  const [animate, setAnimate] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const { events, startYear, totalDuration } = useMemo(() => {
    // Combine Education and Experience once (and keep stable across parent rerenders).
    const educationEvents = RESUME_DATA.education.map((edu) => ({
      id: edu.id,
      type: 'education' as const,
      period: edu.period,
      title: edu.degree,
      subtitle: edu.institution,
    }));

    const experienceEvents = RESUME_DATA.experience.map((exp) => ({
      id: exp.id,
      type: 'experience' as const,
      period: exp.period,
      title: exp.role,
      subtitle: exp.company,
    }));

    const allEvents = [...educationEvents, ...experienceEvents];

    const parsedEvents = allEvents
      .map((event) => {
        const yearMatch = event.period.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
        return { ...event, year };
      })
      .sort((a, b) => a.year - b.year)
      .filter((e) => e.year > 0);

    // Start the timeline a bit earlier for visual breathing room (prevents left clipping).
    const startYear = 2004;
    const endYear = new Date().getFullYear();
    const totalDuration = Math.max(1, endYear - startYear);

    return { events: parsedEvents, startYear, totalDuration };
  }, []);

  const getPosition = (year: number) => ((year - startYear) / totalDuration) * 100;

  const labelYears = useMemo(() => {
    const years = Array.from(new Set(events.map((e) => e.year))).sort((a, b) => a - b);
    return years;
  }, [events]);

  const positionedEvents = useMemo(() => {
    const byYear = new Map<number, typeof events>();
    events.forEach((e) => {
      const list = byYear.get(e.year) ?? [];
      list.push(e);
      byYear.set(e.year, list);
    });

    const items: Array<{
      event: (typeof events)[number];
      position: number;
      stackOffsetY: number;
      tooltipAlign: 'left' | 'center' | 'right';
      animDelayMs: number;
    }> = [];

    // Vertical spacing between stacked events in the same year.
    // Keep generous so each dot remains easy to hover/click.
    const stackGapPx = 22;
    const leftEdgeThreshold = 12;
    const rightEdgeThreshold = 88;

    // Keep stable ordering: education first, then experience, then by title/subtitle.
    const sortWithinYear = (a: (typeof events)[number], b: (typeof events)[number]) => {
      if (a.type !== b.type) return a.type === 'education' ? -1 : 1;
      const at = `${a.subtitle} ${a.title}`;
      const bt = `${b.subtitle} ${b.title}`;
      return at.localeCompare(bt);
    };

    Array.from(byYear.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([year, yearEvents]) => {
        const sorted = [...yearEvents].sort(sortWithinYear);
        const position = getPosition(year);
        const tooltipAlign: 'left' | 'center' | 'right' =
          position < leftEdgeThreshold ? 'left' : position > rightEdgeThreshold ? 'right' : 'center';

        const count = sorted.length;
        const center = (count - 1) / 2;

        sorted.forEach((event, i) => {
          const stackOffsetY = (i - center) * stackGapPx;
          items.push({
            event,
            position,
            stackOffsetY,
            tooltipAlign,
            animDelayMs: items.length * 150,
          });
        });
      });

    return items;
  }, [events, startYear, totalDuration]);

  // Only use staggered transition delays for the initial "pop-in" animation.
  // After that, remove delays so hover feels instant.
  useEffect(() => {
    if (!animate) {
      setHasAnimatedIn(false);
      return;
    }
    const count = positionedEvents.length;
    const lastDelayMs = Math.max(0, (count - 1) * 150);
    const timer = window.setTimeout(() => setHasAnimatedIn(true), lastDelayMs + 350);
    return () => window.clearTimeout(timer);
  }, [animate, positionedEvents.length]);

  return (
    <div className="w-full mt-10 mb-8 opacity-0 animate-fade-in overflow-visible" style={{ animationFillMode: 'forwards' }}>
      {/* Year annotations: only show years that exist in Education/Experience periods */}
      <div className="relative h-4 mb-3">
        {labelYears.map((year) => {
          const position = getPosition(year);
          // Clamp to prevent labels from being cut off at the edges.
          const left = `clamp(10px, ${position}%, calc(100% - 10px))`;
          return (
            <div
              key={year}
              className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider text-zinc-600 font-mono"
              style={{ left }}
            >
              {year}
            </div>
          );
        })}
      </div>
      
      <div className="relative w-full h-12 flex items-center group/timeline">
        {/* Base Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          {/* Animated Fill Line */}
          <div 
            className="h-full bg-gradient-to-r from-zinc-700 via-indigo-500 to-accent transition-all duration-[2000ms] ease-out rounded-full"
            style={{ width: animate ? '100%' : '0%' }}
          />
        </div>

        {/* Event Nodes */}
        {positionedEvents.map((p, index) => {
          const { event, position, stackOffsetY, tooltipAlign, animDelayMs } = p;
          // Keep the marker inside the container even when it's at the start/end of the range.
          const left = `clamp(6px, ${position}%, calc(100% - 6px))`;
          const isHovered = hoveredIndex === index;
          const isEducation = event.type === 'education';
          
          const tooltipPosClass =
            tooltipAlign === 'left'
              ? 'left-1/2 translate-x-0'
              : tooltipAlign === 'right'
                ? 'left-1/2 -translate-x-full'
                : 'left-1/2 -translate-x-1/2';

          const tooltipArrowPosClass =
            tooltipAlign === 'left'
              ? 'left-0 -translate-x-1/2'
              : tooltipAlign === 'right'
                ? 'right-0 translate-x-1/2 left-auto'
                : 'left-1/2 -translate-x-1/2';

          return (
            <div 
              key={event.id}
              className="absolute"
              style={{
                left,
                top: '50%',
                transform: `translate(-50%, -50%) translateY(${stackOffsetY}px)`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Dot (with slightly larger hit-area for easier hover) */}
              <div className="absolute inset-0 -m-2" aria-hidden="true" />
              <div 
                className={`w-3 h-3 rounded-full border-2 transition-all duration-150 z-10 relative cursor-pointer
                  ${animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  ${isHovered 
                    ? (isEducation ? 'bg-emerald-400 border-emerald-400 scale-125' : 'bg-accent border-accent scale-125')
                    : (isEducation ? 'bg-zinc-900 border-emerald-500/50' : 'bg-zinc-900 border-indigo-500/50')
                  }
                  ${!isHovered && hoveredIndex !== null ? 'opacity-50' : 'opacity-100'}
                `}
                style={{ transitionDelay: hasAnimatedIn ? '0ms' : `${animDelayMs}ms` }}
              />
              
              {/* Tooltip */}
              <div 
                className={`absolute bottom-full mb-3 ${tooltipPosClass} w-max max-w-[220px] 
                  px-3 py-2 bg-zinc-900 text-zinc-200 text-xs rounded-lg border border-zinc-800 shadow-xl
                  transition-all duration-120 z-50 pointer-events-none origin-bottom
                  ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}
                `}
              >
                <div className={`font-bold mb-0.5 ${isEducation ? 'text-emerald-400' : 'text-accent'}`}>
                  {event.year}
                </div>
                <div className="font-semibold truncate text-zinc-100">{event.subtitle}</div>
                <div className="text-zinc-400 text-[10px] leading-tight mt-0.5">{event.title}</div>
                
                {/* Tooltip Arrow */}
                <div className={`absolute top-full ${tooltipArrowPosClass} -mt-px border-4 border-transparent border-t-zinc-800`} />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-medium text-zinc-500 mt-[-5px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-indigo-500/50 bg-zinc-900"></div>
          <span>Experience</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-emerald-500/50 bg-zinc-900"></div>
          <span>Education</span>
        </div>
      </div>
    </div>
  );
};

export default memo(Timeline);
