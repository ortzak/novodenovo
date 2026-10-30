package br.com.novodenovo.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VendaDTO(
        Integer id,
        LocalDateTime dataVenda,
        Integer idNotebook,
        String codigo,
        String notebook,
        String clienteNome,
        String clienteTelefone,
        BigDecimal valorFinal,
        BigDecimal custoTotal,
        BigDecimal lucro,
        String formaPagamento,
        Integer parcelas,
        String canal,
        String observacao,
        Integer garantiaDias,
        LocalDate garantiaFim
) {}
