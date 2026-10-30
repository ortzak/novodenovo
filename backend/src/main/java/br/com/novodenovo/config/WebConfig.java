package br.com.novodenovo.config;

import br.com.novodenovo.seguranca.AutenticacaoInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AutenticacaoInterceptor autenticacao;
    private final String pastaFotos;

    public WebConfig(AutenticacaoInterceptor autenticacao, @Value("${app.fotos.pasta}") String pastaFotos) {
        this.autenticacao = autenticacao;
        this.pastaFotos = pastaFotos;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(autenticacao).addPathPatterns("/api/admin/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String local = Path.of(pastaFotos).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/fotos/**").addResourceLocations(local.endsWith("/") ? local : local + "/");
    }
}
