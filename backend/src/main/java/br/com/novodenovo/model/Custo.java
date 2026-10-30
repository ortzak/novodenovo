package br.com.novodenovo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "custo")
public class Custo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_custo")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_notebook")
    private Notebook notebook;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCusto tipo;

    @Column(nullable = false, length = 150)
    private String descricao;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(name = "data_custo", nullable = false)
    private LocalDate dataCusto;

    public Integer getId() { return id; }
    public Notebook getNotebook() { return notebook; }
    public TipoCusto getTipo() { return tipo; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getDataCusto() { return dataCusto; }

    public void setNotebook(Notebook notebook) { this.notebook = notebook; }
    public void setTipo(TipoCusto tipo) { this.tipo = tipo; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public void setDataCusto(LocalDate dataCusto) { this.dataCusto = dataCusto; }
}
