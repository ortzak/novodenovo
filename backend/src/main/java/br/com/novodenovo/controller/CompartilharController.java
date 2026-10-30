package br.com.novodenovo.controller;

import br.com.novodenovo.dto.NotebookDetalheDTO;
import br.com.novodenovo.exception.NaoEncontradoException;
import br.com.novodenovo.service.VitrineService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/compartilhar")
public class CompartilharController {
    private static final Map<String, String> ESTADO = Map.of(
            "NOVO", "Novo, lacrado", "SEMINOVO", "Seminovo", "RECONDICIONADO", "Recondicionado");

    private final VitrineService service;
    private final String site;

    public CompartilharController(VitrineService service, @Value("${app.site-url}") String site) {
        this.service = service;
        this.site = site.replaceAll("/+$", "");
    }

    @GetMapping(value = "/notebook/{codigo}", produces = "text/html;charset=UTF-8")
    public ResponseEntity<String> notebook(@PathVariable String codigo) {
        String html;
        try {
            NotebookDetalheDTO n = service.detalhe(codigo);
            String titulo = n.marca() + " " + n.modelo() + " · " + preco(n.precoVenda());
            String descricao = specs(n) + ". " + estado(n)
                    + ". Veja por dentro, peça por peça, e chame no WhatsApp.";
            html = pagina(titulo, descricao, imagem(n), site + "/notebook/" + n.codigo());
        } catch (NaoEncontradoException e) {
            html = pagina("NovoDeNovo · Notebooks revisados",
                    "Notebooks revisados peça por peça, com garantia. Veja o catálogo.",
                    site + "/img/compartilhar.jpg", site + "/");
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .contentType(new MediaType("text", "html", StandardCharsets.UTF_8))
                .body(html);
    }

    private String specs(NotebookDetalheDTO n) {
        List<String> partes = new ArrayList<>();
        partes.add(n.processador());
        partes.add(n.memoriaRamGb() + " GB RAM");
        String disco = "HD".equals(n.tipoArmazenamento()) ? "HD" : "SSD";
        partes.add(n.armazenamentoGb() + " GB " + disco);
        if (n.placaVideo() != null && !n.placaVideo().isBlank()) partes.add(n.placaVideo());
        return String.join(" · ", partes);
    }

    private String estado(NotebookDetalheDTO n) {
        String texto = ESTADO.getOrDefault(n.estado(), n.estado());
        if (!"NOVO".equals(n.estado()) && n.saudeBateria() != null) texto += ", bateria " + n.saudeBateria() + "%";
        return texto + ", garantia de " + n.garantiaDias() + " dias";
    }

    private String imagem(NotebookDetalheDTO n) {
        return n.fotos().stream()
                .filter(f -> f.startsWith("https://") || f.startsWith("/fotos/"))
                .map(f -> f.startsWith("/") ? site + f : f)
                .findFirst()
                .orElse(site + "/img/compartilhar.jpg");
    }

    private static String preco(BigDecimal v) {
        NumberFormat f = NumberFormat.getCurrencyInstance(Locale.of("pt", "BR"));
        f.setMaximumFractionDigits(0);
        return f.format(v).replace(' ', ' ');
    }

    private static String pagina(String titulo, String descricao, String imagem, String url) {
        String t = esc(titulo), d = esc(descricao), i = esc(imagem), u = esc(url);
        return """
                <!doctype html>
                <html lang="pt-BR"><head><meta charset="utf-8">
                <title>%1$s</title>
                <meta name="description" content="%2$s">
                <meta property="og:type" content="product">
                <meta property="og:site_name" content="NovoDeNovo">
                <meta property="og:locale" content="pt_BR">
                <meta property="og:title" content="%1$s">
                <meta property="og:description" content="%2$s">
                <meta property="og:image" content="%3$s">
                <meta property="og:image:width" content="1200">
                <meta property="og:image:height" content="630">
                <meta property="og:url" content="%4$s">
                <meta name="twitter:card" content="summary_large_image">
                <link rel="canonical" href="%4$s">
                </head><body><p><a href="%4$s">%1$s</a></p><p>%2$s</p></body></html>
                """.formatted(t, d, i, u);
    }

    private static String esc(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
