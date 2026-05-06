CREATE DATABASE IF NOT EXISTS clube_dos_pets
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clube_dos_pets;

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS endereco (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(20),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS estabelecimento (
    id_estabelecimento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    telefone VARCHAR(30),
    email_contato VARCHAR(150),
    site VARCHAR(255),
    id_endereco INT NOT NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_estabelecimento_endereco
        FOREIGN KEY (id_endereco)
        REFERENCES endereco(id_endereco)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_estabelecimento_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT uq_estabelecimento_endereco
        UNIQUE (id_endereco)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS foto_estabelecimento (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    url_foto VARCHAR(500) NOT NULL,
    legenda VARCHAR(255),
    id_estabelecimento INT NOT NULL,
    CONSTRAINT fk_foto_estabelecimento
        FOREIGN KEY (id_estabelecimento)
        REFERENCES estabelecimento(id_estabelecimento)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS avaliacao (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    nota INT NOT NULL,
    comentario TEXT,
    data_avaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    CONSTRAINT fk_avaliacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_avaliacao_estabelecimento
        FOREIGN KEY (id_estabelecimento)
        REFERENCES estabelecimento(id_estabelecimento)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_avaliacao_nota
        CHECK (nota >= 1 AND nota <= 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorito (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    data_favorito DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_favorito_estabelecimento
        FOREIGN KEY (id_estabelecimento)
        REFERENCES estabelecimento(id_estabelecimento)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT uq_usuario_estabelecimento_favorito
        UNIQUE (id_usuario, id_estabelecimento)
) ENGINE=InnoDB;

INSERT IGNORE INTO categoria (id_categoria, nome_categoria) VALUES
  (1, 'Veterinário'),
  (2, 'Hotéis para Pets'),
  (3, 'Restaurantes'),
  (4, 'Shoppings'),
  (5, 'Parques'),
  (6, 'Casas de Ração'),
  (7, 'Bares');

INSERT IGNORE INTO endereco (id_endereco, logradouro, numero, bairro, cidade, uf, cep, latitude, longitude) VALUES
  (1, 'Rua das Flores', '120', 'Centro', 'São Paulo', 'SP', '01000-000', -23.55052000, -46.63330800),
  (2, 'Avenida Paulista', '900', 'Bela Vista', 'São Paulo', 'SP', '01310-100', -23.56139900, -46.65657100),
  (3, 'Rua Augusta', '450', 'Consolação', 'São Paulo', 'SP', '01305-000', -23.54894300, -46.65063500),
  (4, 'Rua Vergueiro', '1500', 'Vila Mariana', 'São Paulo', 'SP', '04101-000', -23.58967100, -46.63422800),
  (5, 'Rua dos Pinheiros', '300', 'Pinheiros', 'São Paulo', 'SP', '05422-000', -23.56725700, -46.69219400);

INSERT IGNORE INTO usuario (id_usuario, cpf, nome, email, senha, data_cadastro) VALUES
  (1, NULL, 'Ana Silva', 'ana@email.com', '$2b$10$ns7WztqgK6RybEOENW9JUeAoo3AZg7RBxmrtjpt6.P/m3Ev1lnXbO', '2026-04-22 10:00:00'),
  (2, NULL, 'Carlos Souza', 'carlos@email.com', '$2b$10$ns7WztqgK6RybEOENW9JUeAoo3AZg7RBxmrtjpt6.P/m3Ev1lnXbO', '2026-04-22 11:00:00');

INSERT IGNORE INTO estabelecimento (id_estabelecimento, nome, descricao, telefone, email_contato, site, id_endereco, id_categoria) VALUES
  (1, 'Clínica Vet Amigo Fiel', 'Atendimento veterinário com consultas e emergências.', '(11) 99999-1111', 'contato@vetamigofiel.com', 'www.vetamigofiel.com', 1, 1),
  (2, 'Hotel Pet Feliz', 'Hospedagem para cães e gatos com monitoramento.', '(11) 98888-2222', 'reserva@hotelpetfeliz.com', 'www.hotelpetfeliz.com', 2, 2),
  (3, 'Restaurante Sabor & Patas', 'Restaurante com área externa pet friendly.', '(11) 97777-3333', 'contato@saborepatas.com', 'www.saborepatas.com', 3, 3),
  (4, 'Shopping Pet Center', 'Shopping com acesso permitido para pets.', '(11) 96666-4444', 'atendimento@shoppingpetcenter.com', 'www.shoppingpetcenter.com', 4, 4),
  (5, 'Parque Verde Pet', 'Espaço ao ar livre para passeios com animais.', '(11) 95555-5555', 'contato@parqueverdepet.com', 'www.parqueverdepet.com', 5, 5);

INSERT IGNORE INTO avaliacao (id_avaliacao, nota, comentario, data_avaliacao, id_usuario, id_estabelecimento) VALUES
  (1, 5, 'Ótimo atendimento e ambiente muito limpo.', '2026-04-22 14:00:00', 1, 1),
  (2, 4, 'Gostei bastante do serviço e da recepção aos pets.', '2026-04-22 15:00:00', 2, 2);

INSERT IGNORE INTO favorito (id_favorito, data_favorito, id_usuario, id_estabelecimento) VALUES
  (1, '2026-04-22 16:00:00', 1, 2),
  (2, '2026-04-22 16:30:00', 2, 1);
