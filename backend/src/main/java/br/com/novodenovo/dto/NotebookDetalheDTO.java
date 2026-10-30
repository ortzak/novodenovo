package br.com.novodenovo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record NotebookDetalheDTO(
        String codigo,
        String marca,
        String modelo,
        String processador,
        Integer memoriaRamGb,
        Integer armazenamentoGb,
        String tipoArmazenamento,
        BigDecimal telaPolegadas,
        String placaVideo,
        String sistemaOperacional,
        String estado,
        Integer saudeBateria,
        String marcasUso,
        String descricao,
        BigDecimal precoVenda,
        String status,
        LocalDateTime reservadoAte,
        Integer garantiaDias,
        List<String> fotos,
        List<String> usos,
        List<ComponenteDTO> componentes
) {}
