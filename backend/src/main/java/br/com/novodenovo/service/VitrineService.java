package br.com.novodenovo.service;

import br.com.novodenovo.dto.*;
import br.com.novodenovo.exception.NaoEncontradoException;
import br.com.novodenovo.model.*;
import br.com.novodenovo.repository.*;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class VitrineService {
    private static final List<StatusNotebook> VISIVEIS =
            List.of(StatusNotebook.DISPONIVEL, StatusNotebook.RESERVADO);

    private static final int GARANTIA_PADRAO = 90;

    private final NotebookRepository notebooks;
    private final MarcaRepository marcas;
    private final UsoRepository usos;
    private final LojaRepository lojas;
    private final ServicoRepository servicos;

    public VitrineService(NotebookRepository notebooks, MarcaRepository marcas,
                          UsoRepository usos, LojaRepository lojas, ServicoRepository servicos) {
        this.notebooks = notebooks;
        this.marcas = marcas;
        this.usos = usos;
        this.lojas = lojas;
        this.servicos = servicos;
    }

    public List<NotebookCardDTO> listar(List<String> filtroMarcas, List<String> filtroEstados,
                                        List<String> filtroUsos, BigDecimal precoMin,
                                        BigDecimal precoMax, String ordenar) {
        Specification<Notebook> spec = NotebookSpecs.statusEm(VISIVEIS);
        if (temItens(filtroMarcas)) spec = spec.and(NotebookSpecs.marcaEm(filtroMarcas));
        if (temItens(filtroEstados)) spec = spec.and(NotebookSpecs.estadoEm(paraEstados(filtroEstados)));
        if (temItens(filtroUsos)) spec = spec.and(NotebookSpecs.usoEm(filtroUsos));
        if (precoMin != null) spec = spec.and(NotebookSpecs.precoMinimo(precoMin));
        if (precoMax != null) spec = spec.and(NotebookSpecs.precoMaximo(precoMax));

        return notebooks.findAll(spec, ordenacao(ordenar)).stream()
                .map(this::paraCard)
                .toList();
    }

    public NotebookDetalheDTO detalhe(String codigo) {
        Notebook n = notebooks.findByCodigoAndStatusIn(codigo, VISIVEIS)
                .orElseThrow(() -> new NaoEncontradoException("Notebook " + codigo + " não está na vitrine."));

        List<ComponenteDTO> componentes = n.getComponentes().stream()
                .sorted(Comparator.comparing(Componente::getCamada))
                .map(c -> new ComponenteDTO(c.getTipo().name(), c.getNome(), c.getEspecificacao(),
                        c.getQuantidade(), c.getImagemUrl(), c.getCamada()))
                .toList();

        return new NotebookDetalheDTO(
                n.getCodigo(), n.getMarca().getNome(), n.getModelo(), n.getProcessador(),
                n.getMemoriaRamGb(), n.getArmazenamentoGb(), n.getTipoArmazenamento().name(),
                n.getTelaPolegadas(), n.getPlacaVideo(), n.getSistemaOperacional(),
                n.getEstado().name(), n.getSaudeBateria(), n.getMarcasUso(), n.getDescricao(),
                n.getPrecoVenda(), n.getStatus().name(), n.getReservadoAte(),
                garantiaDias(),
                n.getFotos().stream().map(FotoNotebook::getUrl).toList(),
                nomesDosUsos(n),
                componentes);
    }

    public FiltrosDTO filtros() {
        List<BigDecimal> precos = notebooks.findAll(NotebookSpecs.statusEm(VISIVEIS)).stream()
                .map(Notebook::getPrecoVenda).toList();
        return new FiltrosDTO(
                marcas.findAll(Sort.by("nome")).stream().map(Marca::getNome).toList(),
                usos.findAll(Sort.by("id")).stream().map(Uso::getNome).toList(),
                Arrays.stream(EstadoNotebook.values()).map(Enum::name).toList(),
                precos.stream().min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO),
                precos.stream().max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO));
    }

    public LojaDTO loja() {
        Loja l = lojas.findAll().stream().findFirst()
                .orElseThrow(() -> new NaoEncontradoException("Loja ainda não configurada."));
        return new LojaDTO(l.getNome(), l.getWhatsapp(), l.getAreaAtendimento(),
                l.getHorarioAtendimento(), l.getInstagram(), l.getGarantiaPadraoDias());
    }

    public List<ServicoDTO> servicos() {
        return servicos.findByAtivoTrueOrderByOrdemAscNomeAsc().stream()
                .map(s -> new ServicoDTO(s.getNome(), s.getDescricao(), s.getPrecoAPartir(), s.getPrazo()))
                .toList();
    }

    private NotebookCardDTO paraCard(Notebook n) {
        String foto = n.getFotos().stream()
                .filter(f -> Boolean.TRUE.equals(f.getPrincipal()))
                .map(FotoNotebook::getUrl)
                .findFirst()
                .orElse(n.getFotos().isEmpty() ? null : n.getFotos().get(0).getUrl());
        return new NotebookCardDTO(
                n.getCodigo(), n.getMarca().getNome(), n.getModelo(), n.getProcessador(),
                n.getMemoriaRamGb(), n.getArmazenamentoGb(), n.getTipoArmazenamento().name(),
                n.getPlacaVideo(), n.getEstado().name(), n.getSaudeBateria(),
                n.getPrecoVenda(), n.getStatus().name(), foto, nomesDosUsos(n));
    }

    private List<String> nomesDosUsos(Notebook n) {
        return n.getUsos().stream().map(Uso::getNome).toList();
    }

    private int garantiaDias() {
        return lojas.findAll().stream().findFirst()
                .map(Loja::getGarantiaPadraoDias)
                .filter(Objects::nonNull)
                .orElse(GARANTIA_PADRAO);
    }

    private Sort ordenacao(String ordenar) {
        if (ordenar == null) return Sort.by("precoVenda").ascending();
        return switch (ordenar) {
            case "maior_preco" -> Sort.by("precoVenda").descending();
            case "recentes" -> Sort.by("dataCadastro").descending();
            default -> Sort.by("precoVenda").ascending();
        };
    }

    private List<EstadoNotebook> paraEstados(List<String> estados) {
        return estados.stream()
                .map(e -> EstadoNotebook.valueOf(e.trim().toUpperCase(Locale.ROOT)))
                .toList();
    }

    private static boolean temItens(List<String> lista) {
        return lista != null && !lista.isEmpty();
    }
}
