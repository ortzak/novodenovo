package br.com.novodenovo.dto;

public record ComponenteDTO(
        String tipo,
        String nome,
        String especificacao,
        Integer quantidade,
        String imagemUrl,
        Integer camada
) {}
