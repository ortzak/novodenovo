SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS vitrine_notebooks
    CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE vitrine_notebooks;

CREATE TABLE usuario (
    id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    email          VARCHAR(120) NOT NULL,
    senha_hash     CHAR(60)     NOT NULL,
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acesso  DATETIME     NULL,
    CONSTRAINT uq_usuario_email UNIQUE (email)
);

CREATE TABLE loja (
    id_loja               INT AUTO_INCREMENT PRIMARY KEY,
    nome                  VARCHAR(100) NOT NULL,
    whatsapp              VARCHAR(15)  NOT NULL,
    area_atendimento      VARCHAR(120) NOT NULL,
    horario_atendimento   VARCHAR(120) NOT NULL,
    instagram             VARCHAR(60)  NULL,
    garantia_padrao_dias  INT          NOT NULL DEFAULT 90,
    CONSTRAINT ck_loja_whatsapp CHECK (whatsapp REGEXP '^[0-9]{12,13}$'),
    CONSTRAINT ck_loja_garantia CHECK (garantia_padrao_dias BETWEEN 0 AND 365)
);

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

CREATE TABLE marca (
    id_marca  INT AUTO_INCREMENT PRIMARY KEY,
    nome      VARCHAR(40) NOT NULL,
    CONSTRAINT uq_marca_nome UNIQUE (nome)
);

CREATE TABLE uso (
    id_uso  INT AUTO_INCREMENT PRIMARY KEY,
    nome    VARCHAR(40) NOT NULL,
    CONSTRAINT uq_uso_nome UNIQUE (nome)
);

CREATE TABLE notebook (
    id_notebook         INT AUTO_INCREMENT PRIMARY KEY,
    codigo              VARCHAR(10)   NOT NULL,
    id_marca            INT           NOT NULL,
    modelo              VARCHAR(100)  NOT NULL,
    numero_serie        VARCHAR(40)   NOT NULL,
    processador         VARCHAR(80)   NOT NULL,
    memoria_ram_gb      INT           NOT NULL,
    armazenamento_gb    INT           NOT NULL,
    tipo_armazenamento  ENUM('SSD_NVME','SSD_SATA','HD') NOT NULL,
    tela_polegadas      DECIMAL(3,1)  NOT NULL,
    placa_video         VARCHAR(80)   NULL,
    sistema_operacional VARCHAR(40)   NULL,
    estado              ENUM('NOVO','SEMINOVO','RECONDICIONADO') NOT NULL,
    saude_bateria       TINYINT       NULL,
    marcas_uso          VARCHAR(255)  NULL,
    descricao           TEXT          NULL,
    valor_compra        DECIMAL(10,2) NOT NULL,
    data_compra         DATE          NOT NULL,
    fornecedor          VARCHAR(100)  NULL,
    preco_venda         DECIMAL(10,2) NOT NULL,
    status              ENUM('EM_PREPARACAO','DISPONIVEL','RESERVADO','VENDIDO')
                        NOT NULL DEFAULT 'EM_PREPARACAO',
    reservado_ate       DATETIME      NULL,
    data_cadastro       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_notebook_codigo UNIQUE (codigo),
    CONSTRAINT uq_notebook_serie  UNIQUE (numero_serie),
    CONSTRAINT fk_notebook_marca  FOREIGN KEY (id_marca) REFERENCES marca (id_marca),
    CONSTRAINT ck_notebook_valores CHECK (valor_compra >= 0 AND preco_venda > 0),
    CONSTRAINT ck_notebook_bateria CHECK (saude_bateria IS NULL OR saude_bateria BETWEEN 0 AND 100),
    CONSTRAINT ck_notebook_usado CHECK (
        estado = 'NOVO' OR (saude_bateria IS NOT NULL AND marcas_uso IS NOT NULL)),
    CONSTRAINT ck_notebook_reserva CHECK (
        status <> 'RESERVADO' OR reservado_ate IS NOT NULL)
);

CREATE TABLE notebook_uso (
    id_notebook_uso  INT AUTO_INCREMENT PRIMARY KEY,
    id_notebook      INT NOT NULL,
    id_uso           INT NOT NULL,
    CONSTRAINT uq_notebook_uso UNIQUE (id_notebook, id_uso),
    CONSTRAINT fk_nbuso_notebook FOREIGN KEY (id_notebook) REFERENCES notebook (id_notebook) ON DELETE CASCADE,
    CONSTRAINT fk_nbuso_uso      FOREIGN KEY (id_uso)      REFERENCES uso (id_uso)
);

