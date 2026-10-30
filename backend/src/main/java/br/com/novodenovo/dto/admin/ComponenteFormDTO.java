package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.*;

public record ComponenteFormDTO(
        @NotBlank(message = "Escolha o tipo da peça.") String tipo,
        @NotBlank(message = "Informe o nome da peça.") @Size(max = 80) String nome,
        @NotBlank(message = "Informe a especificação.") @Size(max = 200) String especificacao,
        @NotNull(message = "Informe a quantidade.") @Min(value = 1, message = "Quantidade de 1 a 4.")
        @Max(value = 4, message = "Quantidade de 1 a 4.") Integer quantidade,
        @Min(value = 1, message = "Camada de 1 a 20.") @Max(value = 20, message = "Camada de 1 a 20.") Integer camada
) {}
