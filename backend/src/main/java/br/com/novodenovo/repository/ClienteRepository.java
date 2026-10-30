package br.com.novodenovo.repository;

import br.com.novodenovo.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByTelefone(String telefone);
}
