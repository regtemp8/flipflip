import { DisplayView, newDisplayView } from './DisplayView';

export type Display = {
  id: number;
  name?: string;
  views: DisplayView[];
  selectedView?: number;
  displayViewsListYOffset: number;
};

export const initialDisplay: Display = {
  id: 0,
  views: [],
  displayViewsListYOffset: 0,
};

export function newDisplay(init?: Partial<Display>) {
  return {
    id: init?.id ?? initialDisplay.id,
    name: init?.name,
    views: mapViews(init?.views),
    selectedView: init?.selectedView,
    displayViewsListYOffset:
      init?.displayViewsListYOffset ?? initialDisplay.displayViewsListYOffset,
  };
}

function mapViews(views?: Partial<DisplayView>[]): DisplayView[] {
  return views != null ? views.map(newDisplayView) : initialDisplay.views;
}
