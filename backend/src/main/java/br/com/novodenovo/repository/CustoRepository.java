package br.com.novodenovo.repository;

import br.com.novodenovo.model.Custo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustoRepository extends JpaRepository<Custo, Integer> {
    List<Custo> findByNotebookIdOrderByDataCustoAscIdAsc(Integer idNotebook);
}
