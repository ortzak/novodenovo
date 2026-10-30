package br.com.novodenovo.repository;

import br.com.novodenovo.model.EstadoNotebook;
import br.com.novodenovo.model.Notebook;
import br.com.novodenovo.model.StatusNotebook;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collection;

public final class NotebookSpecs {
    private NotebookSpecs() {}

    public static Specification<Notebook> statusEm(Collection<StatusNotebook> status) {
        return (root, query, cb) -> root.get("status").in(status);
    }

    public static Specification<Notebook> marcaEm(Collection<String> marcas) {
        return (root, query, cb) -> root.join("marca").get("nome").in(marcas);
    }

    public static Specification<Notebook> estadoEm(Collection<EstadoNotebook> estados) {
        return (root, query, cb) -> root.get("estado").in(estados);
    }

    public static Specification<Notebook> usoEm(Collection<String> usos) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Object, Object> uso = root.join("usos");
            return uso.get("nome").in(usos);
        };
    }

    public static Specification<Notebook> precoMinimo(BigDecimal min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("precoVenda"), min);
    }

    public static Specification<Notebook> precoMaximo(BigDecimal max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("precoVenda"), max);
    }
}
