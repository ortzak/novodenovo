package br.com.novodenovo.dto;

import java.math.BigDecimal;
import java.util.List;

public record FiltrosDTO(
        List<String> marcas,
        List<String> usos,
        List<String> estados,
        BigDecimal precoMinimo,
        BigDecimal precoMaximo
) {}
