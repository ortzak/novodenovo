package br.com.novodenovo.dto;

public record LojaDTO(
        String nome,
        String whatsapp,
        String areaAtendimento,
        String horarioAtendimento,
        String instagram,
        Integer garantiaPadraoDias
) {}
