package br.com.novodenovo.dto.admin;

import java.time.LocalDate;

public record GarantiaDTO(
        Integer id,
        Integer idVenda,
        Integer idNotebook,
        String codigo,
        String notebook,
        String clienteNome,
        String clienteTelefone,
        Integer dias,
        LocalDate dataInicio,
        LocalDate dataFim,
        long diasRestantes,
        String situacao
) {}
