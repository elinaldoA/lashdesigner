-- ============================================================
-- LASH DESIGNER - Schema MySQL
-- Execute este arquivo no seu banco de dados MySQL
-- ============================================================

SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS lash_designer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lash_designer;

-- ============================================================
-- TABELAS
-- ============================================================

-- Clientes
CREATE TABLE IF NOT EXISTS clients (
  id                 VARCHAR(36)  PRIMARY KEY,
  name               VARCHAR(150) NOT NULL,
  email              VARCHAR(150) DEFAULT NULL,
  phone              VARCHAR(30)  NOT NULL,
  whatsapp           VARCHAR(30)  DEFAULT NULL,
  birthdate          DATE         DEFAULT NULL,
  notes              TEXT         DEFAULT NULL,
  source             VARCHAR(50)  NOT NULL DEFAULT 'manual',
  total_appointments INT          NOT NULL DEFAULT 0,
  last_service       DATE         DEFAULT NULL,
  next_maintenance   DATE         DEFAULT NULL,
  photo              VARCHAR(500) DEFAULT NULL,
  registered_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Serviços
CREATE TABLE IF NOT EXISTS services (
  id          VARCHAR(36)   PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  description TEXT          NOT NULL,
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration    INT           NOT NULL DEFAULT 60 COMMENT 'minutos',
  category    VARCHAR(100)  NOT NULL,
  image       VARCHAR(500)  DEFAULT NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  featured    TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id           VARCHAR(36)   PRIMARY KEY,
  client_id    VARCHAR(36)   DEFAULT NULL,
  client_name  VARCHAR(150)  NOT NULL,
  service_id   VARCHAR(36)   DEFAULT NULL,
  service_name VARCHAR(150)  NOT NULL,
  date         DATE          NOT NULL,
  time         VARCHAR(5)    NOT NULL,
  duration     INT           NOT NULL DEFAULT 60,
  status       VARCHAR(30)   NOT NULL DEFAULT 'pending',
  price        DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes        TEXT          DEFAULT NULL,
  source       VARCHAR(50)   NOT NULL DEFAULT 'manual',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_appt_date   (date),
  INDEX idx_appt_status (status),
  CONSTRAINT fk_appt_client  FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE SET NULL,
  CONSTRAINT fk_appt_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Horários bloqueados (folgas / indisponibilidades)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id         VARCHAR(36)  PRIMARY KEY,
  date       DATE         NOT NULL,
  start_time VARCHAR(5)   NOT NULL,
  end_time   VARCHAR(5)   NOT NULL,
  reason     VARCHAR(255) DEFAULT NULL,

  INDEX idx_bs_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Produtos / Estoque
CREATE TABLE IF NOT EXISTS products (
  id             VARCHAR(36)   PRIMARY KEY,
  name           VARCHAR(150)  NOT NULL,
  description    TEXT          DEFAULT NULL,
  category       VARCHAR(100)  NOT NULL,
  price          DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price     DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity       INT           NOT NULL DEFAULT 0,
  min_stock      INT           NOT NULL DEFAULT 3,
  unit           VARCHAR(30)   NOT NULL DEFAULT 'unidade',
  supplier       VARCHAR(150)  DEFAULT NULL,
  image          VARCHAR(500)  DEFAULT NULL,
  store_visible  TINYINT(1)    NOT NULL DEFAULT 0,
  store_featured TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vendas
CREATE TABLE IF NOT EXISTS sales (
  id             VARCHAR(36)   PRIMARY KEY,
  client_id      VARCHAR(36)   DEFAULT NULL,
  client_name    VARCHAR(150)  DEFAULT NULL,
  appointment_id VARCHAR(36)   DEFAULT NULL,
  subtotal       DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total          DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50)   NOT NULL,
  installments   INT           NOT NULL DEFAULT 1,
  status         VARCHAR(30)   NOT NULL DEFAULT 'completed',
  notes          TEXT          DEFAULT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_sale_client FOREIGN KEY (client_id)      REFERENCES clients(id)      ON DELETE SET NULL,
  CONSTRAINT fk_sale_appt   FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens de venda
CREATE TABLE IF NOT EXISTS sale_items (
  id       VARCHAR(36)   PRIMARY KEY,
  sale_id  VARCHAR(36)   NOT NULL,
  type     VARCHAR(30)   NOT NULL COMMENT 'service | product',
  item_id  VARCHAR(36)   DEFAULT NULL,
  name     VARCHAR(150)  NOT NULL,
  quantity INT           NOT NULL DEFAULT 1,
  price    DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,

  INDEX idx_si_sale (sale_id),
  CONSTRAINT fk_si_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transações financeiras (fluxo de caixa)
CREATE TABLE IF NOT EXISTS transactions (
  id             VARCHAR(36)   PRIMARY KEY,
  type           VARCHAR(10)   NOT NULL COMMENT 'income | expense',
  category       VARCHAR(100)  NOT NULL,
  description    VARCHAR(255)  NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50)   DEFAULT NULL,
  date           DATE          NOT NULL,
  sale_id        VARCHAR(36)   DEFAULT NULL,
  notes          TEXT          DEFAULT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_tx_date (date),
  CONSTRAINT fk_tx_sale FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Depoimentos
CREATE TABLE IF NOT EXISTS testimonials (
  id          VARCHAR(36)  PRIMARY KEY,
  client_name VARCHAR(150) NOT NULL,
  photo       VARCHAR(500) DEFAULT NULL,
  text        TEXT         NOT NULL,
  rating      TINYINT      NOT NULL DEFAULT 5,
  date        DATE         DEFAULT NULL,
  approved    TINYINT(1)   NOT NULL DEFAULT 0,
  source      VARCHAR(50)  NOT NULL DEFAULT 'manual',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Galeria de fotos
CREATE TABLE IF NOT EXISTS gallery (
  id          VARCHAR(36)  PRIMARY KEY,
  url         VARCHAR(500) NOT NULL,
  title       VARCHAR(255) DEFAULT NULL,
  category    VARCHAR(50)  NOT NULL DEFAULT 'general',
  sort_order  INT          NOT NULL DEFAULT 0,
  uploaded_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_gallery_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mensagens de contato
CREATE TABLE IF NOT EXISTS contact_messages (
  id         VARCHAR(36)  PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) DEFAULT NULL,
  phone      VARCHAR(30)  DEFAULT NULL,
  message    TEXT         NOT NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Solicitações de agendamento (via site público)
CREATE TABLE IF NOT EXISTS booking_requests (
  id               VARCHAR(36)  PRIMARY KEY,
  client_name      VARCHAR(150) NOT NULL,
  client_email     VARCHAR(150) DEFAULT NULL,
  client_phone     VARCHAR(30)  NOT NULL,
  client_whatsapp  VARCHAR(30)  DEFAULT NULL,
  client_birthdate DATE         DEFAULT NULL,
  service_id       VARCHAR(36)  DEFAULT NULL,
  service_name     VARCHAR(150) NOT NULL,
  preferred_date   DATE         NOT NULL,
  preferred_time   VARCHAR(5)   NOT NULL,
  notes            TEXT         DEFAULT NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending | confirmed | cancelled',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_br_status (status),
  INDEX idx_br_date   (preferred_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conteúdo do site (seções configuráveis via painel)
-- section é a chave primária; INSERT ... ON DUPLICATE KEY UPDATE faz upsert
CREATE TABLE IF NOT EXISTS site_content (
  section    VARCHAR(100) NOT NULL PRIMARY KEY,
  content    JSON         NOT NULL,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estatísticas do site (linha única id=1)
CREATE TABLE IF NOT EXISTS site_stats (
  id         INT    NOT NULL PRIMARY KEY DEFAULT 1,
  page_views BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pedidos da loja online
CREATE TABLE IF NOT EXISTS store_orders (
  id               VARCHAR(36)   PRIMARY KEY,
  customer_name    VARCHAR(150)  NOT NULL,
  customer_email   VARCHAR(150)  DEFAULT NULL,
  customer_phone   VARCHAR(30)   NOT NULL,
  customer_address TEXT          DEFAULT NULL,
  subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping         DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount         DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method   VARCHAR(50)   NOT NULL DEFAULT 'pix',
  status           VARCHAR(30)   NOT NULL DEFAULT 'pending' COMMENT 'pending | confirmed | shipped | delivered | cancelled',
  notes            TEXT          DEFAULT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_so_status (status),
  INDEX idx_so_date   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens dos pedidos da loja
CREATE TABLE IF NOT EXISTS store_order_items (
  id         VARCHAR(36)   PRIMARY KEY,
  order_id   VARCHAR(36)   NOT NULL,
  product_id VARCHAR(36)   DEFAULT NULL,
  name       VARCHAR(150)  NOT NULL,
  quantity   INT           NOT NULL DEFAULT 1,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,

  INDEX idx_soi_order (order_id),
  CONSTRAINT fk_soi_order FOREIGN KEY (order_id) REFERENCES store_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuários do painel administrativo
CREATE TABLE IF NOT EXISTS admin_users (
  id                  VARCHAR(36)  PRIMARY KEY,
  name                VARCHAR(150) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  role                VARCHAR(50)  NOT NULL DEFAULT 'admin',
  active              TINYINT(1)   NOT NULL DEFAULT 1,
  session_token       VARCHAR(36)  DEFAULT NULL,
  session_expires_at  DATETIME     DEFAULT NULL,
  last_login          DATETIME     DEFAULT NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs de auditoria de ações administrativas
CREATE TABLE IF NOT EXISTS audit_logs (
  id          VARCHAR(36)  PRIMARY KEY,
  user_id     VARCHAR(36)  DEFAULT NULL,
  user_email  VARCHAR(150) NOT NULL,
  action      VARCHAR(50)  NOT NULL COMMENT 'CREATE | READ | UPDATE | DELETE | LOGIN | LOGOUT',
  resource    VARCHAR(100) NOT NULL,
  resource_id VARCHAR(36)  DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_al_user     (user_id),
  INDEX idx_al_resource (resource),
  INDEX idx_al_date     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MIGRAÇÃO PARA BANCOS JÁ EXISTENTES (MySQL 8.0 não suporta IF NOT EXISTS em ALTER)
-- Execute APENAS se estiver atualizando um banco criado antes desta versão:
--   ALTER TABLE admin_users ADD COLUMN session_expires_at DATETIME DEFAULT NULL;
--   ALTER TABLE booking_requests ADD COLUMN client_whatsapp VARCHAR(30) DEFAULT NULL;
--   ALTER TABLE booking_requests ADD COLUMN client_birthdate DATE DEFAULT NULL;
-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Linha de estatísticas
INSERT IGNORE INTO site_stats (id, page_views) VALUES (1, 0);

-- Conteúdo padrão do site
INSERT IGNORE INTO site_content (section, content) VALUES
('hero', '{"title":"Realce sua Beleza com Cílios Perfeitos","subtitle":"Extensão de cílios premium com técnicas exclusivas para um olhar irresistível.","ctaText":"Agendar Agora","ctaLink":"/agendamento","backgroundImage":"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600","overlayOpacity":0.55}'),
('about', '{"title":"Sobre a Lash Designer","description":"Somos especialistas em extensão de cílios há mais de 5 anos, transformando olhares com técnica, qualidade e cuidado.","mission":"Realçar a beleza natural de cada cliente com técnicas premium e atendimento personalizado.","vision":"Ser referência em extensão de cílios no Brasil, com foco em qualidade e inovação.","values":["Qualidade","Profissionalismo","Cuidado","Inovação","Satisfação"],"yearsExperience":5,"clientsServed":1200,"photo":"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"}'),
('contact', '{"address":"Rua das Flores, 123 – Sala 42","city":"São Paulo","state":"SP","zipCode":"01310-100","phone":"(11) 3333-4444","whatsapp":"5511999991234","email":"contato@lashdesigner.com.br","mapEmbed":"","businessHours":[{"day":"Segunda","open":"09:00","close":"18:00","closed":false},{"day":"Terça","open":"09:00","close":"18:00","closed":false},{"day":"Quarta","open":"09:00","close":"18:00","closed":false},{"day":"Quinta","open":"09:00","close":"18:00","closed":false},{"day":"Sexta","open":"09:00","close":"18:00","closed":false},{"day":"Sábado","open":"09:00","close":"14:00","closed":false},{"day":"Domingo","open":"","close":"","closed":true}]}'),
('settings', '{"siteName":"Lash Designer","tagline":"Extensão de Cílios Premium","primaryColor":"#ec4899","secondaryColor":"#be185d","accentColor":"#eab308","darkMode":false,"socialLinks":{"instagram":"https://instagram.com/lashdesigner","facebook":"https://facebook.com/lashdesigner","tiktok":"https://tiktok.com/@lashdesigner"},"seo":{"home":{"title":"Lash Designer – Extensão de Cílios Premium","description":"Extensão de cílios com técnicas exclusivas.","keywords":"extensão de cílios, lash, volume russo, fio a fio"}}}');

-- Serviços iniciais
INSERT IGNORE INTO services (id, name, description, price, duration, category, active, featured) VALUES
(UUID(), 'Volume Russo',  'Técnica de volume com múltiplos fios para olhar dramático e intenso.',  280.00, 150, 'Volume',    1, 1),
(UUID(), 'Fio a Fio',    'Extensão clássica com um fio por cílio natural. Resultado natural e elegante.', 180.00, 120, 'Clássico',  1, 1),
(UUID(), 'Manutenção',   'Manutenção a partir de 14 dias. Reposição dos fios caídos.',            120.00,  90, 'Manutenção',1, 0),
(UUID(), 'Híbrido',      'Mix entre fio a fio e volume. Natural com volume na ponta externa.',    230.00, 135, 'Volume',    1, 1),
(UUID(), 'Lash Lifting', 'Curvatura permanente dos cílios naturais sem extensão. Dura 6-8 semanas.', 150.00, 60, 'Outros',   1, 1);

-- ============================================================
-- USUÁRIO ADMIN
-- NÃO há mais usuário padrão com senha hardcoded.
-- Execute o script abaixo para criar o primeiro administrador:
--
--   node backend/setup-admin.js
--
-- ============================================================
