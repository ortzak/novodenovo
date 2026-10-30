package br.com.novodenovo.repository;

import br.com.novodenovo.model.Garantia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GarantiaRepository extends JpaRepository<Garantia, Integer> {
    Optional<Garantia> findByVendaId(Integer idVenda);

    List<Garantia> findAllByOrderByDataFimAsc();
}
