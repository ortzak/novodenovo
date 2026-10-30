package br.com.novodenovo.repository;

import br.com.novodenovo.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    Optional<Marca> findByNomeIgnoreCase(String nome);
}
