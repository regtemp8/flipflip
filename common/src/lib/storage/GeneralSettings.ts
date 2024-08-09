import { WC } from '../const';

export type GeneralSettings = {
  [key: string]: boolean | number | string;

  prioritizePerformance: boolean;
  portableMode: boolean;
  disableLocalSave: boolean;
  confirmSceneDeletion: boolean;
  confirmBlacklist: boolean;
  confirmFileDeletion: boolean;
  autoBackup: boolean;
  autoBackupDays: number;
  autoCleanBackup: boolean;
  autoCleanBackupDays: number;
  autoCleanBackupWeeks: number;
  autoCleanBackupMonths: number;
  cleanRetain: number;
  watermark: boolean;
  watermarkGrid: boolean;
  watermarkCorner: string;
  watermarkText: string;
  watermarkFontFamily: string;
  watermarkFontSize: number;
  watermarkColor: string;
};

export const initialGeneralSettings: GeneralSettings = {
  prioritizePerformance: true,
  portableMode: false,
  disableLocalSave: false,
  confirmSceneDeletion: true,
  confirmBlacklist: true,
  confirmFileDeletion: true,
  autoBackup: false,
  autoBackupDays: 1,
  autoCleanBackup: false,
  autoCleanBackupDays: 14,
  autoCleanBackupWeeks: 8,
  autoCleanBackupMonths: 6,
  cleanRetain: 1,
  watermark: false,
  watermarkGrid: false,
  watermarkCorner: WC.bottomRight,
  watermarkText: '',
  watermarkFontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
  watermarkFontSize: 14,
  watermarkColor: '#FFFFFF',
};
