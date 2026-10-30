#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-https://github.com/ortzak/novodenovo.git}"
DOMINIO="${DOMINIO:-novodenovo.northcentralus.cloudapp.azure.com}"
BRANCH="${BRANCH:-main}"
DIR=/opt/novodenovo
export DEBIAN_FRONTEND=noninteractive

echo "=== 1/4 Docker ==="
if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  apt-get update -q
  apt-get install -y -q docker.io docker-compose-v2 git
fi
systemctl enable --now docker
docker --version; docker compose version

echo "=== 2/4 Código do GitHub ==="
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$DIR" reset --hard "origin/$BRANCH"
else
  git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$DIR"
fi
git -C "$DIR" log -1 --format='versão: %h — %s'

echo "=== 3/4 Senhas (.env, criado só na primeira vez) ==="
cd "$DIR"
if [ ! -f .env ]; then
  gerar() { openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 24; }
  printf 'DB_ROOT_PASSWORD=%s\nDB_PASSWORD=%s\n' "$(gerar)" "$(gerar)" > .env
  chmod 600 .env
  echo ".env criado em $DIR/.env"
else
  echo ".env já existe — mantido"
fi
grep -q '^DOMINIO=' .env || echo "DOMINIO=$DOMINIO" >> .env
grep -q '^JWT_SEGREDO=' .env || echo "JWT_SEGREDO=$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48)" >> .env
echo "Domínio: $(grep '^DOMINIO=' .env | cut -d= -f2)"

echo "=== 4/4 Subindo os contêineres (o 1º build demora alguns minutos) ==="
docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null

echo "Aguardando o banco..."
for i in $(seq 1 60); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q db)")" = healthy ] && break
  sleep 5
done
sql() { docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --default-character-set=utf8mb4 -N vitrine_notebooks' 2>/dev/null; }
if [ "$(echo "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='vitrine_notebooks' AND TABLE_NAME='loja' AND COLUMN_NAME='area_atendimento';" | sql)" = "0" ]; then
  echo "Aplicando atualização 002 (sem loja física + serviços)..."
  sql < banco/atualizacoes/002-sem-loja-fisica-e-servicos.sql && echo "ok"
fi

echo "Aguardando a API..."
D="$(grep '^DOMINIO=' .env | cut -d= -f2)"
for i in $(seq 1 60); do
  if curl -sf "https://$D/api/vitrine/loja" >/dev/null; then break; fi
  sleep 5
done
docker compose ps
echo -n "Site (https://$D): "; curl -s -o /dev/null -w "%{http_code}\n" "https://$D/"
echo -n "API:  "; curl -s -o /dev/null -w "%{http_code}\n" "https://$D/api/vitrine/notebooks"
echo -n "http -> https: "; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://127.0.0.1/
echo "Serviços cadastrados: $(curl -s "https://$D/api/vitrine/servicos" | grep -o '"nome"' | wc -l)"
echo -n "Prévia do WhatsApp: "; curl -s -A WhatsApp/2.23 "https://$D/notebook/NB-0005" | grep -o '<meta property="og:title" content="[^"]*"' || echo "(sem og:title)"
echo "Notebooks na vitrine:$(curl -s "https://$D/api/vitrine/notebooks" | grep -o '"codigo"' | wc -l)"
echo "PRONTO"
