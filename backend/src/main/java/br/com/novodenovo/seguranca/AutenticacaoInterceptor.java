package br.com.novodenovo.seguranca;

import br.com.novodenovo.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {
    public static final String ATRIBUTO_USUARIO = "idUsuario";

    private final Token token;
    private final UsuarioRepository usuarios;

    public AutenticacaoInterceptor(Token token, UsuarioRepository usuarios) {
        this.token = token;
        this.usuarios = usuarios;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) return true;
        String cabecalho = req.getHeader("Authorization");
        String valor = cabecalho != null && cabecalho.startsWith("Bearer ") ? cabecalho.substring(7).trim() : null;
        Integer id = token.validar(valor)
                .filter(i -> usuarios.findById(i).map(u -> Boolean.TRUE.equals(u.getAtivo())).orElse(false))
                .orElse(null);
        if (id == null) {
            res.setStatus(401);
            res.setContentType("application/problem+json");
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.getWriter().write("{\"title\":\"Não autorizado\",\"status\":401,\"detail\":\"Faça login novamente.\"}");
            return false;
        }
        req.setAttribute(ATRIBUTO_USUARIO, id);
        return true;
    }
}
