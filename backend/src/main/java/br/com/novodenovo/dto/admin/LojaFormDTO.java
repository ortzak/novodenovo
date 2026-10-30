package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.*;

public record LojaFormDTO(
        @NotBlank(message = "Informe o nome.") @Size(max = 100) String nome,
        @NotBlank(message = "Informe o WhatsApp.") String whatsapp,
        @NotBlank(message = "Informe a região de atendimento.") @Size(max = 120) String areaAtendimento,
        @NotBlank(message = "Informe o horário.") @Size(max = 120) String horarioAtendimento,
        @Size(max = 60) String instagram,
        @NotNull(message = "Informe a garantia padrão.") @Min(value = 0, message = "Garantia de 0 a 365 dias.")
        @Max(value = 365, message = "Garantia de 0 a 365 dias.") Integer garantiaPadraoDias
) {}
