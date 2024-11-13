export type CleanBackupsRequest =
  | DefaultCleanBackupsRequest
  | AutoCleanBackupsRequest;

export type DefaultCleanBackupsRequest = {
  cleanRetain: number;
};

export type AutoCleanBackupsRequest = {
  autoCleanBackupDays: number;
  autoCleanBackupWeeks: number;
  autoCleanBackupMonths: number;
};
