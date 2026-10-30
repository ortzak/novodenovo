package br.com.novodenovo.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "notebook")
public class Notebook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notebook")
    private Integer id;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_marca")
    private Marca marca;

    @Column(nullable = false)
    private String modelo;

    @Column(name = "numero_serie", nullable = false, unique = true)
    private String numeroSerie;

    @Column(nullable = false)
    private String processador;

    @Column(name = "memoria_ram_gb", nullable = false)
    private Integer memoriaRamGb;

    @Column(name = "armazenamento_gb", nullable = false)
    private Integer armazenamentoGb;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_armazenamento", nullable = false)
    private TipoArmazenamento tipoArmazenamento;

    @Column(name = "tela_polegadas", nullable = false)
    private BigDecimal telaPolegadas;

    @Column(name = "placa_video")
    private String placaVideo;

    @Column(name = "sistema_operacional")
    private String sistemaOperacional;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoNotebook estado;

    @Column(name = "saude_bateria")
    private Integer saudeBateria;

    @Column(name = "marcas_uso")
    private String marcasUso;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "valor_compra", nullable = false)
    private BigDecimal valorCompra;

    @Column(name = "data_compra", nullable = false)
    private LocalDate dataCompra;

    private String fornecedor;

    @Column(name = "preco_venda", nullable = false)
    private BigDecimal precoVenda;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusNotebook status;

    @Column(name = "reservado_ate")
    private LocalDateTime reservadoAte;

    @Column(name = "data_cadastro", nullable = false, insertable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @ManyToMany
    @JoinTable(name = "notebook_uso",
            joinColumns = @JoinColumn(name = "id_notebook"),
            inverseJoinColumns = @JoinColumn(name = "id_uso"))
    private Set<Uso> usos = new LinkedHashSet<>();

    @OneToMany(mappedBy = "notebook")
    @OrderBy("ordem ASC")
    private List<FotoNotebook> fotos = new ArrayList<>();

    @OneToMany(mappedBy = "notebook")
    @OrderBy("camada ASC")
    private List<Componente> componentes = new ArrayList<>();

    public Integer getId() { return id; }
    public String getCodigo() { return codigo; }
    public Marca getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public String getNumeroSerie() { return numeroSerie; }
    public String getProcessador() { return processador; }
    public Integer getMemoriaRamGb() { return memoriaRamGb; }
    public Integer getArmazenamentoGb() { return armazenamentoGb; }
    public TipoArmazenamento getTipoArmazenamento() { return tipoArmazenamento; }
    public BigDecimal getTelaPolegadas() { return telaPolegadas; }
    public String getPlacaVideo() { return placaVideo; }
    public String getSistemaOperacional() { return sistemaOperacional; }
    public EstadoNotebook getEstado() { return estado; }
    public Integer getSaudeBateria() { return saudeBateria; }
    public String getMarcasUso() { return marcasUso; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValorCompra() { return valorCompra; }
    public LocalDate getDataCompra() { return dataCompra; }
    public String getFornecedor() { return fornecedor; }
    public BigDecimal getPrecoVenda() { return precoVenda; }
    public StatusNotebook getStatus() { return status; }
    public LocalDateTime getReservadoAte() { return reservadoAte; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public Set<Uso> getUsos() { return usos; }
    public List<FotoNotebook> getFotos() { return fotos; }
    public List<Componente> getComponentes() { return componentes; }
}
