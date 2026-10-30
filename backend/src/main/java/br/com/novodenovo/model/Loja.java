package br.com.novodenovo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "loja")
public class Loja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_loja")
    private Integer id;

    private String nome;
    private String whatsapp;
    @Column(name = "area_atendimento")
    private String areaAtendimento;
    @Column(name = "horario_atendimento")
    private String horarioAtendimento;
    private String instagram;
    @Column(name = "garantia_padrao_dias")
    private Integer garantiaPadraoDias;

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getWhatsapp() { return whatsapp; }
    public String getAreaAtendimento() { return areaAtendimento; }
    public String getHorarioAtendimento() { return horarioAtendimento; }
    public String getInstagram() { return instagram; }
    public Integer getGarantiaPadraoDias() { return garantiaPadraoDias; }
}
