package br.com.novodenovo.repository;

import br.com.novodenovo.model.Componente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComponenteRepository extends JpaRepository<Componente, Integer> {
    List<Componente> findByNotebookIdOrderByCamadaAsc(Integer idNotebook);
}
