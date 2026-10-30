package br.com.novodenovo.repository;

import br.com.novodenovo.model.Uso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface UsoRepository extends JpaRepository<Uso, Integer> {
    List<Uso> findByNomeIn(Collection<String> nomes);
}
