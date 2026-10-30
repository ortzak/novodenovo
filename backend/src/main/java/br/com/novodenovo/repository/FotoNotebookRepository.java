package br.com.novodenovo.repository;

import br.com.novodenovo.model.FotoNotebook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FotoNotebookRepository extends JpaRepository<FotoNotebook, Integer> {
    List<FotoNotebook> findByNotebookIdOrderByOrdemAsc(Integer idNotebook);
}
