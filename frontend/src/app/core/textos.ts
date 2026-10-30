import { Estado, Loja, NotebookCard, NotebookDetalhe, Servico, Status } from './modelos';

export const ESTADO: Record<Estado, string> = {
  NOVO: 'Novo',
  SEMINOVO: 'Seminovo',
  RECONDICIONADO: 'Recondicionado',
};

export const STATUS: Record<Status, string> = {
  EM_PREPARACAO: 'Em preparação',
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
};

const ARMAZENAMENTO: Record<string, string> = { SSD_NVME: 'SSD', SSD_SATA: 'SSD', HD: 'HD' };

export function processadorCurto(p: string): string {
  return p.replace(/^Intel Core /, '').replace(/^AMD /, '').replace(/^Apple /, '');
}

export function specsCurtas(n: NotebookCard): string {
  const terceiro = n.placaVideo
    ? n.placaVideo.replace(/^NVIDIA (GeForce )?/, '')
    : `${n.armazenamentoGb} GB ${ARMAZENAMENTO[n.tipoArmazenamento] ?? ''}`.trim();
  return [processadorCurto(n.processador), `${n.memoriaRamGb} GB`, terceiro].join(' · ');
}

export function linhaEstado(n: { estado: Estado; saudeBateria: number | null }): string {
  const bateria = n.saudeBateria != null && n.estado !== 'NOVO' ? ` · bateria ${n.saudeBateria}%` : '';
  return ESTADO[n.estado] + (n.estado === 'NOVO' ? ' · lacrado' : bateria);
}

export function preco(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function linkWhatsapp(loja: Loja | undefined, n?: NotebookDetalhe | NotebookCard): string {
  const numero = loja?.whatsapp ?? '';
  const texto = n
    ? `Olá! Tenho interesse no notebook ${n.codigo} — ${n.marca} ${n.modelo} (${preco(n.precoVenda)}). Ainda está disponível?`
    : 'Olá! Vim pelo site da NovoDeNovo e queria tirar uma dúvida.';
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function linkOrcamento(loja: Loja | undefined, s?: Servico): string {
  const numero = loja?.whatsapp ?? '';
  const texto = s
    ? `Olá! Quero um orçamento de ${s.nome.toLowerCase()}. Meu notebook é (marca/modelo): `
    : 'Olá! Quero um orçamento para o meu notebook. Ele é (marca/modelo): ';
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function linkCompartilhar(n: NotebookDetalhe | NotebookCard, url: string): string {
  const texto = `Olha esse ${n.marca} ${n.modelo} por ${preco(n.precoVenda)} na NovoDeNovo: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export function telefoneFormatado(whatsapp: string): string {
  const d = whatsapp.replace(/\D/g, '').replace(/^55/, '');
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : whatsapp;
}
