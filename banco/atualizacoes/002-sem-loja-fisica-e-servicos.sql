SET NAMES utf8mb4;
USE vitrine_notebooks;

ALTER TABLE loja
    ADD COLUMN area_atendimento VARCHAR(120) NOT NULL DEFAULT 'São Paulo e região' AFTER whatsapp,
    DROP COLUMN endereco,
    DROP COLUMN cidade,
    DROP COLUMN uf;
ALTER TABLE loja ALTER COLUMN area_atendimento DROP DEFAULT;

CREATE TABLE servico (
    id_servico     INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(80)   NOT NULL,
    descricao      VARCHAR(300)  NOT NULL,
    preco_a_partir DECIMAL(10,2) NULL,
    prazo          VARCHAR(60)   NULL,
    ordem          INT           NOT NULL DEFAULT 0,
    ativo          BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_servico_nome UNIQUE (nome),
    CONSTRAINT ck_servico_preco CHECK (preco_a_partir IS NULL OR preco_a_partir >= 0)
);

INSERT INTO servico (nome, descricao, prazo, ordem) VALUES
('Limpeza interna', 'Remoção de poeira, limpeza do cooler e troca da pasta térmica. O notebook esquenta menos e fica mais silencioso.', 'no mesmo dia', 1),
('Manutenção e diagnóstico', 'Notebook não liga, desliga sozinho, está lento ou com defeito? Fazemos o diagnóstico e explicamos antes de mexer.', 'orçamento grátis', 2),
('Troca de peças', 'Tela, teclado, bateria, carregador, dobradiça, conector de carga e outras peças, com garantia.', 'conforme a peça', 3),
('Upgrade de SSD e memória', 'Troca do HD por SSD e aumento de memória RAM para deixar o notebook mais rápido, com cópia dos seus arquivos.', 'no mesmo dia', 4),
('Formatação e programas', 'Instalação do Windows, drivers e programas, com backup dos seus arquivos antes.', 'no mesmo dia', 5);
