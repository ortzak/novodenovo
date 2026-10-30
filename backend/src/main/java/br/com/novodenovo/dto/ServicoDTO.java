package br.com.novodenovo.dto;

import java.math.BigDecimal;

public record ServicoDTO(
        String nome,
        String descricao,
        BigDecimal precoAPartir,
        String prazo
) {}
