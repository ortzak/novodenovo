package br.com.novodenovo.service;

import br.com.novodenovo.exception.RegraNegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.UUID;

@Component
public class ArmazenamentoFotos {
    public static final String PREFIXO_URL = "/fotos/";

    private final Path pasta;

    public ArmazenamentoFotos(@Value("${app.fotos.pasta}") String pasta) {
        this.pasta = Path.of(pasta).toAbsolutePath().normalize();
    }

    public String salvar(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) throw new RegraNegocioException("Escolha uma foto.");
        try {
            byte[] inicio;
            try (InputStream in = arquivo.getInputStream()) {
                inicio = in.readNBytes(12);
            }
            String extensao = extensao(inicio);
            if (extensao == null) throw new RegraNegocioException("Envie fotos em JPG, PNG ou WebP.");
            Files.createDirectories(pasta);
            String nome = UUID.randomUUID() + extensao;
            try (InputStream in = arquivo.getInputStream()) {
                Files.copy(in, pasta.resolve(nome));
            }
            return PREFIXO_URL + nome;
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível salvar a foto.", e);
        }
    }

    public void apagar(String url) {
        if (url == null || !url.startsWith(PREFIXO_URL)) return;
        Path arquivo = pasta.resolve(url.substring(PREFIXO_URL.length())).normalize();
        if (!arquivo.startsWith(pasta)) return;
        try {
            Files.deleteIfExists(arquivo);
        } catch (IOException ignorado) {
        }
    }

    private static String extensao(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return ".jpg";
        if (b.length >= 8 && Arrays.equals(Arrays.copyOf(b, 8),
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A})) return ".png";
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return ".webp";
        return null;
    }
}
