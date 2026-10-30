package br.com.novodenovo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 15)
    private String telefone;

    @Column(length = 120)
    private String email;

    @Column(name = "data_cadastro", nullable = false, insertable = false, updatable = false)
    private LocalDateTime dataCadastro;

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getTelefone() { return telefone; }
    public String getEmail() { return email; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }

    public void setNome(String nome) { this.nome = nome; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public void setEmail(String email) { this.email = email; }
}
