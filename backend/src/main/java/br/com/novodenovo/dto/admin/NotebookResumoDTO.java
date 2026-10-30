package br.com.novodenovo.dto.admin;

import java.math.BigDecimal;

public record NotebookResumoDTO(
        Integer id,
        String codigo,
        String marca,
        String modelo,
        String estado,
        String status,
        BigDecimal custoTotal,
        BigDecimal precoVenda,
        BigDecimal lucroPrevisto,
        String fotoPrincipal,
        int componentes,
        Integer idVenda
) {}
