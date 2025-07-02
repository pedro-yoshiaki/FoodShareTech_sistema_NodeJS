# 📘 Contrato de API — FoodShareTech

Este contrato define os endpoints, métodos, payloads e respostas da API desenvolvida para o sistema FoodShareTech.

Observação: Todos os endpoints devem ser consumidos utilizando o Content-Type: application/json, exceto se indicado o uso de formulário HTML.
---

## 🔐 Autenticação e Cadastro

### ✅ Cadastro de Usuário (ONG ou Doador)

- **Endpoint:** `POST /api/cadastro`
- **Descrição:** Realiza o cadastro de um novo usuário no sistema, incluindo endereço e contatos.

#### 📤 Requisição (application/json)

```json
{
  "nome": "@nomeUsuario",
  "email": "@email@exemplo.com",
  "senha": "@senhaSegura123",
  "tipo": "@Doador | @ONG",
  "cnpjCpf": "@12345678900",
  "endereco": {
    "estado": "@SP",
    "cidade": "@São Paulo",
    "bairro": "@Centro",
    "logradouro": "@Rua das Flores",
    "numero": "@123"
  },
  "contatos": ["@11987654321", "@11999998888"]
}

#### 📤 Respostas

```json
{
  "success": true,
  "message": "Cadastro de Doador realizado com sucesso."
}

```json
{
  "success": false,
  "message": "Campos obrigatórios ausentes."
}

### 🔑 Login de Usuário

- **Endpoint:** `POST /api/login`
- **Descrição:** Autentica um usuário pelo e-mail e senha.

#### 📤 Requisição

```json
{
  "email": "@email@exemplo.com",
  "senha": "@senhaSegura123"
}

#### 📤 Respostas

```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "nome": "@nomeUsuario",
    "email": "@email@exemplo.com",
    "tipo": "@Doador | @ONG"
  }
}

```json
{
  "success": false,
  "message": "Email ou senha inválidos."
}

## 👤 Perfil do Usuário

### 🔍 Visualizar Perfil

- **Endpoint:** `GET /api/usuarios/:id`
- **Descrição:** GET /api/usuarios/:id

#### 📤 Respostas

```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "nome": "@nomeUsuario",
    "email": "@email@exemplo.com",
    "tipo": "@Doador | @ONG",
    "data_cadastro": "@2025-07-02",
    "endereco": {
      "estado": "@SP",
      "cidade": "@São Paulo",
      "bairro": "@Centro",
      "logradouro": "@Rua das Flores",
      "numero": "@123"
    },
    "contatos": ["@11987654321", "@11999998888"]
  }
}

### ✏️ Atualizar Perfil

- **Endpoint:** `PUT /api/usuarios/:id`
- **Descrição:** Atualiza informações do usuário.

#### 📤 Requisição

```json
{
  "nome": "@novoNomeUsuario",
  "email": "@novoEmail@exemplo.com",
  "senha": "@novaSenha",
  "tipo": "@Doador | @ONG",
  "endereco": {
    "estado": "@SP",
    "cidade": "@Santos",
    "bairro": "@Boqueirão",
    "logradouro": "@Av. da Praia",
    "numero": "@999"
  },
  "contatos": ["@11912345678", "@11922223333"]
}

#### 📤 Resposta

```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso."
}

### 🗑️ Deletar Conta

- **Endpoint:** `DELETE /api/usuarios/:id`
- **Descrição:** Remove o usuário e seus dados associados (endereço e contatos).

#### 📤 Resposta

```json
{
  "success": true,
  "message": "Usuário deletado com sucesso."
}
