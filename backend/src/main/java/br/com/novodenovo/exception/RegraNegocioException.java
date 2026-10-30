package br.com.novodenovo.exception;

public class RegraNegocioException extends RuntimeException {
    private final String codigo;

    public RegraNegocioException(String mensagem) {
        this(null, mensagem);
    }

    public RegraNegocioException(String codigo, String mensagem) {
        super(mensagem);
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }
}
