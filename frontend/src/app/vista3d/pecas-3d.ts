import { TipoComponente } from '../core/modelos';

export const LARGURA = 380;
export const ALTURA = 360;

const S = 2.2, OX = 150, OY = 160;
type Pt = [number, number];

const P3 = (u: number, v: number, z = 0): Pt => [OX + (u - v) * S, OY + (u + v) * S / 2 - z * S];
const f = ([x, y]: Pt) => `${x.toFixed(1)},${y.toFixed(1)}`;

const LP = (uf: number, hf: number, atras = 0): Pt => P3(2 + uf * 96, 1 - hf * 10 - atras, 3 + hf * 65);

function envoltoria(pts: Pt[]): Pt[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [], up: Pt[] = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

function arredondado(u0: number, v0: number, du: number, dv: number, r: number): [number, number][] {
  r = Math.min(r, du / 2, dv / 2);
  const cantos: [number, number, number][] = [[u0 + du - r, v0 + r, -90], [u0 + du - r, v0 + dv - r, 0], [u0 + r, v0 + dv - r, 90], [u0 + r, v0 + r, 180]];
  const out: [number, number][] = [];
  for (const [cu, cv, a0] of cantos) for (let i = 0; i <= 5; i++) {
    const a = (a0 + i * 18) * Math.PI / 180;
    out.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
  }
  return out;
}

function slab(u0: number, v0: number, du: number, dv: number, t: number, r: number, tampo: string, lado: string): string {
  const topo = arredondado(u0, v0, du, dv, r).map(([u, v]) => P3(u, v));
  const base = topo.map(([x, y]) => [x, y + t] as Pt);
  return `<polygon points="${envoltoria(topo.concat(base)).map(f).join(' ')}" fill="${lado}"/>`
    + `<polygon points="${topo.map(f).join(' ')}" fill="${tampo}" stroke="#fff" stroke-opacity=".12" stroke-width=".8"/>`;
}

function circulo(cu: number, cv: number, r: number, cor: string): string {
  const pts = Array.from({ length: 28 }, (_, i) => f(P3(cu + r * Math.cos(i / 28 * 2 * Math.PI), cv + r * Math.sin(i / 28 * 2 * Math.PI))));
  return `<polygon points="${pts.join(' ')}" fill="${cor}"/>`;
}

function quad(u0: number, h0: number, u1: number, h1: number, cor: string, atras = 0, extra = ''): string {
  return `<polygon points="${[LP(u0, h0, atras), LP(u1, h0, atras), LP(u1, h1, atras), LP(u0, h1, atras)].map(f).join(' ')}" fill="${cor}" ${extra}/>`;
}

function repetir(n: number, fn: (i: number) => string): string {
  return Array.from({ length: n }, (_, i) => fn(i)).join('');
}

const DESENHOS: Record<TipoComponente, (qtd: number) => string> = {
  CARCACA: () => slab(0, 0, 100, 64, 14, 5, '#3A3C42', '#232529')
    + repetir(12, i => slab(28 + i * 3.6, 5, 1.8, 9, .6, .5, '#26282D', '#1B1C20')),
  BATERIA: () => slab(8, 38, 84, 20, 6, 2, '#1D1E22', '#111214')
    + repetir(3, i => slab(11 + i * 27, 40, 24, 16, 1, 1, '#2C2E35', '#1B1C20'))
    + slab(12, 55, 18, 1.6, .5, .5, '#E8A317', '#C8A15A'),
  ALTO_FALANTES: () => slab(1.5, 40, 5, 16, 3, 1, '#25272C', '#141518') + slab(93.5, 40, 5, 16, 3, 1, '#25272C', '#141518'),
  PLACA_MAE: () => slab(5, 4, 90, 32, 3, 2, '#1F8A4C', '#0F4F2B')
    + slab(18, 9, 8, 7, 1.6, .5, '#16171A', '#0E0F11') + slab(30, 30, 8, 4, 1.6, .5, '#16171A', '#0E0F11')
    + slab(60, 6, 30, 11, .8, 1, '#146236', '#0F4F2B'),
  PROCESSADOR: () => slab(42, 10, 12, 10, 3, 1, '#D9D8D2', '#8A8B86') + slab(45, 12.5, 6, 5, .8, .5, '#B0B3BA', '#8A8B86'),
  PLACA_VIDEO: () => slab(40, 22, 22, 10, 1.2, .8, '#16171A', '#0E0F11') + slab(46, 24, 9, 6, 1.8, .5, '#5E6068', '#3A3C42')
    + [[41, 23], [41, 28], [58.5, 23], [58.5, 28]].map(([u, v]) => slab(u, v, 3, 3, 1, .3, '#25272C', '#141518')).join('')
    + slab(48, 25.5, 5, 3, .4, .3, '#1A7F45', '#12603A'),
  COOLER: () => slab(14, 6, 20, 14, 6, 2, '#9DA0A8', '#6A6D74') + circulo(24, 13, 5, '#4A4C52') + circulo(24, 13, 1.6, '#9DA0A8')
    + slab(34, 12, 8, 2, 1.6, .5, '#C8A15A', '#96722F'),
  MEMORIA_RAM: qtd => repetir(Math.min(Math.max(qtd, 1), 2), i => slab(62, 6 + i * 7, 26, 4, 3, .5, '#2F55C8', '#1C3A8C')),
  SSD_NVME: () => slab(12, 22, 22, 5, 3, .6, '#25272C', '#141518') + slab(14, 23, 9, 3, .5, .3, '#E8A317', '#C8A15A'),
  SSD_SATA: () => slab(66, 20, 24, 14, 5, 1.2, '#5E6068', '#3A3C42') + slab(69, 22.5, 12, 7, .5, .5, '#E8A317', '#C8A15A'),
  HD: () => slab(66, 20, 24, 14, 7, 1.2, '#B0B3BA', '#7E8189') + circulo(76, 27, 5.5, '#D9D8D2') + circulo(76, 27, 1.3, '#7E8189')
    + slab(80, 24, 7, 1.4, .6, .3, '#5E6068', '#3A3C42'),
  PLACA_WIFI: () => slab(36, 3, 7, 5, 1, .4, '#2F55C8', '#1C3A8C') + slab(37.5, 4, 2, 2, .6, .3, '#C8C6BF', '#8A8B86'),
  OUTRO: () => slab(42, 40, 16, 10, 3, 1, '#5E6068', '#3A3C42'),
  TECLADO: () => slab(0, 0, 100, 64, 6, 5, '#D9D8D2', '#A3A49F')
    + repetir(5, r => repetir(14, c => slab(8 + c * 6, 6 + r * 5.6, 5, 4.6, 1.2, .7, '#2B2D33', '#101114')))
    + slab(37, 41, 26, 16, .8, 1.5, '#C8C6BF', '#B0B3BA') + slab(12, .3, 76, 3, 4, 1.2, '#25272C', '#16171A'),
  TELA: () => {
    let t = quad(0, 0, 1, 1, '#B0B3BA', 2.2) + quad(0, 0, 1, 1, '#16171A')
      + quad(.035, .06, .965, .94, '#F6F5F1') + quad(.035, .84, .965, .94, '#25272C')
      + quad(.06, .87, .1, .91, '#E8A317') + quad(.70, .865, .94, .915, '#1A7F45')
      + quad(.06, .70, .55, .76, '#16171A') + quad(.06, .63, .40, .66, '#B0B3BA');
    for (const x of [.06, .37, .68]) {
      t += quad(x, .12, x + .26, .56, '#FFFFFF', 0, 'stroke="#C8C6BF" stroke-width=".6"')
        + quad(x + .02, .32, x + .24, .54, '#E7E6E1') + quad(x + .02, .16, x + .14, .21, '#16171A');
    }
    return t;
  },
};

export function svgDaPeca(tipo: TipoComponente, quantidade = 1): string {
  const desenho = (DESENHOS[tipo] ?? DESENHOS.OUTRO)(quantidade);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}" fill="none">${desenho}</svg>`;
}

