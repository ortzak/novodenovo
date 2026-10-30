package br.com.novodenovo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "servico")
public class Servico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servico")
    private Integer id;

    private String nome;
    private String descricao;
    @Column(name = "preco_a_partir")
    private BigDecimal precoAPartir;
    private String prazo;
    private Integer ordem;
    private Boolean ativo;

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getPrecoAPartir() { return precoAPartir; }
    public String getPrazo() { return prazo; }
    public Integer getOrdem() { return ordem; }
    public Boolean getAtivo() { return ativo; }
}
