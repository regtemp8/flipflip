export type DisplayView = {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  visible: boolean;
};

export const initialView: DisplayView = {
  id: 0,
  name: 'New View',
  x: 0,
  y: 0,
  z: 0,
  width: 10,
  height: 10,
  color: '',
  opacity: 100,
  visible: true,
};

export function newDisplayView(init?: Partial<DisplayView>) {
  return {
    id: init?.id ?? initialView.id,
    name: init?.name ?? initialView.name,
    x: init?.x ?? initialView.x,
    y: init?.y ?? initialView.y,
    z: init?.z ?? initialView.z,
    width: init?.width ?? initialView.width,
    height: init?.height ?? initialView.height,
    color: init?.color ?? initialView.color,
    opacity: init?.opacity ?? initialView.opacity,
    visible: init?.visible ?? initialView.visible,
  };
}
