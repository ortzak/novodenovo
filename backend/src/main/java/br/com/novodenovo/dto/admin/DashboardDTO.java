package br.com.novodenovo.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DashboardDTO(
        String nomeUsuario,
        long disponiveis,
        long reservados,
        LocalDateTime proximaReservaVence,
        long emPreparacao,
        long vendidosMes,
        long vendidosMesAnterior,
        BigDecimal lucroMes,
        BigDecimal faturamentoMes,
        List<Mes> meses,
        List<Alerta> alertas,
        List<VendaDTO> ultimasVendas
) {
    public record Mes(String mes, BigDecimal lucro, BigDecimal faturamento, long vendas) {}

    public record Alerta(String nivel, String titulo, String detalhe, Integer idNotebook) {}
}
