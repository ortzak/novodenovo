package br.com.novodenovo.dto;

import java.math.BigDecimal;
import java.util.List;

public record NotebookCardDTO(
        String codigo,
        String marca,
        String modelo,
        String processador,
        Integer memoriaRamGb,
        Integer armazenamentoGb,
        String tipoArmazenamento,
        String placaVideo,
        String estado,
        Integer saudeBateria,
        BigDecimal precoVenda,
        String status,
        String fotoPrincipal,
        List<String> usos
) {}
