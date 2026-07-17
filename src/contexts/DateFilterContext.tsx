import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { PeriodQuery, PeriodType } from '@/types/common';

interface DateFilterContextType {
  mode: PeriodType;
  startDate: Date | null;
  endDate: Date | null;
  monthDate: Date;
  yearDate: Date;
  periodQuery: PeriodQuery;
  setMode: (mode: PeriodType) => void;
  setRange: (startDate: Date | null, endDate: Date | null) => void;
  setMonthDate: (date: Date) => void;
  setYearDate: (date: Date) => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

interface DateFilterProviderProps {
  children: ReactNode;
}

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return { startDate, endDate };
};

export const DateFilterProvider = ({ children }: DateFilterProviderProps) => {
  const now = new Date();
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [mode, setMode] = useState<PeriodType>('monthly');
  const [startDate, setStartDate] = useState<Date | null>(defaultRange.startDate);
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.endDate);
  const [monthDate, setMonthDate] = useState<Date>(now);
  const [yearDate, setYearDate] = useState<Date>(now);

  const periodQuery = useMemo<PeriodQuery>(() => {
    if (mode === 'range') {
      const safeStart = startDate ?? defaultRange.startDate;
      const safeEnd = endDate ?? safeStart;

      return {
        periodType: 'range',
        startDate: toDateOnly(safeStart),
        endDate: toDateOnly(safeEnd),
      };
    }

    if (mode === 'monthly') {
      return {
        periodType: 'monthly',
        year: monthDate.getFullYear(),
        month: monthDate.getMonth() + 1,
      };
    }

    return {
      periodType: 'yearly',
      year: yearDate.getFullYear(),
    };
  }, [defaultRange, endDate, mode, monthDate, startDate, yearDate]);

  const setRange = (nextStartDate: Date | null, nextEndDate: Date | null) => {
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
  };

  const value: DateFilterContextType = {
    mode,
    startDate,
    endDate,
    monthDate,
    yearDate,
    periodQuery,
    setMode,
    setRange,
    setMonthDate,
    setYearDate,
  };

  return <DateFilterContext.Provider value={value}>{children}</DateFilterContext.Provider>;
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter precisa ser usado dentro de um DateFilterProvider');
  }

  return context;
};
