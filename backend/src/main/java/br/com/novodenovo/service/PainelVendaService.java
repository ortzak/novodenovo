package br.com.novodenovo.service;

import br.com.novodenovo.dto.admin.GarantiaDTO;
import br.com.novodenovo.dto.admin.VendaDTO;
import br.com.novodenovo.dto.admin.VendaFormDTO;
import br.com.novodenovo.exception.NaoEncontradoException;
import br.com.novodenovo.exception.RegraNegocioException;
import br.com.novodenovo.model.*;
import br.com.novodenovo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class PainelVendaService {
    private final PainelNotebookService notebooks;
    private final VendaRepository vendas;
    private final GarantiaRepository garantias;
    private final ClienteRepository clientes;
    private final UsuarioRepository usuarios;
    private final LojaRepository lojas;

    public PainelVendaService(PainelNotebookService notebooks, VendaRepository vendas, GarantiaRepository garantias,
                              ClienteRepository clientes, UsuarioRepository usuarios, LojaRepository lojas) {
        this.notebooks = notebooks;
        this.vendas = vendas;
        this.garantias = garantias;
        this.clientes = clientes;
        this.usuarios = usuarios;
        this.lojas = lojas;
    }

    public VendaDTO registrar(int idNotebook, int idUsuario, VendaFormDTO d) {
        Notebook n = notebooks.notebook(idNotebook);
        if (n.getStatus() == StatusNotebook.VENDIDO || vendas.findByNotebookId(idNotebook).isPresent()) {
            throw new RegraNegocioException("Este notebook já foi vendido.");
        }
        if (n.getStatus() == StatusNotebook.EM_PREPARACAO) {
            throw new RegraNegocioException("O notebook ainda está em preparação. Deixe-o disponível antes de vender.");
        }
        FormaPagamento forma = PainelNotebookService.enumDe(FormaPagamento.class, d.formaPagamento(), "Forma de pagamento inválida.");
        CanalVenda canal = PainelNotebookService.enumDe(CanalVenda.class, d.canal(), "Canal de venda inválido.");
        int parcelas = d.parcelas() == null ? 1 : d.parcelas();
        if (parcelas > 1 && forma != FormaPagamento.CARTAO_CREDITO) {
            throw new RegraNegocioException("Parcelamento só no cartão de crédito.");
        }
        String telefone = telefone(d.clienteTelefone());
        Cliente cliente = clientes.findByTelefone(telefone).orElseGet(Cliente::new);
        cliente.setNome(d.clienteNome().trim());
        cliente.setTelefone(telefone);
        if (d.clienteEmail() != null && !d.clienteEmail().isBlank()) cliente.setEmail(d.clienteEmail().trim());
        clientes.save(cliente);

        Venda v = new Venda();
        v.setNotebook(n);
        v.setCliente(cliente);
        v.setUsuario(usuarios.findById(idUsuario).orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado.")));
        v.setDataVenda(LocalDateTime.now());
        v.setValorFinal(d.valorFinal());
        v.setFormaPagamento(forma);
        v.setParcelas(parcelas);
        v.setCanal(canal);
        v.setObservacao(d.observacao() == null || d.observacao().isBlank() ? null : d.observacao().trim());
        vendas.save(v);

        int dias = d.garantiaDias() != null ? d.garantiaDias()
                : lojas.findAll().stream().findFirst().map(Loja::getGarantiaPadraoDias).orElse(90);
        Garantia g = new Garantia();
        g.setVenda(v);
        g.setDias(dias);
        g.setDataInicio(LocalDate.now());
        g.setDataFim(LocalDate.now().plusDays(dias));
        garantias.save(g);

        n.setStatus(StatusNotebook.VENDIDO);
        n.setReservadoAte(null);
        return notebooks.vendaDTO(v, custoTotal(n));
    }

    public void desfazer(int idVenda) {
        Venda v = vendas.findById(idVenda).orElseThrow(() -> new NaoEncontradoException("Venda não encontrada."));
        Notebook n = v.getNotebook();
        garantias.findByVendaId(idVenda).ifPresent(garantias::delete);
        vendas.delete(v);
        n.setStatus(StatusNotebook.DISPONIVEL);
        n.setReservadoAte(null);
    }

    @Transactional(readOnly = true)
    public List<VendaDTO> listar() {
        return vendas.findAllByOrderByDataVendaDesc().stream()
                .map(v -> notebooks.vendaDTO(v, custoTotal(v.getNotebook())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GarantiaDTO> garantias() {
        LocalDate hoje = LocalDate.now();
        return garantias.findAllByOrderByDataFimAsc().stream().map(g -> {
            Venda v = g.getVenda();
            Notebook n = v.getNotebook();
            long restantes = ChronoUnit.DAYS.between(hoje, g.getDataFim());
            String situacao = restantes < 0 ? "VENCIDA" : restantes <= 7 ? "VENCE_EM_BREVE" : "ATIVA";
            return new GarantiaDTO(g.getId(), v.getId(), n.getId(), n.getCodigo(),
                    n.getMarca().getNome() + " " + n.getModelo(), v.getCliente().getNome(),
                    v.getCliente().getTelefone(), g.getDias(), g.getDataInicio(), g.getDataFim(),
                    Math.max(restantes, 0), situacao);
        }).toList();
    }

    BigDecimal custoTotal(Notebook n) {
        return n.getValorCompra().add(notebooks.somaCustos(n.getId()));
    }

    private static String telefone(String bruto) {
        String d = bruto.replaceAll("\\D", "");
        if (d.length() == 10 || d.length() == 11) d = "55" + d;
        if (d.length() < 12 || d.length() > 13) {
            throw new RegraNegocioException("Telefone inválido. Use DDD + número, ex.: (11) 91234-5678.");
        }
        return d;
    }
}
