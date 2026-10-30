package br.com.novodenovo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "uso")
public class Uso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_uso")
    private Integer id;

    @Column(nullable = false, length = 40)
    private String nome;

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
