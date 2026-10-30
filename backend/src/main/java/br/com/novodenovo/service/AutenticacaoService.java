package br.com.novodenovo.service;

import br.com.novodenovo.dto.admin.LoginDTO;
import br.com.novodenovo.dto.admin.SessaoDTO;
import br.com.novodenovo.dto.admin.TrocaSenhaDTO;
import br.com.novodenovo.exception.NaoAutorizadoException;
import br.com.novodenovo.exception.NaoEncontradoException;
import br.com.novodenovo.exception.RegraNegocioException;
import br.com.novodenovo.model.Usuario;
import br.com.novodenovo.repository.UsuarioRepository;
import br.com.novodenovo.seguranca.Token;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AutenticacaoService {
    private final UsuarioRepository usuarios;
    private final Token token;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    public AutenticacaoService(UsuarioRepository usuarios, Token token) {
        this.usuarios = usuarios;
        this.token = token;
    }

    @Transactional
    public SessaoDTO entrar(LoginDTO dados) {
        Usuario u = usuarios.findByEmailIgnoreCase(dados.email().trim())
                .filter(x -> Boolean.TRUE.equals(x.getAtivo()))
                .filter(x -> bcrypt.matches(dados.senha(), x.getSenhaHash()))
                .orElseThrow(() -> new NaoAutorizadoException("E-mail ou senha incorretos."));
        u.setUltimoAcesso(LocalDateTime.now());
        Token.Emitido t = token.emitir(u.getId());
        return new SessaoDTO(t.valor(), t.expiraEm(), u.getNome(), u.getEmail());
    }

    @Transactional
    public void trocarSenha(int idUsuario, TrocaSenhaDTO dados) {
        Usuario u = usuarios.findById(idUsuario)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado."));
        if (!bcrypt.matches(dados.senhaAtual(), u.getSenhaHash())) {
            throw new RegraNegocioException("A senha atual está incorreta.");
        }
        if (dados.senhaAtual().equals(dados.novaSenha())) {
            throw new RegraNegocioException("A nova senha precisa ser diferente da atual.");
        }
        u.setSenhaHash(bcrypt.encode(dados.novaSenha()));
    }

    public String nome(int idUsuario) {
        return usuarios.findById(idUsuario).map(Usuario::getNome).orElse("");
    }
}
