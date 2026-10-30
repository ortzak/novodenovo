package br.com.novodenovo.service;

import br.com.novodenovo.model.EstadoNotebook;
import br.com.novodenovo.model.Notebook;
import br.com.novodenovo.model.TipoArmazenamento;
import br.com.novodenovo.model.TipoComponente;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

public final class GeradorComponentes {
    public static final String VAGA_ARMAZENAMENTO = "ARMAZENAMENTO";

    private static final Pattern GPU_DEDICADA = Pattern.compile(
            "(rtx|gtx|\\bmx\\s?\\d|radeon\\s+(rx|pro)|quadro|\\barc\\s+a\\d|geforce)", Pattern.CASE_INSENSITIVE);

    private GeradorComponentes() {}

    public record Peca(TipoComponente tipo, String nome, String especificacao, int quantidade, int camada) {}

    public record Dados(String marca, String modelo, String processador, Integer memoriaRamGb, Integer armazenamentoGb,
                        TipoArmazenamento tipoArmazenamento, BigDecimal telaPolegadas, String placaVideo,
                        EstadoNotebook estado, Integer saudeBateria, String marcasUso) {

        public static Dados de(Notebook n) {
            return new Dados(n.getMarca() == null ? "" : n.getMarca().getNome(), n.getModelo(), n.getProcessador(),
                    n.getMemoriaRamGb(), n.getArmazenamentoGb(), n.getTipoArmazenamento(), n.getTelaPolegadas(),
                    n.getPlacaVideo(), n.getEstado(), n.getSaudeBateria(), n.getMarcasUso());
        }
    }

    public static Map<String, Peca> gerar(Dados d) {
        Map<String, Peca> pecas = new LinkedHashMap<>();
        boolean novo = d.estado() == EstadoNotebook.NOVO;
        String modelo = texto(d.modelo());

        pecas.put("CARCACA", new Peca(TipoComponente.CARCACA, "Carcaça",
                novo ? "Nova, sem marcas de uso" : textoOu(d.marcasUso(), "Revisada"), 1, 1));
        pecas.put("BATERIA", new Peca(TipoComponente.BATERIA, "Bateria",
                novo ? "Nova" : d.saudeBateria() != null ? "Saúde " + d.saudeBateria() + "%" : "Revisada", 1, 2));
        pecas.put("PLACA_MAE", new Peca(TipoComponente.PLACA_MAE, "Placa-mãe",
                ("Original " + texto(d.marca()) + " " + modelo).replaceAll("\\s+", " ").trim(), 1, 3));
        pecas.put("PROCESSADOR", new Peca(TipoComponente.PROCESSADOR, "Processador", texto(d.processador()), 1, 4));
        if (gpuDedicada(d.placaVideo())) {
            pecas.put("PLACA_VIDEO", new Peca(TipoComponente.PLACA_VIDEO, "Placa de vídeo", d.placaVideo().trim(), 1, 5));
        }
        if (!modelo.toLowerCase(Locale.ROOT).contains("macbook air")) {
            pecas.put("COOLER", new Peca(TipoComponente.COOLER, "Cooler", "Limpo e com pasta térmica nova", 1, 6));
        }
        if (d.memoriaRamGb() != null) {
            pecas.put("MEMORIA_RAM", new Peca(TipoComponente.MEMORIA_RAM, "Memória RAM", d.memoriaRamGb() + " GB", 1, 7));
        }
        if (d.armazenamentoGb() != null && d.tipoArmazenamento() != null) {
            pecas.put(VAGA_ARMAZENAMENTO, armazenamento(d.tipoArmazenamento(), d.armazenamentoGb()));
        }
        pecas.put("PLACA_WIFI", new Peca(TipoComponente.PLACA_WIFI, "Placa Wi-Fi", "Wi-Fi e Bluetooth", 1, 9));
        pecas.put("TECLADO", new Peca(TipoComponente.TECLADO, "Teclado e touchpad", "Testados tecla por tecla", 1, 10));
        if (d.telaPolegadas() != null) {
            pecas.put("TELA", new Peca(TipoComponente.TELA, "Tela",
                    d.telaPolegadas().stripTrailingZeros().toPlainString().replace('.', ',') + "\"", 1, 11));
        }
        return pecas;
    }

    public static String vaga(TipoComponente tipo) {
        return switch (tipo) {
            case SSD_NVME, SSD_SATA, HD -> VAGA_ARMAZENAMENTO;
            default -> tipo.name();
        };
    }

    static boolean gpuDedicada(String placa) {
        return placa != null && GPU_DEDICADA.matcher(placa).find();
    }

    private static Peca armazenamento(TipoArmazenamento tipo, int gb) {
        String tamanho = gb >= 1000 && gb % 1000 == 0 ? (gb / 1000) + " TB" : gb + " GB";
        return switch (tipo) {
            case SSD_NVME -> new Peca(TipoComponente.SSD_NVME, "SSD", tamanho + " NVMe", 1, 8);
            case SSD_SATA -> new Peca(TipoComponente.SSD_SATA, "SSD SATA", tamanho + " SATA", 1, 8);
            case HD -> new Peca(TipoComponente.HD, "HD", tamanho, 1, 8);
        };
    }

    private static String texto(String s) {
        return s == null ? "" : s.trim();
    }

    private static String textoOu(String s, String padrao) {
        return s == null || s.isBlank() ? padrao : s.trim();
    }
}
