package br.com.novodenovo.dto.admin;

public record ComponenteAdminDTO(Integer id, String tipo, String nome, String especificacao,
                                 Integer quantidade, Integer camada) {}
