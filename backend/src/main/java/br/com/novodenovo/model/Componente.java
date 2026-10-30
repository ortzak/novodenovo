package br.com.novodenovo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "componente")
public class Componente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_componente")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_notebook")
    private Notebook notebook;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoComponente tipo;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(nullable = false, length = 200)
    private String especificacao;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "imagem_url")
    private String imagemUrl;

    @Column(nullable = false)
    private Integer camada;

    public Integer getId() { return id; }
    public Notebook getNotebook() { return notebook; }
    public TipoComponente getTipo() { return tipo; }
    public String getNome() { return nome; }
    public String getEspecificacao() { return especificacao; }
    public Integer getQuantidade() { return quantidade; }
    public String getImagemUrl() { return imagemUrl; }
    public Integer getCamada() { return camada; }

    public void setNotebook(Notebook notebook) { this.notebook = notebook; }
    public void setTipo(TipoComponente tipo) { this.tipo = tipo; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEspecificacao(String especificacao) { this.especificacao = especificacao; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public void setCamada(Integer camada) { this.camada = camada; }
}
