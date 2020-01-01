export interface IBufferLayout {
  id: string;
  elements: number;
  names?: string[];
}

export const BufferLayouts: IBufferLayout[] = [
  { id: 'vec2', elements: 2, names: ['x', 'y'] },
  { id: 'vec3', elements: 3, names: ['x', 'y', 'z'] },
  { id: 'vec4', elements: 4, names: ['x', 'y', 'z', 'w'] },
  { id: 'rgb', elements: 3, names: ['r', 'g', 'b'] },
  { id: 'rgba', elements: 4, names: ['r', 'g', 'b', 'a'] },
  { id: 'mat2', elements: 4 },
  { id: 'mat3', elements: 9 },
  { id: 'mat4', elements: 16 },
];