CREATE TABLE foto_notebook (
    id_foto      INT AUTO_INCREMENT PRIMARY KEY,
    id_notebook  INT          NOT NULL,
    url          VARCHAR(255) NOT NULL,
    ordem        INT          NOT NULL DEFAULT 1,
    principal    BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_foto_notebook FOREIGN KEY (id_notebook) REFERENCES notebook (id_notebook) ON DELETE CASCADE
);

CREATE TABLE componente (
    id_componente  INT AUTO_INCREMENT PRIMARY KEY,
    id_notebook    INT          NOT NULL,
    tipo           ENUM('CARCACA','BATERIA','ALTO_FALANTES','PLACA_MAE','PROCESSADOR',
                        'PLACA_VIDEO','COOLER','MEMORIA_RAM','SSD_NVME','SSD_SATA','HD',
                        'PLACA_WIFI','TECLADO','TELA','OUTRO') NOT NULL,
    nome           VARCHAR(80)  NOT NULL,
    especificacao  VARCHAR(200) NOT NULL,
    quantidade     TINYINT      NOT NULL DEFAULT 1,
    imagem_url     VARCHAR(255) NULL,
    camada         INT          NOT NULL,
    CONSTRAINT fk_componente_notebook FOREIGN KEY (id_notebook) REFERENCES notebook (id_notebook) ON DELETE CASCADE,
    CONSTRAINT ck_componente_camada CHECK (camada BETWEEN 1 AND 20),
    CONSTRAINT ck_componente_qtd    CHECK (quantidade BETWEEN 1 AND 4)
);

CREATE TABLE custo (
    id_custo     INT AUTO_INCREMENT PRIMARY KEY,
    id_notebook  INT           NOT NULL,
    tipo         ENUM('PECA','REPARO','UPGRADE','LIMPEZA','OUTRO') NOT NULL,
    descricao    VARCHAR(150)  NOT NULL,
    valor        DECIMAL(10,2) NOT NULL,
    data_custo   DATE          NOT NULL,
    CONSTRAINT fk_custo_notebook FOREIGN KEY (id_notebook) REFERENCES notebook (id_notebook) ON DELETE CASCADE,
    CONSTRAINT ck_custo_valor CHECK (valor > 0)
);

CREATE TABLE cliente (
    id_cliente     INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    telefone       VARCHAR(15)  NOT NULL,
    email          VARCHAR(120) NULL,
    data_cadastro  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cliente_telefone UNIQUE (telefone)
);

CREATE TABLE venda (
    id_venda         INT AUTO_INCREMENT PRIMARY KEY,
    id_notebook      INT           NOT NULL,
    id_cliente       INT           NOT NULL,
    id_usuario       INT           NOT NULL,
    data_venda       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_final      DECIMAL(10,2) NOT NULL,
    forma_pagamento  ENUM('PIX','DINHEIRO','CARTAO_DEBITO','CARTAO_CREDITO','TRANSFERENCIA') NOT NULL,
    parcelas         TINYINT       NOT NULL DEFAULT 1,
    canal            ENUM('WHATSAPP','PRESENCIAL') NOT NULL,
    observacao       VARCHAR(255)  NULL,
    CONSTRAINT uq_venda_notebook UNIQUE (id_notebook),
    CONSTRAINT fk_venda_notebook FOREIGN KEY (id_notebook) REFERENCES notebook (id_notebook),
    CONSTRAINT fk_venda_cliente  FOREIGN KEY (id_cliente)  REFERENCES cliente (id_cliente),
    CONSTRAINT fk_venda_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuario (id_usuario),
    CONSTRAINT ck_venda_valor    CHECK (valor_final > 0),
    CONSTRAINT ck_venda_parcelas CHECK (parcelas BETWEEN 1 AND 24)
);

CREATE TABLE garantia (
    id_garantia  INT AUTO_INCREMENT PRIMARY KEY,
    id_venda     INT          NOT NULL,
    dias         INT          NOT NULL,
    data_inicio  DATE         NOT NULL,
    data_fim     DATE         NOT NULL,
    observacao   VARCHAR(255) NULL,
    CONSTRAINT uq_garantia_venda UNIQUE (id_venda),
    CONSTRAINT fk_garantia_venda FOREIGN KEY (id_venda) REFERENCES venda (id_venda) ON DELETE CASCADE,
    CONSTRAINT ck_garantia_dias  CHECK (dias BETWEEN 0 AND 365),
    CONSTRAINT ck_garantia_datas CHECK (data_fim >= data_inicio)
);

