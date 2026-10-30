export type Estado = 'NOVO' | 'SEMINOVO' | 'RECONDICIONADO';
export type Status = 'EM_PREPARACAO' | 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO';

export type TipoComponente =
  | 'CARCACA' | 'BATERIA' | 'ALTO_FALANTES' | 'PLACA_MAE' | 'PROCESSADOR'
  | 'PLACA_VIDEO' | 'COOLER' | 'MEMORIA_RAM' | 'SSD_NVME' | 'SSD_SATA' | 'HD'
  | 'PLACA_WIFI' | 'TECLADO' | 'TELA' | 'OUTRO';

export interface NotebookCard {
  codigo: string;
  marca: string;
  modelo: string;
  processador: string;
  memoriaRamGb: number;
  armazenamentoGb: number;
  tipoArmazenamento: string;
  placaVideo: string | null;
  estado: Estado;
  saudeBateria: number | null;
  precoVenda: number;
  status: Status;
  fotoPrincipal: string | null;
  usos: string[];
}

export interface Componente {
  tipo: TipoComponente;
  nome: string;
  especificacao: string;
  quantidade: number;
  imagemUrl: string | null;
  camada: number;
}

export interface NotebookDetalhe {
  codigo: string;
  marca: string;
  modelo: string;
  processador: string;
  memoriaRamGb: number;
  armazenamentoGb: number;
  tipoArmazenamento: string;
  telaPolegadas: number;
  placaVideo: string | null;
  sistemaOperacional: string | null;
  estado: Estado;
  saudeBateria: number | null;
  marcasUso: string | null;
  descricao: string | null;
  precoVenda: number;
  status: Status;
  reservadoAte: string | null;
  garantiaDias: number;
  fotos: string[];
  usos: string[];
  componentes: Componente[];
}

export interface Filtros {
  marcas: string[];
  usos: string[];
  estados: Estado[];
  precoMinimo: number;
  precoMaximo: number;
}

export interface Loja {
  nome: string;
  whatsapp: string;
  areaAtendimento: string;
  horarioAtendimento: string;
  instagram: string | null;
  garantiaPadraoDias: number;
}

export interface Servico {
  nome: string;
  descricao: string;
  precoAPartir: number | null;
  prazo: string | null;
}

export interface FiltroCatalogo {
  marcas: string[];
  estados: Estado[];
  usos: string[];
  precoMin: number | null;
  precoMax: number | null;
  ordenar: 'menor_preco' | 'maior_preco' | 'recentes';
}
