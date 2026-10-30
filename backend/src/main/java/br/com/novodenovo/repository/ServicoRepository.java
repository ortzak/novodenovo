package br.com.novodenovo.repository;

import br.com.novodenovo.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Integer> {
    List<Servico> findByAtivoTrueOrderByOrdemAscNomeAsc();

    List<Servico> findAllByOrderByOrdemAscNomeAsc();
}
