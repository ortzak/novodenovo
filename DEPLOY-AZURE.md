# Colocando o NovoDeNovo no ar (VM do Azure + Docker)

```
Navegador ──► VM Ubuntu no Azure (North Central US) ──► Docker
   https://novodenovo.northcentralus.cloudapp.azure.com   ├─ caddy (HTTPS automático, portas 80/443)
                                                          ├─ web  (Nginx: site Angular + /api)
                                                          ├─ api  (Java/Spring Boot :8080, interno)
                                                          └─ db   (MySQL 8 :3306, interno, dados num volume)
```

## O que já está configurado na VM `ortzak`

| Item | Situação |
|---|---|
| Região | North Central US (as regiões permitidas na conta de estudante são limitadas) |
| Sistema | Ubuntu 24.04 · Standard_B2as_v2 (2 vCPU, 8 GB) |
| Endereço | **https://novodenovo.northcentralus.cloudapp.azure.com** (IP fixo `52.162.205.125`) |
| HTTPS | certificado gratuito Let's Encrypt, emitido e renovado sozinho pelo Caddy |
| Desligamento automático | **todo dia às 23h** (horário de Brasília) |
| Portas abertas | 22 (SSH), 80 (redireciona para HTTPS) e 443 (HTTPS) |

> 💰 A VM custa cerca de **US$ 0,10 por hora ligada**. Depois de usar, clique em **Parar** no portal
> (isso "desaloca" a VM e para a cobrança). Desligar por dentro do Linux **não** para a cobrança.

## Instalar / atualizar o site

O script `deploy/vm/instalar.sh` faz tudo: instala o Docker, baixa o código do GitHub,
cria as senhas do banco (arquivo `.env`, só na VM) e sobe os 3 contêineres.

**Pelo Cloud Shell do portal** (ícone `>_` no topo), sem precisar de SSH:

```bash
az vm run-command invoke -g castro_group -n ortzak --command-id RunShellScript \
  --scripts "curl -fsSL https://raw.githubusercontent.com/ortzak/novodenovo/main/deploy/vm/instalar.sh | bash" \
  --query "value[0].message" -o tsv
```

A primeira vez demora uns 10 minutos (download das imagens e compilação). Depois, abra
**https://novodenovo.northcentralus.cloudapp.azure.com** no navegador.

**Atualizou o código?** Faça `git push` para o GitHub e rode o mesmo comando de novo: ele baixa a
versão nova e recria os contêineres. Os dados do banco são mantidos.

## Painel do revendedor

Endereço: **https://novodenovo.northcentralus.cloudapp.azure.com/painel** (também pelo link "Área do revendedor" no rodapé).

Usuário inicial: `admin@vitrine.com` / senha `admin123`. **Troque a senha em Configurações** logo no primeiro acesso,
porque o repositório é público.

As fotos enviadas pelo painel ficam no volume `fotos` do Docker (não se perdem ao atualizar o site).

## Comandos úteis (dentro da VM, via SSH ou "Executar comando")

```bash
cd /opt/novodenovo
docker compose ps              # estado dos contêineres
docker compose logs -f api     # logs do Java
docker compose restart api     # reinicia só o backend
docker compose exec db mysql -uroot -p vitrine_notebooks   # console do MySQL (senha no .env)
```

## Rodar no próprio computador com Docker

Com o Docker Desktop instalado, na pasta do projeto:

```bash
cp .env.example .env      # troque as senhas e apague a linha DOMINIO
docker compose up -d --build
```

Abra <https://localhost> (o navegador avisa que o certificado é local — pode continuar).

## Próximos passos possíveis

- **Domínio próprio** (ex.: `novodenovo.com.br`): aponte o domínio para o IP `52.162.205.125`
  e troque `DOMINIO` no arquivo `/opt/novodenovo/.env` da VM; o Caddy gera o certificado novo sozinho.
- **Banco gerenciado:** trocar o contêiner `db` pelo *Azure Database for MySQL* (750 h/mês grátis
  por 12 meses), mudando só a variável `DB_URL` da `api`.
