import { Estado, Status, TipoComponente } from '../../core/modelos';

export interface Sessao {
  token: string;
  expiraEm: string;
  nome: string;
  email: string;
}

export interface NotebookResumo {
  id: number;
  codigo: string;
  marca: string;
  modelo: string;
  estado: Estado;
  status: Status;
  custoTotal: number;
  precoVenda: number;
  lucroPrevisto: number;
  fotoPrincipal: string | null;
  componentes: number;
  idVenda: number | null;
}

export interface Foto {
  id: number;
  url: string;
  ordem: number;
  principal: boolean;
}

export interface ComponenteAdmin {
  id: number;
  tipo: TipoComponente;
  nome: string;
  especificacao: string;
  quantidade: number;
  camada: number;
}

export type TipoCusto = 'PECA' | 'REPARO' | 'UPGRADE' | 'LIMPEZA' | 'OUTRO';

export interface Custo {
  id: number;
  tipo: TipoCusto;
  descricao: string;
  valor: number;
  dataCusto: string;
}

export type TipoArmazenamento = 'SSD_NVME' | 'SSD_SATA' | 'HD';

export interface NotebookForm {
  marca: string;
  modelo: string;
  numeroSerie: string;
  processador: string;
  memoriaRamGb: number | null;
  armazenamentoGb: number | null;
  tipoArmazenamento: TipoArmazenamento;
  telaPolegadas: number | null;
  placaVideo: string | null;
  sistemaOperacional: string | null;
  estado: Estado;
  saudeBateria: number | null;
  marcasUso: string | null;
  descricao: string | null;
  valorCompra: number | null;
  dataCompra: string;
  fornecedor: string | null;
  precoVenda: number | null;
  status: Status;
  reservadoAte: string | null;
  usos: string[];
  confirmarPrecoAbaixoDoCusto?: boolean;
}

export interface NotebookAdmin extends NotebookForm {
  id: number;
  codigo: string;
  dataCadastro: string | null;
  fotos: Foto[];
  componentes: ComponenteAdmin[];
  custos: Custo[];
  custosAdicionais: number;
  custoTotal: number;
  lucroPrevisto: number;
  venda: Venda | null;
}

export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'TRANSFERENCIA';
export type Canal = 'WHATSAPP' | 'PRESENCIAL';

export interface Venda {
  id: number;
  dataVenda: string;
  idNotebook: number;
  codigo: string;
  notebook: string;
  clienteNome: string;
  clienteTelefone: string;
  valorFinal: number;
  custoTotal: number;
  lucro: number;
  formaPagamento: FormaPagamento;
  parcelas: number;
  canal: Canal;
  observacao: string | null;
  garantiaDias: number | null;
  garantiaFim: string | null;
}

export interface VendaForm {
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string | null;
  valorFinal: number | null;
  formaPagamento: FormaPagamento;
  parcelas: number;
  canal: Canal;
  garantiaDias: number;
  observacao: string | null;
}

export interface Garantia {
  id: number;
  idVenda: number;
  idNotebook: number;
  codigo: string;
  notebook: string;
  clienteNome: string;
  clienteTelefone: string;
  dias: number;
  dataInicio: string;
  dataFim: string;
  diasRestantes: number;
  situacao: 'ATIVA' | 'VENCE_EM_BREVE' | 'VENCIDA';
}

export interface Dashboard {
  nomeUsuario: string;
  disponiveis: number;
  reservados: number;
  proximaReservaVence: string | null;
  emPreparacao: number;
  vendidosMes: number;
  vendidosMesAnterior: number;
  lucroMes: number;
  faturamentoMes: number;
  meses: { mes: string; lucro: number; faturamento: number; vendas: number }[];
  alertas: { nivel: 'erro' | 'aviso' | 'info'; titulo: string; detalhe: string; idNotebook: number | null }[];
  ultimasVendas: Venda[];
}

export interface Opcoes {
  marcas: string[];
  usos: string[];
  garantiaPadraoDias: number;
}

export interface ServicoAdmin {
  id: number | null;
  nome: string;
  descricao: string;
  precoAPartir: number | null;
  prazo: string | null;
  ordem: number | null;
  ativo: boolean;
}

export interface LojaForm {
  nome: string;
  whatsapp: string;
  areaAtendimento: string;
  horarioAtendimento: string;
  instagram: string | null;
  garantiaPadraoDias: number;
}
