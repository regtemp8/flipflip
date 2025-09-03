import { FilePickerItem } from './FilePickerItem';

export type FilePickerData = {
  path: string;
  sep: string;
  items: FilePickerItem[];
};
