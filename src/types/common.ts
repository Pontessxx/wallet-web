export type PeriodType = 'range' | 'monthly' | 'yearly';

export interface RangePeriodQuery {
  periodType: 'range';
  startDate: string;
  endDate: string;
}

export interface MonthlyPeriodQuery {
  periodType: 'monthly';
  year: number;
  month: number;
}

export interface YearlyPeriodQuery {
  periodType: 'yearly';
  year: number;
}

export type PeriodQuery = RangePeriodQuery | MonthlyPeriodQuery | YearlyPeriodQuery;

export interface ApiErrorResponse {
  message?: string;
  title?: string;
  detail?: string;
  status?: number;
}
