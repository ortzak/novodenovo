package br.com.novodenovo.seguranca;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class Token {
    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64D = Base64.getUrlDecoder();
    private static final String CABECALHO = B64.encodeToString(
            "{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
    private static final Pattern SUB = Pattern.compile("\"sub\":\"(\\d+)\"");
    private static final Pattern EXP = Pattern.compile("\"exp\":(\\d+)");

    private final byte[] chave;
    private final Duration validade;

    public Token(@Value("${app.jwt.segredo:}") String segredo,
                 @Value("${app.jwt.horas:12}") long horas) {
        if (segredo == null || segredo.isBlank()) {
            this.chave = new byte[32];
            new SecureRandom().nextBytes(this.chave);
        } else {
            this.chave = segredo.getBytes(StandardCharsets.UTF_8);
        }
        this.validade = Duration.ofHours(horas);
    }

    public Emitido emitir(int idUsuario) {
        Instant expira = Instant.now().plus(validade);
        String corpo = B64.encodeToString(("{\"sub\":\"" + idUsuario + "\",\"exp\":" + expira.getEpochSecond() + "}")
                .getBytes(StandardCharsets.UTF_8));
        String base = CABECALHO + "." + corpo;
        return new Emitido(base + "." + assinar(base), expira);
    }

    public Optional<Integer> validar(String token) {
        if (token == null) return Optional.empty();
        String[] partes = token.split("\\.");
        if (partes.length != 3) return Optional.empty();
        String base = partes[0] + "." + partes[1];
        byte[] esperado = assinar(base).getBytes(StandardCharsets.US_ASCII);
        if (!MessageDigest.isEqual(esperado, partes[2].getBytes(StandardCharsets.US_ASCII))) return Optional.empty();
        String corpo;
        try {
            corpo = new String(B64D.decode(partes[1]), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
        Matcher sub = SUB.matcher(corpo), exp = EXP.matcher(corpo);
        if (!sub.find() || !exp.find()) return Optional.empty();
        if (Instant.now().getEpochSecond() >= Long.parseLong(exp.group(1))) return Optional.empty();
        return Optional.of(Integer.parseInt(sub.group(1)));
    }

    private String assinar(String base) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(chave, "HmacSHA256"));
            return B64.encodeToString(mac.doFinal(base.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao assinar o token", e);
        }
    }

    public record Emitido(String valor, Instant expiraEm) {}
}
