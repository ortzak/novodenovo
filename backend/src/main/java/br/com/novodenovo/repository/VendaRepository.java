package br.com.novodenovo.repository;

import br.com.novodenovo.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Integer> {
    Optional<Venda> findByNotebookId(Integer idNotebook);

    List<Venda> findAllByOrderByDataVendaDesc();
}
