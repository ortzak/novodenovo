package br.com.novodenovo.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "garantia")
public class Garantia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_garantia")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_venda", unique = true)
    private Venda venda;

    @Column(nullable = false)
    private Integer dias;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    private String observacao;

    public Integer getId() { return id; }
    public Venda getVenda() { return venda; }
    public Integer getDias() { return dias; }
    public LocalDate getDataInicio() { return dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public String getObservacao() { return observacao; }

    public void setVenda(Venda venda) { this.venda = venda; }
    public void setDias(Integer dias) { this.dias = dias; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
