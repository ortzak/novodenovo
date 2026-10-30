package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record VendaFormDTO(
        @NotBlank(message = "Informe o nome do cliente.") @Size(max = 100) String clienteNome,
        @NotBlank(message = "Informe o telefone do cliente.") String clienteTelefone,
        @Email(message = "E-mail do cliente inválido.") @Size(max = 120) String clienteEmail,
        @NotNull(message = "Informe o valor final.")
        @DecimalMin(value = "0.01", message = "O valor final precisa ser maior que zero.") BigDecimal valorFinal,
        @NotBlank(message = "Escolha a forma de pagamento.") String formaPagamento,
        @Min(value = 1, message = "Parcelas de 1 a 24.") @Max(value = 24, message = "Parcelas de 1 a 24.") Integer parcelas,
        @NotBlank(message = "Escolha o canal da venda.") String canal,
        @Min(value = 0, message = "Garantia de 0 a 365 dias.") @Max(value = 365, message = "Garantia de 0 a 365 dias.") Integer garantiaDias,
        @Size(max = 255) String observacao
) {}
