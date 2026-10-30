package br.com.novodenovo.repository;

import br.com.novodenovo.model.Notebook;
import br.com.novodenovo.model.StatusNotebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.Optional;

public interface NotebookRepository extends JpaRepository<Notebook, Integer>,
        JpaSpecificationExecutor<Notebook> {
    Optional<Notebook> findByCodigoAndStatusIn(String codigo, Collection<StatusNotebook> status);
}
