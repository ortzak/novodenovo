package br.com.novodenovo.repository;

import br.com.novodenovo.model.Loja;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LojaRepository extends JpaRepository<Loja, Integer> {
}
