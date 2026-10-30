package br.com.novodenovo.controller;

import br.com.novodenovo.dto.admin.LoginDTO;
import br.com.novodenovo.dto.admin.SessaoDTO;
import br.com.novodenovo.service.AutenticacaoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {
    private final AutenticacaoService service;

    public AutenticacaoController(AutenticacaoService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public SessaoDTO entrar(@Valid @RequestBody LoginDTO dados) {
        return service.entrar(dados);
    }
}
