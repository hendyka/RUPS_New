export type CategoryType = 'pra' | 'hari-h' | 'pasca' | 'dividen' | 'dividen-rec';

export interface TimelineItem {
  id: string;
  title: string;
  desc: string;
  date: string; // YYYY-MM-DD
  category: CategoryType;
  isMain?: boolean;
  legalBasis?: string;
  notes?: string;
}

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  dayName?: string;
}

export type ViewMode = 'table' | 'visual' | 'calendar';

export interface AlertNotification {
  id: string;
  text: string;
  type: 'success' | 'alert' | 'error';
}
