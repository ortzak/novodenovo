package br.com.novodenovo.service;

import br.com.novodenovo.dto.admin.*;
import br.com.novodenovo.exception.NaoEncontradoException;
import br.com.novodenovo.exception.RegraNegocioException;
import br.com.novodenovo.model.*;
import br.com.novodenovo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PainelNotebookService {
    private static final int MAX_FOTOS = 8;

    private final NotebookRepository notebooks;
    private final MarcaRepository marcas;
    private final UsoRepository usos;
    private final FotoNotebookRepository fotos;
    private final ComponenteRepository componentes;
    private final CustoRepository custos;
    private final VendaRepository vendas;
    private final GarantiaRepository garantias;
    private final LojaRepository lojas;
    private final ArmazenamentoFotos armazenamento;

    public PainelNotebookService(NotebookRepository notebooks, MarcaRepository marcas, UsoRepository usos,
                                 FotoNotebookRepository fotos, ComponenteRepository componentes,
                                 CustoRepository custos, VendaRepository vendas, GarantiaRepository garantias,
                                 LojaRepository lojas, ArmazenamentoFotos armazenamento) {
        this.notebooks = notebooks;
        this.marcas = marcas;
        this.usos = usos;
        this.fotos = fotos;
        this.componentes = componentes;
        this.custos = custos;
        this.vendas = vendas;
        this.garantias = garantias;
        this.lojas = lojas;
        this.armazenamento = armazenamento;
    }

    @Transactional(readOnly = true)
    public List<NotebookResumoDTO> listar() {
        Map<Integer, BigDecimal> extras = custos.findAll().stream().collect(Collectors.groupingBy(
                c -> c.getNotebook().getId(),
                Collectors.reducing(BigDecimal.ZERO, Custo::getValor, BigDecimal::add)));
        Map<Integer, Integer> vendaPorNotebook = vendas.findAll().stream()
                .collect(Collectors.toMap(v -> v.getNotebook().getId(), Venda::getId));
        return notebooks.findAllByOrderByCodigoAsc().stream().map(n -> {
            BigDecimal custo = n.getValorCompra().add(extras.getOrDefault(n.getId(), BigDecimal.ZERO));
            String foto = n.getFotos().stream()
                    .sorted(Comparator.comparing((FotoNotebook f) -> !Boolean.TRUE.equals(f.getPrincipal()))
                            .thenComparing(FotoNotebook::getOrdem))
                    .map(FotoNotebook::getUrl).findFirst().orElse(null);
            return new NotebookResumoDTO(n.getId(), n.getCodigo(), n.getMarca().getNome(), n.getModelo(),
                    n.getEstado().name(), n.getStatus().name(), custo, n.getPrecoVenda(),
                    n.getPrecoVenda().subtract(custo), foto, n.getComponentes().size(),
                    vendaPorNotebook.get(n.getId()));
        }).toList();
    }

    @Transactional(readOnly = true)
    public NotebookAdminDTO buscar(int id) {
        return paraDTO(notebook(id));
    }

    @Transactional(readOnly = true)
    public OpcoesDTO opcoes() {
        List<String> m = marcas.findAll().stream().map(Marca::getNome).sorted(String.CASE_INSENSITIVE_ORDER).toList();
        List<String> u = usos.findAll().stream().map(Uso::getNome).toList();
        Integer garantia = lojas.findAll().stream().findFirst().map(Loja::getGarantiaPadraoDias).orElse(90);
        return new OpcoesDTO(m, u, garantia);
    }

    public NotebookAdminDTO criar(NotebookFormDTO dados) {
        if (notebooks.existsByNumeroSerieIgnoreCase(dados.numeroSerie().trim())) {
            throw new RegraNegocioException("Já existe um notebook com esse número de série.");
        }
        StatusNotebook status = status(dados.status());
        if (status == StatusNotebook.VENDIDO) {
            throw new RegraNegocioException("Para vender, cadastre o notebook e use \"Registrar venda\".");
        }
        Notebook n = new Notebook();
        n.setCodigo(proximoCodigo());
        aplicar(n, dados, status, dados.valorCompra());
        notebooks.save(n);
        criarPecas(n, GeradorComponentes.gerar(GeradorComponentes.Dados.de(n)).values());
        return paraDTO(n);
    }

    public NotebookAdminDTO atualizar(int id, NotebookFormDTO dados) {
        Notebook n = notebook(id);
        if (notebooks.existsByNumeroSerieIgnoreCaseAndIdNot(dados.numeroSerie().trim(), id)) {
            throw new RegraNegocioException("Já existe outro notebook com esse número de série.");
        }
        StatusNotebook status = status(dados.status());
        boolean vendido = n.getStatus() == StatusNotebook.VENDIDO;
        if (vendido && status != StatusNotebook.VENDIDO) {
            throw new RegraNegocioException("Este notebook já foi vendido. Para mudar o status, desfaça a venda.");
        }
        if (!vendido && status == StatusNotebook.VENDIDO) {
            throw new RegraNegocioException("Use \"Registrar venda\" para marcar o notebook como vendido.");
        }
        BigDecimal custoTotal = dados.valorCompra().add(somaCustos(id));
        Map<String, GeradorComponentes.Peca> antes = GeradorComponentes.gerar(GeradorComponentes.Dados.de(n));
        aplicar(n, dados, status, custoTotal);
        sincronizarPecas(n, antes, GeradorComponentes.gerar(GeradorComponentes.Dados.de(n)));
        return paraDTO(n);
    }

    public void excluir(int id) {
        Notebook n = notebook(id);
        if (vendas.findByNotebookId(id).isPresent()) {
            throw new RegraNegocioException("Notebook vendido não pode ser excluído: ele faz parte do histórico de vendas.");
        }
        List<FotoNotebook> listaFotos = fotos.findByNotebookIdOrderByOrdemAsc(id);
        List<String> urls = listaFotos.stream().map(FotoNotebook::getUrl).toList();
        fotos.deleteAll(listaFotos);
        componentes.deleteAll(componentes.findByNotebookIdOrderByCamadaAsc(id));
        custos.deleteAll(custos.findByNotebookIdOrderByDataCustoAscIdAsc(id));
        n.getUsos().clear();
        notebooks.delete(n);
        notebooks.flush();
        urls.forEach(armazenamento::apagar);
    }

    public List<FotoDTO> enviarFotos(int id, List<MultipartFile> arquivos) {
        Notebook n = notebook(id);
        List<FotoNotebook> atuais = fotos.findByNotebookIdOrderByOrdemAsc(id);
        if (arquivos == null || arquivos.isEmpty()) throw new RegraNegocioException("Escolha uma foto.");
        if (atuais.size() + arquivos.size() > MAX_FOTOS) {
            throw new RegraNegocioException("Cada notebook pode ter até " + MAX_FOTOS + " fotos.");
        }
        int ordem = atuais.stream().mapToInt(FotoNotebook::getOrdem).max().orElse(0);
        boolean temPrincipal = atuais.stream().anyMatch(f -> Boolean.TRUE.equals(f.getPrincipal()));
        for (MultipartFile arquivo : arquivos) {
            FotoNotebook f = new FotoNotebook();
            f.setNotebook(n);
            f.setUrl(armazenamento.salvar(arquivo));
            f.setOrdem(++ordem);
            f.setPrincipal(!temPrincipal);
            temPrincipal = true;
            fotos.save(f);
        }
        return fotosDe(id);
    }

    public List<FotoDTO> definirPrincipal(int idFoto) {
        FotoNotebook alvo = fotos.findById(idFoto).orElseThrow(() -> new NaoEncontradoException("Foto não encontrada."));
        int idNotebook = alvo.getNotebook().getId();
        List<FotoNotebook> lista = fotos.findByNotebookIdOrderByOrdemAsc(idNotebook);
        int ordem = 2;
        for (FotoNotebook f : lista) {
            boolean principal = f.getId().equals(idFoto);
            f.setPrincipal(principal);
            f.setOrdem(principal ? 1 : ordem++);
        }
        return fotosDe(idNotebook);
    }

    public List<FotoDTO> excluirFoto(int idFoto) {
        FotoNotebook f = fotos.findById(idFoto).orElseThrow(() -> new NaoEncontradoException("Foto não encontrada."));
        int idNotebook = f.getNotebook().getId();
        boolean eraPrincipal = Boolean.TRUE.equals(f.getPrincipal());
        fotos.delete(f);
        fotos.flush();
        armazenamento.apagar(f.getUrl());
        List<FotoNotebook> resto = fotos.findByNotebookIdOrderByOrdemAsc(idNotebook);
        if (eraPrincipal && !resto.isEmpty()) resto.get(0).setPrincipal(true);
        return fotosDe(idNotebook);
    }

    public List<ComponenteAdminDTO> gerarComponentes(int id) {
        Notebook n = notebook(id);
        componentes.deleteAll(componentes.findByNotebookIdOrderByCamadaAsc(id));
        componentes.flush();
        criarPecas(n, GeradorComponentes.gerar(GeradorComponentes.Dados.de(n)).values());
        return componentesDe(id);
    }

    public List<ComponenteAdminDTO> adicionarComponente(int id, ComponenteFormDTO dados) {
        Notebook n = notebook(id);
        Componente c = new Componente();
        c.setNotebook(n);
        int camada = dados.camada() != null ? dados.camada()
                : componentes.findByNotebookIdOrderByCamadaAsc(id).stream().mapToInt(Componente::getCamada).max().orElse(0) + 1;
        if (camada > 20) throw new RegraNegocioException("O notebook já tem o máximo de 20 camadas de peças.");
        preencher(c, dados, camada);
        componentes.save(c);
        return componentesDe(id);
    }

    public List<ComponenteAdminDTO> atualizarComponente(int idComponente, ComponenteFormDTO dados) {
        Componente c = componentes.findById(idComponente)
                .orElseThrow(() -> new NaoEncontradoException("Peça não encontrada."));
        preencher(c, dados, dados.camada() != null ? dados.camada() : c.getCamada());
        return componentesDe(c.getNotebook().getId());
    }

    public List<ComponenteAdminDTO> excluirComponente(int idComponente) {
        Componente c = componentes.findById(idComponente)
                .orElseThrow(() -> new NaoEncontradoException("Peça não encontrada."));
        int idNotebook = c.getNotebook().getId();
        componentes.delete(c);
        componentes.flush();
        return componentesDe(idNotebook);
    }

    public List<CustoDTO> adicionarCusto(int id, CustoFormDTO dados) {
        Notebook n = notebook(id);
        Custo c = new Custo();
        c.setNotebook(n);
        c.setTipo(enumDe(TipoCusto.class, dados.tipo(), "Tipo de custo inválido."));
        c.setDescricao(dados.descricao().trim());
        c.setValor(dados.valor());
        c.setDataCusto(dados.dataCusto());
        custos.save(c);
        return custosDe(id);
    }

    public List<CustoDTO> excluirCusto(int idCusto) {
        Custo c = custos.findById(idCusto).orElseThrow(() -> new NaoEncontradoException("Custo não encontrado."));
        int idNotebook = c.getNotebook().getId();
        if (vendas.findByNotebookId(idNotebook).isPresent()) {
            throw new RegraNegocioException("Notebook vendido: os custos ficam travados para não mudar o lucro já registrado.");
        }
        custos.delete(c);
        custos.flush();
        return custosDe(idNotebook);
    }

    private void aplicar(Notebook n, NotebookFormDTO d, StatusNotebook status, BigDecimal custoTotal) {
        EstadoNotebook estado = enumDe(EstadoNotebook.class, d.estado(), "Estado inválido.");
        if (estado != EstadoNotebook.NOVO && (d.saudeBateria() == null || vazio(d.marcasUso()))) {
            throw new RegraNegocioException("Notebook usado precisa da saúde da bateria e das marcas de uso.");
        }
        LocalDateTime reservadoAte = null;
        if (status == StatusNotebook.RESERVADO) {
            if (d.reservadoAte() == null) {
                throw new RegraNegocioException("Informe até quando o notebook fica reservado.");
            }
            if (!d.reservadoAte().equals(n.getReservadoAte()) && d.reservadoAte().isBefore(LocalDateTime.now())) {
                throw new RegraNegocioException("A data da reserva precisa ser no futuro.");
            }
            reservadoAte = d.reservadoAte();
        }
        if (d.precoVenda().compareTo(custoTotal) < 0 && !d.confirmarPrecoAbaixoDoCusto()) {
            throw new RegraNegocioException("PRECO_ABAIXO_DO_CUSTO",
                    "O preço de venda está abaixo do custo total. Confirme para salvar mesmo assim.");
        }
        n.setMarca(marca(d.marca()));
        n.setModelo(d.modelo().trim());
        n.setNumeroSerie(d.numeroSerie().trim());
        n.setProcessador(d.processador().trim());
        n.setMemoriaRamGb(d.memoriaRamGb());
        n.setArmazenamentoGb(d.armazenamentoGb());
        n.setTipoArmazenamento(enumDe(TipoArmazenamento.class, d.tipoArmazenamento(), "Tipo de armazenamento inválido."));
        n.setTelaPolegadas(d.telaPolegadas());
        n.setPlacaVideo(textoOuNulo(d.placaVideo()));
        n.setSistemaOperacional(textoOuNulo(d.sistemaOperacional()));
        n.setEstado(estado);
        n.setSaudeBateria(estado == EstadoNotebook.NOVO ? null : d.saudeBateria());
        n.setMarcasUso(estado == EstadoNotebook.NOVO ? null : textoOuNulo(d.marcasUso()));
        n.setDescricao(textoOuNulo(d.descricao()));
        n.setValorCompra(d.valorCompra());
        n.setDataCompra(d.dataCompra());
        n.setFornecedor(textoOuNulo(d.fornecedor()));
        n.setPrecoVenda(d.precoVenda());
        n.setStatus(status);
        n.setReservadoAte(reservadoAte);
        List<String> nomes = d.usos() == null ? List.of() : d.usos();
        n.getUsos().clear();
        n.getUsos().addAll(usos.findByNomeIn(nomes));
    }

    private void criarPecas(Notebook n, Collection<GeradorComponentes.Peca> pecas) {
        for (GeradorComponentes.Peca p : pecas) {
            Componente c = new Componente();
            c.setNotebook(n);
            c.setTipo(p.tipo());
            c.setNome(p.nome());
            c.setEspecificacao(p.especificacao());
            c.setQuantidade(p.quantidade());
            c.setCamada(p.camada());
            componentes.save(c);
        }
    }

    private void sincronizarPecas(Notebook n, Map<String, GeradorComponentes.Peca> antes,
                                  Map<String, GeradorComponentes.Peca> depois) {
        List<Componente> atuais = componentes.findByNotebookIdOrderByCamadaAsc(n.getId());
        Set<String> vagasOcupadas = new HashSet<>();
        boolean temPecaGerada = false;
        for (Componente c : atuais) {
            String vaga = GeradorComponentes.vaga(c.getTipo());
            vagasOcupadas.add(vaga);
            GeradorComponentes.Peca velha = antes.get(vaga);
            if (velha == null || velha.tipo() != c.getTipo() || !velha.especificacao().equals(c.getEspecificacao())) continue;
            temPecaGerada = true;
            GeradorComponentes.Peca nova = depois.get(vaga);
            if (nova == null) {
                componentes.delete(c);
                continue;
            }
            if (c.getNome().equals(velha.nome())) c.setNome(nova.nome());
            c.setTipo(nova.tipo());
            c.setEspecificacao(nova.especificacao());
        }
        if (!temPecaGerada) return;
        List<GeradorComponentes.Peca> novas = new ArrayList<>();
        depois.forEach((vaga, p) -> {
            if (!vagasOcupadas.contains(vaga) && !antes.containsKey(vaga)) novas.add(p);
        });
        criarPecas(n, novas);
    }

    private void preencher(Componente c, ComponenteFormDTO d, int camada) {
        c.setTipo(enumDe(TipoComponente.class, d.tipo(), "Tipo de peça inválido."));
        c.setNome(d.nome().trim());
        c.setEspecificacao(d.especificacao().trim());
        c.setQuantidade(d.quantidade());
        c.setCamada(camada);
    }

    private Marca marca(String nome) {
        String limpo = nome.trim();
        return marcas.findByNomeIgnoreCase(limpo).orElseGet(() -> {
            Marca m = new Marca();
            m.setNome(limpo);
            return marcas.save(m);
        });
    }

    private String proximoCodigo() {
        int maior = notebooks.findAll().stream()
                .map(Notebook::getCodigo)
                .filter(c -> c != null && c.matches("NB-\\d+"))
                .mapToInt(c -> Integer.parseInt(c.substring(3)))
                .max().orElse(0);
        return String.format("NB-%04d", maior + 1);
    }

    private NotebookAdminDTO paraDTO(Notebook n) {
        BigDecimal extras = somaCustos(n.getId());
        BigDecimal total = n.getValorCompra().add(extras);
        VendaDTO venda = vendas.findByNotebookId(n.getId()).map(v -> vendaDTO(v, total)).orElse(null);
        return new NotebookAdminDTO(n.getId(), n.getCodigo(), n.getMarca().getNome(), n.getModelo(),
                n.getNumeroSerie(), n.getProcessador(), n.getMemoriaRamGb(), n.getArmazenamentoGb(),
                n.getTipoArmazenamento().name(), n.getTelaPolegadas(), n.getPlacaVideo(), n.getSistemaOperacional(),
                n.getEstado().name(), n.getSaudeBateria(), n.getMarcasUso(), n.getDescricao(), n.getValorCompra(),
                n.getDataCompra(), n.getFornecedor(), n.getPrecoVenda(), n.getStatus().name(), n.getReservadoAte(),
                n.getDataCadastro(), n.getUsos().stream().map(Uso::getNome).toList(),
                n.getId() == null ? List.of() : fotosDe(n.getId()),
                n.getId() == null ? List.of() : componentesDe(n.getId()),
                n.getId() == null ? List.of() : custosDe(n.getId()),
                extras, total, n.getPrecoVenda().subtract(total), venda);
    }

    VendaDTO vendaDTO(Venda v, BigDecimal custoTotal) {
        Notebook n = v.getNotebook();
        Optional<Garantia> g = garantias.findByVendaId(v.getId());
        return new VendaDTO(v.getId(), v.getDataVenda(), n.getId(), n.getCodigo(),
                n.getMarca().getNome() + " " + n.getModelo(), v.getCliente().getNome(), v.getCliente().getTelefone(),
                v.getValorFinal(), custoTotal, v.getValorFinal().subtract(custoTotal), v.getFormaPagamento().name(),
                v.getParcelas(), v.getCanal().name(), v.getObservacao(),
                g.map(Garantia::getDias).orElse(null), g.map(Garantia::getDataFim).orElse(null));
    }

    BigDecimal somaCustos(Integer idNotebook) {
        if (idNotebook == null) return BigDecimal.ZERO;
        return custos.findByNotebookIdOrderByDataCustoAscIdAsc(idNotebook).stream()
                .map(Custo::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<FotoDTO> fotosDe(int id) {
        return fotos.findByNotebookIdOrderByOrdemAsc(id).stream()
                .map(f -> new FotoDTO(f.getId(), f.getUrl(), f.getOrdem(), f.getPrincipal())).toList();
    }

    private List<ComponenteAdminDTO> componentesDe(int id) {
        return componentes.findByNotebookIdOrderByCamadaAsc(id).stream()
                .map(c -> new ComponenteAdminDTO(c.getId(), c.getTipo().name(), c.getNome(), c.getEspecificacao(),
                        c.getQuantidade(), c.getCamada())).toList();
    }

    private List<CustoDTO> custosDe(int id) {
        return custos.findByNotebookIdOrderByDataCustoAscIdAsc(id).stream()
                .map(c -> new CustoDTO(c.getId(), c.getTipo().name(), c.getDescricao(), c.getValor(), c.getDataCusto()))
                .toList();
    }

    Notebook notebook(int id) {
        return notebooks.findById(id).orElseThrow(() -> new NaoEncontradoException("Notebook não encontrado."));
    }

    private static StatusNotebook status(String s) {
        return enumDe(StatusNotebook.class, s, "Status inválido.");
    }

    static <E extends Enum<E>> E enumDe(Class<E> tipo, String valor, String erro) {
        try {
            return Enum.valueOf(tipo, valor.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException e) {
            throw new RegraNegocioException(erro);
        }
    }

    private static boolean vazio(String s) {
        return s == null || s.isBlank();
    }

    private static String textoOuNulo(String s) {
        return vazio(s) ? null : s.trim();
    }
}
