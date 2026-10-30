package br.com.novodenovo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "foto_notebook")
public class FotoNotebook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_foto")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_notebook")
    private Notebook notebook;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private Integer ordem;

    @Column(nullable = false)
    private Boolean principal;

    public Integer getId() { return id; }
    public Notebook getNotebook() { return notebook; }
    public String getUrl() { return url; }
    public Integer getOrdem() { return ordem; }
    public Boolean getPrincipal() { return principal; }

    public void setNotebook(Notebook notebook) { this.notebook = notebook; }
    public void setUrl(String url) { this.url = url; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
    public void setPrincipal(Boolean principal) { this.principal = principal; }
}
