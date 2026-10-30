package br.com.novodenovo.controller;

import br.com.novodenovo.dto.LojaDTO;
import br.com.novodenovo.dto.admin.*;
import br.com.novodenovo.seguranca.AutenticacaoInterceptor;
import br.com.novodenovo.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class PainelController {
    private final PainelNotebookService notebooks;
    private final PainelVendaService vendas;
    private final DashboardService dashboard;
    private final ConfiguracaoService configuracao;
    private final AutenticacaoService autenticacao;
    private final VitrineService vitrine;

    public PainelController(PainelNotebookService notebooks, PainelVendaService vendas, DashboardService dashboard,
                            ConfiguracaoService configuracao, AutenticacaoService autenticacao, VitrineService vitrine) {
        this.notebooks = notebooks;
        this.vendas = vendas;
        this.dashboard = dashboard;
        this.configuracao = configuracao;
        this.autenticacao = autenticacao;
        this.vitrine = vitrine;
    }

    @GetMapping("/dashboard")
    public DashboardDTO dashboard(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Integer usuario) {
        return dashboard.montar(usuario);
    }

    @GetMapping("/opcoes")
    public OpcoesDTO opcoes() {
        return notebooks.opcoes();
    }

    @GetMapping("/notebooks")
    public List<NotebookResumoDTO> listar() {
        return notebooks.listar();
    }

    @GetMapping("/notebooks/{id}")
    public NotebookAdminDTO buscar(@PathVariable int id) {
        return notebooks.buscar(id);
    }

    @PostMapping("/notebooks")
    @ResponseStatus(HttpStatus.CREATED)
    public NotebookAdminDTO criar(@Valid @RequestBody NotebookFormDTO dados) {
        return notebooks.criar(dados);
    }

    @PutMapping("/notebooks/{id}")
    public NotebookAdminDTO atualizar(@PathVariable int id, @Valid @RequestBody NotebookFormDTO dados) {
        return notebooks.atualizar(id, dados);
    }

    @DeleteMapping("/notebooks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable int id) {
        notebooks.excluir(id);
    }

    @PostMapping("/notebooks/{id}/fotos")
    public List<FotoDTO> enviarFotos(@PathVariable int id, @RequestParam("arquivos") List<MultipartFile> arquivos) {
        return notebooks.enviarFotos(id, arquivos);
    }

    @PutMapping("/fotos/{idFoto}/principal")
    public List<FotoDTO> principal(@PathVariable int idFoto) {
        return notebooks.definirPrincipal(idFoto);
    }

    @DeleteMapping("/fotos/{idFoto}")
    public List<FotoDTO> excluirFoto(@PathVariable int idFoto) {
        return notebooks.excluirFoto(idFoto);
    }

    @PostMapping("/notebooks/{id}/componentes")
    public List<ComponenteAdminDTO> adicionarComponente(@PathVariable int id, @Valid @RequestBody ComponenteFormDTO dados) {
        return notebooks.adicionarComponente(id, dados);
    }

    @PostMapping("/notebooks/{id}/componentes/gerar")
    public List<ComponenteAdminDTO> gerarComponentes(@PathVariable int id) {
        return notebooks.gerarComponentes(id);
    }

    @PutMapping("/componentes/{idComponente}")
    public List<ComponenteAdminDTO> atualizarComponente(@PathVariable int idComponente,
                                                        @Valid @RequestBody ComponenteFormDTO dados) {
        return notebooks.atualizarComponente(idComponente, dados);
    }

    @DeleteMapping("/componentes/{idComponente}")
    public List<ComponenteAdminDTO> excluirComponente(@PathVariable int idComponente) {
        return notebooks.excluirComponente(idComponente);
    }

    @PostMapping("/notebooks/{id}/custos")
    public List<CustoDTO> adicionarCusto(@PathVariable int id, @Valid @RequestBody CustoFormDTO dados) {
        return notebooks.adicionarCusto(id, dados);
    }

    @DeleteMapping("/custos/{idCusto}")
    public List<CustoDTO> excluirCusto(@PathVariable int idCusto) {
        return notebooks.excluirCusto(idCusto);
    }

    @PostMapping("/notebooks/{id}/venda")
    @ResponseStatus(HttpStatus.CREATED)
    public VendaDTO registrarVenda(@PathVariable int id,
                                   @RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Integer usuario,
                                   @Valid @RequestBody VendaFormDTO dados) {
        return vendas.registrar(id, usuario, dados);
    }

    @GetMapping("/vendas")
    public List<VendaDTO> vendas() {
        return vendas.listar();
    }

    @DeleteMapping("/vendas/{idVenda}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desfazerVenda(@PathVariable int idVenda) {
        vendas.desfazer(idVenda);
    }

    @GetMapping("/garantias")
    public List<GarantiaDTO> garantias() {
        return vendas.garantias();
    }

    @GetMapping("/loja")
    public LojaDTO loja() {
        return vitrine.loja();
    }

    @PutMapping("/loja")
    public LojaDTO salvarLoja(@Valid @RequestBody LojaFormDTO dados) {
        return configuracao.salvarLoja(dados);
    }

    @GetMapping("/servicos")
    public List<ServicoAdminDTO> servicos() {
        return configuracao.servicos();
    }

    @PostMapping("/servicos")
    public List<ServicoAdminDTO> criarServico(@Valid @RequestBody ServicoAdminDTO dados) {
        return configuracao.salvarServico(null, dados);
    }

    @PutMapping("/servicos/{id}")
    public List<ServicoAdminDTO> atualizarServico(@PathVariable int id, @Valid @RequestBody ServicoAdminDTO dados) {
        return configuracao.salvarServico(id, dados);
    }

    @DeleteMapping("/servicos/{id}")
    public List<ServicoAdminDTO> excluirServico(@PathVariable int id) {
        return configuracao.excluirServico(id);
    }

    @PutMapping("/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void trocarSenha(@RequestAttribute(AutenticacaoInterceptor.ATRIBUTO_USUARIO) Integer usuario,
                            @Valid @RequestBody TrocaSenhaDTO dados) {
        autenticacao.trocarSenha(usuario, dados);
    }
}