CREATE VIEW vw_notebook_custo AS
SELECT n.id_notebook,
       n.codigo,
       n.valor_compra,
       COALESCE(SUM(c.valor), 0)                  AS custos_adicionais,
       n.valor_compra + COALESCE(SUM(c.valor), 0) AS custo_total,
       n.preco_venda
FROM notebook n
LEFT JOIN custo c ON c.id_notebook = n.id_notebook
GROUP BY n.id_notebook, n.codigo, n.valor_compra, n.preco_venda;

CREATE VIEW vw_venda_lucro AS
SELECT v.id_venda,
       v.data_venda,
       nc.codigo,
       v.valor_final,
       nc.custo_total,
       v.valor_final - nc.custo_total AS lucro,
       v.canal
FROM venda v
JOIN vw_notebook_custo nc ON nc.id_notebook = v.id_notebook;

CREATE VIEW vw_vitrine AS
SELECT n.id_notebook, n.codigo, m.nome AS marca, n.modelo, n.processador,
       n.memoria_ram_gb, n.armazenamento_gb, n.tipo_armazenamento, n.tela_polegadas,
       n.placa_video, n.estado, n.saude_bateria, n.preco_venda, n.status
FROM notebook n
JOIN marca m ON m.id_marca = n.id_marca
WHERE n.status IN ('DISPONIVEL','RESERVADO');

INSERT INTO usuario (nome, email, senha_hash) VALUES
('Revendedor', 'admin@vitrine.com', '$2a$10$GdQ.vgUUPyomiKhVFEWJ.uBeZsg2ulYRZ/ORSGfVJdC/n3AnQLVI2');

INSERT INTO loja (nome, whatsapp, area_atendimento, horario_atendimento) VALUES
('Vitrine de Notebooks', '5511948879114', 'São Paulo e região',
 'Seg a Sex 9h-18h, Sáb 9h-13h');

INSERT INTO servico (nome, descricao, prazo, ordem) VALUES
('Limpeza interna', 'Remoção de poeira, limpeza do cooler e troca da pasta térmica. O notebook esquenta menos e fica mais silencioso.', 'no mesmo dia', 1),
('Manutenção e diagnóstico', 'Notebook não liga, desliga sozinho, está lento ou com defeito? Fazemos o diagnóstico e explicamos antes de mexer.', 'orçamento grátis', 2),
('Troca de peças', 'Tela, teclado, bateria, carregador, dobradiça, conector de carga e outras peças, com garantia.', 'conforme a peça', 3),
('Upgrade de SSD e memória', 'Troca do HD por SSD e aumento de memória RAM para deixar o notebook mais rápido, com cópia dos seus arquivos.', 'no mesmo dia', 4),
('Formatação e programas', 'Instalação do Windows, drivers e programas, com backup dos seus arquivos antes.', 'no mesmo dia', 5);

INSERT INTO marca (nome) VALUES ('Apple'), ('Dell'), ('Lenovo'), ('Samsung'), ('Acer');
INSERT INTO uso (nome) VALUES ('Estudo'), ('Programação'), ('Jogos'), ('Design'), ('Escritório');

INSERT INTO notebook (codigo, id_marca, modelo, numero_serie, processador, memoria_ram_gb,
    armazenamento_gb, tipo_armazenamento, tela_polegadas, placa_video, sistema_operacional,
    estado, saude_bateria, marcas_uso, valor_compra, data_compra, fornecedor, preco_venda,
    status, reservado_ate) VALUES
('NB-0001', 2, 'Inspiron 15 3520', 'DL3520X91A', 'Intel Core i5-1235U', 16, 512, 'SSD_NVME', 15.6,
 NULL, 'Windows 11', 'SEMINOVO', 87, 'Leves riscos na tampa', 1900.00, '2026-09-10', 'Particular', 2799.00,
 'DISPONIVEL', NULL),
('NB-0002', 3, 'IdeaPad Gaming 3', 'LNIPG3Z22K', 'AMD Ryzen 5 5600H', 16, 512, 'SSD_NVME', 15.6,
 'NVIDIA RTX 3050', 'Windows 11', 'RECONDICIONADO', 92, 'Teclado substituído', 2600.00, '2026-09-18', 'Lote OLX', 3899.00,
 'RESERVADO', '2026-10-25 18:00:00'),
