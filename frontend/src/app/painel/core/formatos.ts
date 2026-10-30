import { TipoComponente } from '../../core/modelos';
import { Canal, FormaPagamento, TipoArmazenamento, TipoCusto } from './modelos';

export function dinheiro(v: number | null | undefined): string {
  return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function dinheiroCurto(v: number | null | undefined): string {
  return (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function data(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('pt-BR');
}

export function dataHora(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function hojeIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function telefone(t: string): string {
  const d = t.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : t;
}

export const TIPOS_COMPONENTE: { valor: TipoComponente; rotulo: string }[] = [
  { valor: 'CARCACA', rotulo: 'Carcaça' },
  { valor: 'BATERIA', rotulo: 'Bateria' },
  { valor: 'ALTO_FALANTES', rotulo: 'Alto-falantes' },
  { valor: 'PLACA_MAE', rotulo: 'Placa-mãe' },
  { valor: 'PROCESSADOR', rotulo: 'Processador' },
  { valor: 'PLACA_VIDEO', rotulo: 'Placa de vídeo' },
  { valor: 'COOLER', rotulo: 'Cooler' },
  { valor: 'MEMORIA_RAM', rotulo: 'Memória RAM' },
  { valor: 'SSD_NVME', rotulo: 'SSD NVMe' },
  { valor: 'SSD_SATA', rotulo: 'SSD SATA' },
  { valor: 'HD', rotulo: 'HD' },
  { valor: 'PLACA_WIFI', rotulo: 'Placa Wi-Fi' },
  { valor: 'TECLADO', rotulo: 'Teclado' },
  { valor: 'TELA', rotulo: 'Tela' },
  { valor: 'OUTRO', rotulo: 'Outro' },
];

export const NOME_COMPONENTE = Object.fromEntries(TIPOS_COMPONENTE.map(t => [t.valor, t.rotulo])) as Record<TipoComponente, string>;

export const TIPOS_CUSTO: { valor: TipoCusto; rotulo: string }[] = [
  { valor: 'PECA', rotulo: 'Peça' },
  { valor: 'REPARO', rotulo: 'Reparo' },
  { valor: 'UPGRADE', rotulo: 'Upgrade' },
  { valor: 'LIMPEZA', rotulo: 'Limpeza' },
  { valor: 'OUTRO', rotulo: 'Outro' },
];

export const NOME_CUSTO = Object.fromEntries(TIPOS_CUSTO.map(t => [t.valor, t.rotulo])) as Record<TipoCusto, string>;

export const ARMAZENAMENTOS: { valor: TipoArmazenamento; rotulo: string }[] = [
  { valor: 'SSD_NVME', rotulo: 'SSD NVMe' },
  { valor: 'SSD_SATA', rotulo: 'SSD SATA' },
  { valor: 'HD', rotulo: 'HD' },
];

export const FORMAS_PAGAMENTO: { valor: FormaPagamento; rotulo: string }[] = [
  { valor: 'PIX', rotulo: 'Pix' },
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'CARTAO_DEBITO', rotulo: 'Cartão de débito' },
  { valor: 'CARTAO_CREDITO', rotulo: 'Cartão de crédito' },
  { valor: 'TRANSFERENCIA', rotulo: 'Transferência' },
];

export const NOME_PAGAMENTO = Object.fromEntries(FORMAS_PAGAMENTO.map(t => [t.valor, t.rotulo])) as Record<FormaPagamento, string>;

export const NOME_CANAL: Record<Canal, string> = { WHATSAPP: 'WhatsApp', PRESENCIAL: 'Presencial' };
