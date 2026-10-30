package br.com.novodenovo.dto.admin;

import java.time.Instant;

public record SessaoDTO(String token, Instant expiraEm, String nome, String email) {}
