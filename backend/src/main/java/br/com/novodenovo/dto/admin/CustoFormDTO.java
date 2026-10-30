package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CustoFormDTO(
        @NotBlank(message = "Escolha o tipo do custo.") String tipo,
        @NotBlank(message = "Descreva o custo.") @Size(max = 150) String descricao,
        @NotNull(message = "Informe o valor.") @DecimalMin(value = "0.01", message = "O valor precisa ser maior que zero.") BigDecimal valor,
        @NotNull(message = "Informe a data.") LocalDate dataCusto
) {}
