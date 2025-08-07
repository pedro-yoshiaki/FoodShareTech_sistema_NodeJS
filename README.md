#  FoodShareTech - Sistema de Gerenciamento de Doações de Alimentos

![Status do Projeto](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)

## 📄 Sobre o Projeto

O **FoodShareTech** é uma plataforma web completa desenvolvida como um projeto acadêmico para a disciplina de Banco de Dados II. [cite_start]A solução visa criar uma ponte tecnológica entre empresas doadoras de alimentos e ONGs, com o objetivo de otimizar a logística de doações, reduzir o desperdício e combater a insegurança alimentar[cite: 35, 65, 79].

O sistema permite que empresas cadastrem doações, que ficam disponíveis para que ONGs possam reivindicá-las através de um sistema de "lances". Um processo automatizado no banco de dados elege a ONG vencedora com base em uma pontuação de prioridade, garantindo um processo justo e transparente.

---

## ✨ Funcionalidades Principais

* **👤 Gestão de Usuários:** Cadastro e autenticação seguros para perfis de Doador e ONG.
* **🎁 Cadastro de Doações:** Formulário para doadores registrarem alimentos, quantidades e validades.
* **✋ Sistema de Reivindicações (Lances):** ONGs podem visualizar doações disponíveis e fazer lances para recebê-las.
* **🤖 Lógica de Negócio Automatizada:** Um sistema inteligente no banco de dados processa as doações expiradas, seleciona a ONG vencedora com base na maior prioridade e atualiza os status automaticamente.
* **✅ Confirmação de Coleta:** Fluxo de confirmação com código (`ID da Doação`) para garantir a segurança na entrega.
* **⭐ Sistema de Avaliação:** Doadores podem avaliar as ONGs após a coleta, influenciando sua prioridade futura.
* **📊 Dashboards de Relatório:** Páginas de relatório personalizadas para ONGs e Doadores, com filtros, resumos e gráficos interativos.
* **👥 Gerenciamento de Beneficiários:** ONGs podem cadastrar e gerenciar seus beneficiários, e a contagem é atualizada automaticamente.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura do projeto é baseada em uma API RESTful (Backend) e uma interface de usuário dinâmica (Frontend).

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

* **Node.js & Express.js:** Utilizados para construir o servidor e a API RESTful, gerenciando todas as rotas e a lógica de negócio.
* **MySQL:** Banco de dados relacional onde todos os dados do sistema são armazenados e gerenciados.

### **Frontend**
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

* **HTML, CSS & JavaScript (Vanilla):** A base da interface do usuário, responsável pela estrutura, estilo e interatividade.
* **Bootstrap 5:** Framework utilizado para criar layouts responsivos e componentes visuais modernos.
* **Chart.js:** Biblioteca para a criação dos gráficos nos dashboards de relatório.

---

## 🧠 Lógica Avançada no Banco de Dados

Uma característica central deste projeto é o uso de recursos avançados do MySQL para automatizar e garantir a integridade da lógica de negócio.

* **`FUNCTION calcular_prioridade`**: Calcula a pontuação de prioridade de uma ONG em tempo real no momento do lance.
* **`EVENT ev_atualizar_status_doacoes`**: Um "relógio" que roda a cada minuto para verificar o status das doações.
* **`STORED PROCEDURE sp_processar_doacoes_expiradas`**: O "cérebro" da automação. É chamada pelo evento para identificar doações expiradas, eleger a ONG vencedora e atualizar os status.
* **`TRIGGERS`**: Gatilhos automáticos para manter a consistência dos dados, como:
    * `tr_update_media_avaliacao`: Atualiza a nota média de uma ONG após uma nova avaliação.
    * `tr_after_insert_beneficiario` e `tr_after_delete_beneficiario`: Atualizam a contagem de beneficiários de uma ONG.
    * `tr_definir_prazo_coleta`: Define o prazo de 24h para a coleta assim que uma ONG vence a disputa.
* **`VIEW view_doacoes_disponiveis`**: Uma tabela virtual que simplifica a consulta de doações ativas no backend.

---

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e rodar o projeto em seu ambiente local.

### **Pré-requisitos**
* [Node.js](https://nodejs.org/en/) (versão 14 ou superior)
* Um servidor MySQL

### **1. Configuração do Banco de Dados**
1.  Crie um novo banco de dados no seu MySQL com o nome `db_foodsharetech`.
2.  Execute todos os scripts SQL para criar as tabelas, a `VIEW`, a `FUNCTION`, os `TRIGGERS`, a `STORED PROCEDURE` e o `EVENT`.
3.  **Opcional:** Para ter um ambiente de teste pronto, execute a procedure de povoamento:
    ```sql
    CALL sp_popular_banco_para_testes();
    ```

### **2. Configuração do Backend**
1.  Clone este repositório:
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```
2.  Navegue até a pasta do projeto:
    ```bash
    cd backend_BDII_FoodShareTech
    ```
3.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```
4.  Configure a conexão com o banco de dados no arquivo `db/conexao.js`, alterando o host, usuário e senha se necessário.
5.  Inicie o servidor:
    ```bash
    node server.js
    ```
6.  O servidor estará rodando em `http://localhost:3000`.

### **3. Acessando o Frontend**
* Após iniciar o servidor, abra seu navegador e acesse `http://localhost:3000/login.html` ou `http://localhost:3000/cadastro.html`.

---

## 🗺️ API Endpoints Principais

| Método | Endpoint                             | Descrição                                         |
| :----- | :----------------------------------- | :------------------------------------------------ |
| `POST` | `/api/cadastro`                      | Cadastra um novo Doador ou ONG.                   |
| `POST` | `/api/login`                         | Autentica um usuário e retorna seus dados.        |
| `POST` | `/api/doacoes`                       | Registra uma nova doação feita por um Doador.     |
| `GET`  | `/api/doacoes/disponiveis`           | Lista todas as doações disponíveis para lances.   |
| `GET`  | `/api/doacoes/:id`                   | Detalha uma doação específica.                    |
| `POST` | `/api/reivindicacoes`                | Permite que uma ONG faça um lance em uma doação.    |
| `POST` | `/api/reivindicacoes/:id/confirmar`  | Confirma a coleta de uma doação (com código).     |
| `POST` | `/api/avaliacoes`                    | Registra a avaliação de uma ONG por um Doador.    |
| `GET`  | `/api/relatorios`                    | Gera relatórios para ONGs ou Doadores.            |
| `GET`  | `/api/beneficiarios`                 | Lista os beneficiários de uma ONG.                |
| `POST` | `/api/beneficiarios`                 | Cadastra um novo beneficiário para uma ONG.       |

---

## 👥 Autores

* [cite_start]**Matheus Soares Nascimento** [cite: 4, 9]
* [cite_start]**Pedro Yoshiaki Freitas Nohara** [cite: 5, 9]
