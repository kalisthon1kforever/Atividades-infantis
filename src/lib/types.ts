/** Conteúdo da ficha: open-ended — cada padrão usa chaves distintas */
export type CatalogActivityData = {
  pattern?: string;
  [key: string]: unknown;
};

export type Activity = {
  id: string;
  title: string;
  summary: string;
  category: string;
  duration_min: number;
  age_min: number;
  age_max: number;
  format: "imprimir" | "tela" | "ambos";
  bw: boolean;
  audience: "familia" | "professor";
  product_key: string;
  tags: string[];
  data?: CatalogActivityData | null;
  is_published?: boolean;
};

export type LeadRow = {
  id: string;
  email: string;
  name: string;
  channel: string;
  answers: Record<string, { key?: string; label?: string }> | Record<string, unknown>;
  sample_url?: string;
  converted?: boolean;
  purchased?: string[];
  note?: string;
  created_at?: string;
  updated_at?: string;
};

export type EntitlementRow = {
  user_id: string;
  product: string;
  source: string;
  created_at?: string;
};

export type ProfileRow = {
  user_id: string;
  name: string;
  last_access?: string;
  created_at?: string;
};

export type ChildRow = {
  id: string;
  user_id: string;
  name: string;
  age: number;
  created_at?: string;
};

export type ProgressRow = {
  user_id: string;
  activity_id: string;
  log_date: string;
  completed_at?: string;
};

export type FavoriteRow = {
  user_id: string;
  activity_id: string;
  created_at?: string;
};

export type TrailRow = {
  user_id: string;
  day: number;
  completed: boolean;
  completed_at?: string | null;
};
