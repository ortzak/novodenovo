package br.com.novodenovo.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustoDTO(Integer id, String tipo, String descricao, BigDecimal valor, LocalDate dataCusto) {}
