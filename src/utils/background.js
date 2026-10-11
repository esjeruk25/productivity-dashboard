export const BG_ORDER = ['aurora', 'grid', 'off']
export const BG_LABELS = { aurora: 'Aurora', grid: 'Grid', off: 'Polos' }
export const nextBg = (v) => BG_ORDER[(BG_ORDER.indexOf(v) + 1) % BG_ORDER.length]