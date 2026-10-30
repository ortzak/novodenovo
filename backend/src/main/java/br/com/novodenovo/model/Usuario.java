package br.com.novodenovo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 60)
    private String senhaHash;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "ultimo_acesso")
    private LocalDateTime ultimoAcesso;

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
    public Boolean getAtivo() { return ativo; }
    public LocalDateTime getUltimoAcesso() { return ultimoAcesso; }

    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public void setUltimoAcesso(LocalDateTime ultimoAcesso) { this.ultimoAcesso = ultimoAcesso; }
}
