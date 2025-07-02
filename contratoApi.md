# 📘 Contrato de API — FoodShareTech

Este contrato define os endpoints, métodos, payloads e respostas da API desenvolvida para o sistema FoodShareTech.

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

{
  "success": true,
  "message": "Cadastro de Doador realizado com sucesso."
}

### 🔑 Login de Usuário

- **Endpoint:** `POST /api/login`
- **Descrição:** Autentica um usuário pelo e-mail e senha.

{
  "email": "@email@exemplo.com",
  "senha": "@senhaSegura123"
}

#### 📤 Requisição