export const Y_EXPLODIDO: Record<TipoComponente, number> = {
  TELA: 96, TECLADO: 250,
  PROCESSADOR: 394, PLACA_VIDEO: 404, COOLER: 386, MEMORIA_RAM: 392, SSD_NVME: 398,
  SSD_SATA: 400, HD: 402, PLACA_WIFI: 396, OUTRO: 410,
  PLACA_MAE: 428, BATERIA: 474, ALTO_FALANTES: 474, CARCACA: 520,
};

export const Y_MONTADO: Record<TipoComponente, number> = {
  TELA: -14, TECLADO: -14, CARCACA: 0, BATERIA: -2, ALTO_FALANTES: -2, PLACA_MAE: -4,
  PROCESSADOR: -5, PLACA_VIDEO: -5, COOLER: -6, MEMORIA_RAM: -6, SSD_NVME: -6,
  SSD_SATA: -6, HD: -6, PLACA_WIFI: -6, OUTRO: -6,
};

export const ANCORA: Record<TipoComponente, Pt> = {
  CARCACA: P3(92, 56), BATERIA: P3(80, 50), ALTO_FALANTES: P3(96, 48), PLACA_MAE: P3(86, 30),
  PROCESSADOR: P3(48, 15), PLACA_VIDEO: P3(58, 30), COOLER: P3(24, 13), MEMORIA_RAM: P3(80, 9),
  SSD_NVME: P3(23, 24), SSD_SATA: P3(86, 24), HD: P3(86, 24), PLACA_WIFI: P3(40, 5),
  OUTRO: P3(50, 45), TECLADO: P3(94, 42), TELA: LP(.82, .5),
};

export const ORDEM_DESENHO: TipoComponente[] = [
  'TELA', 'CARCACA', 'BATERIA', 'ALTO_FALANTES', 'PLACA_MAE', 'PROCESSADOR', 'PLACA_VIDEO',
  'COOLER', 'MEMORIA_RAM', 'SSD_NVME', 'SSD_SATA', 'HD', 'PLACA_WIFI', 'OUTRO', 'TECLADO',
];
