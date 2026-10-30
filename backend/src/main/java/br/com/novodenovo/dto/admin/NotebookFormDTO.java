package br.com.novodenovo.dto.admin;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record NotebookFormDTO(
        @NotBlank(message = "Informe a marca.") @Size(max = 40) String marca,
        @NotBlank(message = "Informe o modelo.") @Size(max = 100) String modelo,
        @NotBlank(message = "Informe o número de série.") @Size(max = 40) String numeroSerie,
        @NotBlank(message = "Informe o processador.") @Size(max = 80) String processador,
        @NotNull(message = "Informe a memória RAM.") @Min(value = 1, message = "Memória RAM inválida.") Integer memoriaRamGb,
        @NotNull(message = "Informe o armazenamento.") @Min(value = 1, message = "Armazenamento inválido.") Integer armazenamentoGb,
        @NotBlank(message = "Informe o tipo de armazenamento.") String tipoArmazenamento,
        @NotNull(message = "Informe o tamanho da tela.") @DecimalMin(value = "7.0", message = "Tela inválida.")
        @DecimalMax(value = "21.0", message = "Tela inválida.") BigDecimal telaPolegadas,
        @Size(max = 80) String placaVideo,
        @Size(max = 40) String sistemaOperacional,
        @NotBlank(message = "Informe o estado.") String estado,
        @Min(value = 0, message = "Saúde da bateria entre 0 e 100.")
        @Max(value = 100, message = "Saúde da bateria entre 0 e 100.") Integer saudeBateria,
        @Size(max = 255) String marcasUso,
        String descricao,
        @NotNull(message = "Informe o valor de compra.")
        @DecimalMin(value = "0.0", message = "Valor de compra inválido.") BigDecimal valorCompra,
        @NotNull(message = "Informe a data de compra.") LocalDate dataCompra,
        @Size(max = 100) String fornecedor,
        @NotNull(message = "Informe o preço de venda.")
        @DecimalMin(value = "0.01", message = "O preço de venda precisa ser maior que zero.") BigDecimal precoVenda,
        @NotBlank(message = "Informe o status.") String status,
        LocalDateTime reservadoAte,
        List<String> usos,
        boolean confirmarPrecoAbaixoDoCusto
) {}
