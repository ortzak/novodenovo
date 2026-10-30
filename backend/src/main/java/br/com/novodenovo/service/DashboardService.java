package br.com.novodenovo.service;

import br.com.novodenovo.dto.admin.DashboardDTO;
import br.com.novodenovo.dto.admin.GarantiaDTO;
import br.com.novodenovo.dto.admin.VendaDTO;
import br.com.novodenovo.model.Notebook;
import br.com.novodenovo.model.StatusNotebook;
import br.com.novodenovo.repository.NotebookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("dd/MM 'às' HH'h'mm");

    private final NotebookRepository notebooks;
    private final PainelVendaService vendas;
    private final PainelNotebookService painel;
    private final AutenticacaoService autenticacao;

    public DashboardService(NotebookRepository notebooks, PainelVendaService vendas,
                            PainelNotebookService painel, AutenticacaoService autenticacao) {
        this.notebooks = notebooks;
        this.vendas = vendas;
        this.painel = painel;
        this.autenticacao = autenticacao;
    }

    public DashboardDTO montar(int idUsuario) {
        List<Notebook> todos = notebooks.findAll();
        List<VendaDTO> lista = vendas.listar();
        YearMonth atual = YearMonth.now();

        Map<YearMonth, List<VendaDTO>> porMes = new HashMap<>();
        for (VendaDTO v : lista) porMes.computeIfAbsent(YearMonth.from(v.dataVenda()), k -> new ArrayList<>()).add(v);

        List<DashboardDTO.Mes> meses = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth m = atual.minusMonths(i);
            List<VendaDTO> doMes = porMes.getOrDefault(m, List.of());
            meses.add(new DashboardDTO.Mes(m.toString(), soma(doMes, VendaDTO::lucro),
                    soma(doMes, VendaDTO::valorFinal), doMes.size()));
        }
        List<VendaDTO> esteMes = porMes.getOrDefault(atual, List.of());

        LocalDateTime agora = LocalDateTime.now();
        List<DashboardDTO.Alerta> alertas = new ArrayList<>();
        todos.stream()
                .filter(n -> n.getStatus() == StatusNotebook.RESERVADO && n.getReservadoAte() != null)
                .sorted(Comparator.comparing(Notebook::getReservadoAte))
                .forEach(n -> {
                    long horas = ChronoUnit.HOURS.between(agora, n.getReservadoAte());
                    if (horas < 0) {
                        alertas.add(new DashboardDTO.Alerta("erro", "Reserva vencida",
                                n.getCodigo() + " · " + n.getModelo() + " · venceu " + HORA.format(n.getReservadoAte()), n.getId()));
                    } else if (horas <= 48) {
                        alertas.add(new DashboardDTO.Alerta("info", "Reserva vence " + HORA.format(n.getReservadoAte()),
                                n.getCodigo() + " · " + n.getModelo(), n.getId()));
                    }
                });
        for (GarantiaDTO g : vendas.garantias()) {
            if (!"VENCE_EM_BREVE".equals(g.situacao())) continue;
            String quando = g.diasRestantes() == 0 ? "hoje" : g.diasRestantes() == 1 ? "amanhã" : "em " + g.diasRestantes() + " dias";
            alertas.add(new DashboardDTO.Alerta(g.diasRestantes() <= 3 ? "erro" : "aviso", "Garantia vence " + quando,
                    g.codigo() + " · " + g.notebook() + " · " + g.clienteNome(), g.idNotebook()));
        }
        todos.stream()
                .filter(n -> n.getStatus() == StatusNotebook.DISPONIVEL || n.getStatus() == StatusNotebook.RESERVADO)
                .filter(n -> n.getPrecoVenda().compareTo(n.getValorCompra().add(painel.somaCustos(n.getId()))) < 0)
                .forEach(n -> alertas.add(new DashboardDTO.Alerta("aviso", "Preço abaixo do custo",
                        n.getCodigo() + " · " + n.getModelo(), n.getId())));
        todos.stream()
                .filter(n -> n.getStatus() == StatusNotebook.DISPONIVEL && n.getFotos().isEmpty())
                .forEach(n -> alertas.add(new DashboardDTO.Alerta("aviso", "Na vitrine sem foto",
                        n.getCodigo() + " · " + n.getModelo(), n.getId())));

        LocalDateTime proximaReserva = todos.stream()
                .filter(n -> n.getStatus() == StatusNotebook.RESERVADO && n.getReservadoAte() != null)
                .map(Notebook::getReservadoAte).min(Comparator.naturalOrder()).orElse(null);

        return new DashboardDTO(
                autenticacao.nome(idUsuario),
                conta(todos, StatusNotebook.DISPONIVEL),
                conta(todos, StatusNotebook.RESERVADO),
                proximaReserva,
                conta(todos, StatusNotebook.EM_PREPARACAO),
                esteMes.size(),
                porMes.getOrDefault(atual.minusMonths(1), List.of()).size(),
                soma(esteMes, VendaDTO::lucro),
                soma(esteMes, VendaDTO::valorFinal),
                meses,
                alertas,
                lista.stream().limit(5).toList());
    }

    private static long conta(List<Notebook> lista, StatusNotebook status) {
        return lista.stream().filter(n -> n.getStatus() == status).count();
    }

    private static BigDecimal soma(List<VendaDTO> lista, java.util.function.Function<VendaDTO, BigDecimal> campo) {
        return lista.stream().map(campo).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
