package br.com.novodenovo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "venda")
public class Venda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_venda")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_notebook", unique = true)
    private Notebook notebook;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "data_venda", nullable = false)
    private LocalDateTime dataVenda;

    @Column(name = "valor_final", nullable = false)
    private BigDecimal valorFinal;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false)
    private FormaPagamento formaPagamento;

    @Column(nullable = false)
    private Integer parcelas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CanalVenda canal;

    private String observacao;

    public Integer getId() { return id; }
    public Notebook getNotebook() { return notebook; }
    public Cliente getCliente() { return cliente; }
    public Usuario getUsuario() { return usuario; }
    public LocalDateTime getDataVenda() { return dataVenda; }
    public BigDecimal getValorFinal() { return valorFinal; }
    public FormaPagamento getFormaPagamento() { return formaPagamento; }
    public Integer getParcelas() { return parcelas; }
    public CanalVenda getCanal() { return canal; }
    public String getObservacao() { return observacao; }

    public void setNotebook(Notebook notebook) { this.notebook = notebook; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setDataVenda(LocalDateTime dataVenda) { this.dataVenda = dataVenda; }
    public void setValorFinal(BigDecimal valorFinal) { this.valorFinal = valorFinal; }
    public void setFormaPagamento(FormaPagamento formaPagamento) { this.formaPagamento = formaPagamento; }
    public void setParcelas(Integer parcelas) { this.parcelas = parcelas; }
    public void setCanal(CanalVenda canal) { this.canal = canal; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
