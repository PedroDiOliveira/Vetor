export interface BoardColumn {
  id: string;
  name: string;
  icon: string;
  color: string;
  cssVar: string;
}

export const COLUMNS: BoardColumn[] = [
  { id: 'desenvolvimento', name: 'Desenvolvimento', icon: 'lucideCode',       color: '#3B82F6', cssVar: '--col-desenvolvimento' },
  { id: 'comercial',       name: 'Comercial',       icon: 'lucideBarChart',   color: '#F59E0B', cssVar: '--col-comercial' },
  { id: 'infra',           name: 'Infra',           icon: 'lucideServer',     color: '#10B981', cssVar: '--col-infra' },
  { id: 'estudo',          name: 'Estudo',          icon: 'lucideBookOpen',   color: '#8B5CF6', cssVar: '--col-estudo' },
  { id: 'suporte',         name: 'Suporte',         icon: 'lucideHeadphones', color: '#F97316', cssVar: '--col-suporte' },
  { id: 'gestao',          name: 'Gestão',          icon: 'lucideLayers',     color: '#06B6D4', cssVar: '--col-gestao' },
  { id: 'disponivel',      name: 'Disponível',      icon: 'lucideCircle',     color: '#6B7280', cssVar: '--col-disponivel' }
];

export const DEFAULT_COLUMN = 'disponivel';

export function getColumn(id: string): BoardColumn {
  return COLUMNS.find((c) => c.id === id) ?? COLUMNS[COLUMNS.length - 1];
}