('NB-0003', 1, 'MacBook Air M2', 'C02MBA2M2Q', 'Apple M2', 8, 256, 'SSD_NVME', 13.6,
 NULL, 'macOS', 'NOVO', NULL, NULL, 5200.00, '2026-10-01', 'Distribuidor X', 6499.00,
 'EM_PREPARACAO', NULL);

INSERT INTO notebook_uso (id_notebook, id_uso) VALUES (1,1),(1,5),(2,3),(2,2),(3,2),(3,4);

INSERT INTO foto_notebook (id_notebook, url, ordem, principal) VALUES
(1, '/img/nb-0001-1.jpg', 1, TRUE), (2, '/img/nb-0002-1.jpg', 1, TRUE), (3, '/img/nb-0003-1.jpg', 1, TRUE);

INSERT INTO componente (id_notebook, tipo, nome, especificacao, quantidade, imagem_url, camada) VALUES
(2, 'CARCACA',     'Carcaça inferior', 'Alumínio, 4 pés antiderrapantes',            1, NULL, 1),
(2, 'BATERIA',     'Bateria',          '45 Wh, 3 células - saúde 92%',               1, NULL, 2),
(2, 'PLACA_MAE',   'Placa-mãe',        'Chipset AMD, 2 slots SO-DIMM',               1, NULL, 3),
(2, 'PROCESSADOR', 'Processador',      'AMD Ryzen 5 5600H - 6 núcleos / 12 threads', 1, NULL, 4),
(2, 'PLACA_VIDEO', 'Placa de vídeo',   'NVIDIA RTX 3050 4 GB GDDR6 (soldada)',       1, NULL, 5),
(2, 'COOLER',      'Cooler',           'Ventoinha dupla, heatpipe de cobre',         1, NULL, 6),
(2, 'MEMORIA_RAM', 'Memória RAM',      '2 x 8 GB DDR4 3200 MHz',                     2, NULL, 7),
(2, 'SSD_NVME',    'SSD',              '512 GB NVMe PCIe 3.0',                       1, NULL, 8),
(2, 'TECLADO',     'Teclado e touchpad','ABNT2 retroiluminado (substituído 09/2026)', 1, NULL, 9),
(2, 'TELA',        'Tela',             '15,6" Full HD IPS 120 Hz',                   1, NULL, 10);

INSERT INTO custo (id_notebook, tipo, descricao, valor, data_custo) VALUES
(1, 'LIMPEZA', 'Limpeza interna e pasta térmica', 80.00,  '2026-09-12'),
(2, 'PECA',    'Teclado ABNT2 novo',             180.00, '2026-09-20'),
(2, 'UPGRADE', 'Memória extra 8 GB',             150.00, '2026-09-20');

INSERT INTO notebook (codigo, id_marca, modelo, numero_serie, processador, memoria_ram_gb,
    armazenamento_gb, tipo_armazenamento, tela_polegadas, sistema_operacional, estado,
    saude_bateria, marcas_uso, valor_compra, data_compra, preco_venda, status) VALUES
('NB-0004', 4, 'Galaxy Book 2', 'SGB2K77P01', 'Intel Core i5-1235U', 8, 256, 'SSD_NVME', 15.6,
 'Windows 11', 'SEMINOVO', 80, 'Sem marcas aparentes', 1700.00, '2026-08-20', 2499.00, 'VENDIDO');

INSERT INTO cliente (nome, telefone) VALUES ('Ana Souza', '5511988887777');

INSERT INTO venda (id_notebook, id_cliente, id_usuario, data_venda, valor_final, forma_pagamento, canal)
VALUES (4, 1, 1, '2026-10-05 14:30:00', 2400.00, 'PIX', 'PRESENCIAL');

INSERT INTO garantia (id_venda, dias, data_inicio, data_fim)
VALUES (1, 90, '2026-10-05', DATE_ADD('2026-10-05', INTERVAL 90 DAY));

UPDATE loja SET nome = 'NovoDeNovo', instagram = '@novodenovo' WHERE id_loja = 1;

INSERT INTO notebook (codigo, id_marca, modelo, numero_serie, processador, memoria_ram_gb,
    armazenamento_gb, tipo_armazenamento, tela_polegadas, placa_video, sistema_operacional,
    estado, saude_bateria, marcas_uso, descricao, valor_compra, data_compra, fornecedor, preco_venda,
    status, data_cadastro) VALUES
