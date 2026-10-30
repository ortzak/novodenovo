package br.com.novodenovo.service;

import br.com.novodenovo.dto.LojaDTO;
import br.com.novodenovo.dto.admin.LojaFormDTO;
import br.com.novodenovo.dto.admin.ServicoAdminDTO;
import br.com.novodenovo.exception.NaoEncontradoException;
import br.com.novodenovo.exception.RegraNegocioException;
import br.com.novodenovo.model.Loja;
import br.com.novodenovo.model.Servico;
import br.com.novodenovo.repository.LojaRepository;
import br.com.novodenovo.repository.ServicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ConfiguracaoService {
    private final LojaRepository lojas;
    private final ServicoRepository servicos;

    public ConfiguracaoService(LojaRepository lojas, ServicoRepository servicos) {
        this.lojas = lojas;
        this.servicos = servicos;
    }

    public LojaDTO salvarLoja(LojaFormDTO d) {
        String whatsapp = d.whatsapp().replaceAll("\\D", "");
        if (whatsapp.length() == 10 || whatsapp.length() == 11) whatsapp = "55" + whatsapp;
        if (whatsapp.length() < 12 || whatsapp.length() > 13) {
            throw new RegraNegocioException("WhatsApp inválido. Use DDD + número, ex.: (11) 94887-9114.");
        }
        Loja l = lojas.findAll().stream().findFirst().orElseGet(Loja::new);
        l.setNome(d.nome().trim());
        l.setWhatsapp(whatsapp);
        l.setAreaAtendimento(d.areaAtendimento().trim());
        l.setHorarioAtendimento(d.horarioAtendimento().trim());
        l.setInstagram(d.instagram() == null || d.instagram().isBlank() ? null : d.instagram().trim());
        l.setGarantiaPadraoDias(d.garantiaPadraoDias());
        lojas.save(l);
        return new LojaDTO(l.getNome(), l.getWhatsapp(), l.getAreaAtendimento(), l.getHorarioAtendimento(),
                l.getInstagram(), l.getGarantiaPadraoDias());
    }

    @Transactional(readOnly = true)
    public List<ServicoAdminDTO> servicos() {
        return servicos.findAllByOrderByOrdemAscNomeAsc().stream().map(ConfiguracaoService::dto).toList();
    }

    public List<ServicoAdminDTO> salvarServico(Integer id, ServicoAdminDTO d) {
        Servico s = id == null ? new Servico()
                : servicos.findById(id).orElseThrow(() -> new NaoEncontradoException("Serviço não encontrado."));
        s.setNome(d.nome().trim());
        s.setDescricao(d.descricao().trim());
        s.setPrecoAPartir(d.precoAPartir());
        s.setPrazo(d.prazo() == null || d.prazo().isBlank() ? null : d.prazo().trim());
        s.setOrdem(d.ordem() != null ? d.ordem() : (id == null ? servicos.findAll().size() + 1 : s.getOrdem()));
        s.setAtivo(d.ativo() == null || d.ativo());
        servicos.save(s);
        return servicos();
    }

    public List<ServicoAdminDTO> excluirServico(int id) {
        servicos.deleteById(id);
        servicos.flush();
        return servicos();
    }

    private static ServicoAdminDTO dto(Servico s) {
        return new ServicoAdminDTO(s.getId(), s.getNome(), s.getDescricao(), s.getPrecoAPartir(), s.getPrazo(),
                s.getOrdem(), s.getAtivo());
    }
}
