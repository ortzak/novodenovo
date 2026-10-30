package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ServicoAdminDTO(
        Integer id,
        @NotBlank(message = "Informe o nome do serviço.") @Size(max = 80) String nome,
        @NotBlank(message = "Descreva o serviço.") @Size(max = 300) String descricao,
        @DecimalMin(value = "0.0", message = "Preço inválido.") BigDecimal precoAPartir,
        @Size(max = 60) String prazo,
        Integer ordem,
        Boolean ativo
) {}
