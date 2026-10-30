package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record LoginDTO(
        @NotBlank(message = "Informe o e-mail.") String email,
        @NotBlank(message = "Informe a senha.") String senha
) {}
