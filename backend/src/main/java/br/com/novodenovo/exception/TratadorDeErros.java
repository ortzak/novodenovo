package br.com.novodenovo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class TratadorDeErros {
    @ExceptionHandler(NaoEncontradoException.class)
    public ProblemDetail naoEncontrado(NaoEncontradoException e) {
        return problema(HttpStatus.NOT_FOUND, "Não encontrado", e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail requisicaoInvalida(IllegalArgumentException e) {
        return problema(HttpStatus.BAD_REQUEST, "Requisição inválida", e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail camposInvalidos(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getDefaultMessage())
                .findFirst()
                .orElse("Dados inválidos.");
        return problema(HttpStatus.BAD_REQUEST, "Dados inválidos", msg);
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ProblemDetail regra(RegraNegocioException e) {
        ProblemDetail p = problema(HttpStatus.UNPROCESSABLE_ENTITY, "Regra de negócio", e.getMessage());
        if (e.getCodigo() != null) p.setProperty("codigo", e.getCodigo());
        return p;
    }

    @ExceptionHandler(NaoAutorizadoException.class)
    public ProblemDetail naoAutorizado(NaoAutorizadoException e) {
        return problema(HttpStatus.UNAUTHORIZED, "Não autorizado", e.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail conflito(DataIntegrityViolationException e) {
        return problema(HttpStatus.CONFLICT, "Conflito",
                "Não foi possível salvar: já existe um registro com esses dados ou ele está em uso.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail arquivoGrande(MaxUploadSizeExceededException e) {
        return problema(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo grande demais", "Envie fotos de até 8 MB.");
    }

    private static ProblemDetail problema(HttpStatus status, String titulo, String detalhe) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(status, detalhe);
        p.setTitle(titulo);
        return p;
    }
}
