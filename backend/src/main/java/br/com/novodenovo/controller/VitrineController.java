package br.com.novodenovo.controller;

import br.com.novodenovo.dto.FiltrosDTO;
import br.com.novodenovo.dto.LojaDTO;
import br.com.novodenovo.dto.NotebookCardDTO;
import br.com.novodenovo.dto.NotebookDetalheDTO;
import br.com.novodenovo.dto.ServicoDTO;
import br.com.novodenovo.service.VitrineService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vitrine")
public class VitrineController {
    private final VitrineService service;

    public VitrineController(VitrineService service) {
        this.service = service;
    }

    @GetMapping("/notebooks")
    public List<NotebookCardDTO> listar(
            @RequestParam(name = "marca", required = false) List<String> marcas,
            @RequestParam(name = "estado", required = false) List<String> estados,
            @RequestParam(name = "uso", required = false) List<String> usos,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) String ordenar) {
        return service.listar(marcas, estados, usos, precoMin, precoMax, ordenar);
    }

    @GetMapping("/notebooks/{codigo}")
    public NotebookDetalheDTO detalhe(@PathVariable String codigo) {
        return service.detalhe(codigo);
    }

    @GetMapping("/filtros")
    public FiltrosDTO filtros() {
        return service.filtros();
    }

    @GetMapping("/loja")
    public LojaDTO loja() {
        return service.loja();
    }

    @GetMapping("/servicos")
    public List<ServicoDTO> servicos() {
        return service.servicos();
    }
}
