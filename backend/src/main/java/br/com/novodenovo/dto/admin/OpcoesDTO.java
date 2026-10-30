package br.com.novodenovo.dto.admin;

import java.util.List;

public record OpcoesDTO(List<String> marcas, List<String> usos, Integer garantiaPadraoDias) {}
