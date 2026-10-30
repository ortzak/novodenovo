package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrocaSenhaDTO(
        @NotBlank(message = "Informe a senha atual.") String senhaAtual,
        @NotBlank(message = "Informe a nova senha.")
        @Size(min = 8, max = 72, message = "A nova senha precisa ter de 8 a 72 caracteres.") String novaSenha
) {}