('NB-0005', 5, 'Nitro 5', 'ACN5AN515X', 'Intel Core i5-11400H', 16, 512, 'SSD_NVME', 15.6, 'NVIDIA RTX 3050', 'Windows 11', 'SEMINOVO', 85, 'Pequeno amassado na lateral direita', 'Tem SSD para o sistema e HD de 1 TB para jogos e arquivos.', 2950.00, '2026-09-25', 'Particular', 3699.00, 'DISPONIVEL', '2026-09-27 09:30:00'),
('NB-0006', 3, 'ThinkPad T14 Gen 2', 'LNT14G2R7P', 'AMD Ryzen 7 PRO 5850U', 16, 512, 'SSD_NVME', 14.0, NULL, 'Windows 11 Pro', 'RECONDICIONADO', 100, 'Bateria nova, carcaça com marcas leves', 'Linha corporativa, teclado excelente e bateria trocada por uma nova.', 2480.00, '2026-10-02', 'Lote corporativo', 3299.00, 'DISPONIVEL', '2026-10-04 14:00:00'),
('NB-0007', 1, 'MacBook Air M1', 'C02MBA1M1Z', 'Apple M1', 8, 256, 'SSD_NVME', 13.3, NULL, 'macOS', 'SEMINOVO', 89, 'Sem marcas aparentes', 'Silencioso (não tem ventoinha) e com bateria que dura o dia todo.', 3300.00, '2026-10-06', 'Particular', 4299.00, 'DISPONIVEL', '2026-10-08 11:00:00'),
('NB-0008', 4, 'Galaxy Book2', 'SGB2K88Q02', 'Intel Core i5-1235U', 8, 512, 'SSD_NVME', 15.6, NULL, 'Windows 11', 'SEMINOVO', 80, 'Riscos leves no apoio de mãos', 'Ganhou um SSD SATA extra de 256 GB além do SSD original.', 1650.00, '2026-10-10', 'Particular', 2399.00, 'DISPONIVEL', '2026-10-12 16:20:00');

INSERT INTO notebook_uso (id_notebook, id_uso) VALUES (5,3), (5,2), (6,2), (6,5), (7,1), (7,4), (8,1), (8,5);
INSERT INTO foto_notebook (id_notebook, url, ordem, principal) VALUES (5, '/img/nb-0005-1.jpg', 1, TRUE), (6, '/img/nb-0006-1.jpg', 1, TRUE), (7, '/img/nb-0007-1.jpg', 1, TRUE), (8, '/img/nb-0008-1.jpg', 1, TRUE);

INSERT INTO componente (id_notebook, tipo, nome, especificacao, quantidade, imagem_url, camada) VALUES
(1, 'CARCACA', 'Carcaça inferior', 'Plástico texturizado, 4 pés de borracha', 1, NULL, 1),
(1, 'BATERIA', 'Bateria', '41 Wh, 3 células - saúde 87%', 1, NULL, 2),
(1, 'PLACA_MAE', 'Placa-mãe', 'Chipset Intel, 2 slots SO-DIMM', 1, NULL, 3),
(1, 'PROCESSADOR', 'Processador', 'Intel Core i5-1235U - 10 núcleos / 12 threads', 1, NULL, 4),
(1, 'COOLER', 'Cooler', 'Ventoinha simples, limpa e com pasta térmica nova', 1, NULL, 5),
(1, 'MEMORIA_RAM', 'Memória RAM', '2 x 8 GB DDR4 2666 MHz', 2, NULL, 6),
(1, 'SSD_NVME', 'SSD', '512 GB NVMe PCIe 3.0', 1, NULL, 7),
(1, 'PLACA_WIFI', 'Placa Wi-Fi', 'Wi-Fi 5 + Bluetooth 5.0', 1, NULL, 8),
(1, 'TECLADO', 'Teclado e touchpad', 'ABNT2 com teclado numérico', 1, NULL, 9),
(1, 'TELA', 'Tela', '15,6" Full HD · 120 Hz', 1, NULL, 10),
(5, 'CARCACA', 'Carcaça inferior', 'Plástico com saídas de ar traseiras', 1, NULL, 1),
(5, 'BATERIA', 'Bateria', '57 Wh, 4 células - saúde 85%', 1, NULL, 2),
(5, 'ALTO_FALANTES', 'Alto-falantes', '2 x 2 W estéreo', 1, NULL, 3),
(5, 'PLACA_MAE', 'Placa-mãe', 'Chipset Intel HM570', 1, NULL, 4),
(5, 'PROCESSADOR', 'Processador', 'Intel Core i5-11400H - 6 núcleos / 12 threads', 1, NULL, 5),
(5, 'PLACA_VIDEO', 'Placa de vídeo', 'NVIDIA RTX 3050 4 GB GDDR6 (soldada)', 1, NULL, 6),
(5, 'COOLER', 'Cooler', 'Ventoinha dupla, heatpipes de cobre', 1, NULL, 7),
(5, 'MEMORIA_RAM', 'Memória RAM', '2 x 8 GB DDR4 3200 MHz', 2, NULL, 8),
(5, 'SSD_NVME', 'SSD', '512 GB NVMe PCIe 3.0', 1, NULL, 9),
(5, 'HD', 'HD', '1 TB SATA 5400 rpm', 1, NULL, 10),
(5, 'PLACA_WIFI', 'Placa Wi-Fi', 'Wi-Fi 6 + Bluetooth 5.1', 1, NULL, 11),
(5, 'TECLADO', 'Teclado e touchpad', 'ABNT2 retroiluminado', 1, NULL, 12),
(5, 'TELA', 'Tela', '15,6" Full HD IPS · 144 Hz', 1, NULL, 13),
(6, 'CARCACA', 'Carcaça inferior', 'Fibra de vidro reforçada', 1, NULL, 1),
(6, 'BATERIA', 'Bateria', '50 Wh - nova (saúde 100%)', 1, NULL, 2),
(6, 'PLACA_MAE', 'Placa-mãe', 'Placa Lenovo com 1 slot SO-DIMM', 1, NULL, 3),
(6, 'PROCESSADOR', 'Processador', 'AMD Ryzen 7 PRO 5850U - 8 núcleos / 16 threads', 1, NULL, 4),
(6, 'COOLER', 'Cooler', 'Ventoinha simples', 1, NULL, 5),
(6, 'MEMORIA_RAM', 'Memória RAM', '16 GB DDR4 3200 MHz (8 soldada + 8 no slot)', 1, NULL, 6),
(6, 'SSD_NVME', 'SSD', '512 GB NVMe PCIe 3.0', 1, NULL, 7),
(6, 'PLACA_WIFI', 'Placa Wi-Fi', 'Wi-Fi 6 + Bluetooth 5.2', 1, NULL, 8),
(6, 'TECLADO', 'Teclado e touchpad', 'ABNT2 com TrackPoint', 1, NULL, 9),
(6, 'TELA', 'Tela', '14" Full HD IPS antirreflexo', 1, NULL, 10),
(7, 'CARCACA', 'Carcaça inferior', 'Alumínio unibody', 1, NULL, 1),
(7, 'BATERIA', 'Bateria', '49,9 Wh - saúde 89%', 1, NULL, 2),
(7, 'PLACA_MAE', 'Placa-mãe', 'Placa lógica com chip M1 e memória unificada', 1, NULL, 3),
(7, 'PROCESSADOR', 'Processador', 'Apple M1 - 8 núcleos de CPU, 7 de GPU', 1, NULL, 4),
(7, 'SSD_NVME', 'SSD', '256 GB (soldado na placa)', 1, NULL, 5),
(7, 'TECLADO', 'Teclado e trackpad', 'Magic Keyboard retroiluminado', 1, NULL, 6),
(7, 'TELA', 'Tela', '13,3" Retina 2560 x 1600', 1, NULL, 7),
(8, 'CARCACA', 'Carcaça inferior', 'Plástico prata', 1, NULL, 1),
(8, 'BATERIA', 'Bateria', '43 Wh - saúde 80%', 1, NULL, 2),
(8, 'PLACA_MAE', 'Placa-mãe', 'Chipset Intel, 1 slot SO-DIMM', 1, NULL, 3),
(8, 'PROCESSADOR', 'Processador', 'Intel Core i5-1235U - 10 núcleos / 12 threads', 1, NULL, 4),
(8, 'COOLER', 'Cooler', 'Ventoinha simples', 1, NULL, 5),
(8, 'MEMORIA_RAM', 'Memória RAM', '8 GB DDR4 3200 MHz', 1, NULL, 6),
(8, 'SSD_NVME', 'SSD', '256 GB NVMe (original)', 1, NULL, 7),
(8, 'SSD_SATA', 'SSD SATA', '256 GB SATA 2,5" (upgrade)', 1, NULL, 8),
(8, 'TECLADO', 'Teclado e touchpad', 'ABNT2 com teclado numérico', 1, NULL, 9),
(8, 'TELA', 'Tela', '15,6" Full HD', 1, NULL, 10);
