# Deploy do Hospital Blog na VPS — passo a passo

Guia **autocontido**: executa o deploy desta aplicação sem abrir, copiar ou alterar
nenhum outro projeto na VPS (ICM, control-school, n8n etc.). Tudo aqui usa nomes
próprios do hospital-blog.

## 0. Visão geral e nomes reservados

| Item | Valor |
|---|---|
| VPS | `<IP_DA_VPS>` (usuário `root`, chave SSH local `~/.ssh/id_ed25519`) |
| Domínio | `projeto-hospital.ideiasdev.tech` (SMTP/HTTPS via Traefik) |
| Diretório na VPS | `/opt/projects/node/hospital-blog` |
| Stack Swarm | `hospital_blog` |
| Serviços | `hospital_blog_api`, `hospital_blog_web` |
| Imagens | `hospital-api:latest`, `hospital-web:latest` |
| Banco / usuário Postgres | `hospital_blog` / `hospital_blog` |
| Secrets Swarm | `hospital_database_url`, `hospital_jwt_secret` |
| Deploy key no GitHub | alias `github.com-hospital` (somente leitura) |
| Rede | `network_public` (já existente, externa — **não recriar**) |
| Traefik | já rodando, certresolver `letsencryptresolver` — **não alterar** |
| Roteamento | `Host(projeto-hospital...)` → web (prioridade 10); `Host(...) && PathPrefix(/api)` → API (prioridade 100) |

Infraestrutura compartilhada **somente consumida**: Postgres (`postgres:5432`),
rede `network_public` e o Traefik existente. Nada deles é modificado.

---

## 1. DNS (antes de tudo)

No painel de DNS do domínio `ideiasdev.tech`, crie o registro:

- **Tipo:** A
- **Nome:** `projeto-hospital`
- **IPv4:** `<IP_DA_VPS>`
- **Proxy:** comece **DNS only** (nuvem cinza). O Traefik precisa do HTTP-01 livre
  para emitir o certificado. Depois que o HTTPS funcionar, pode trocar para proxied.

Confirme que propagou:

```bash
dig +short projeto-hospital.ideiasdev.tech
# deve devolver <IP_DA_VPS>
```

> Sem esse registro o stack sobe, mas o Traefik não consegue emitir o certificado
> Let's Encrypt e o domínio fica sem HTTPS.

---

## 2. Acesso à VPS

Do seu computador:

```bash
ssh root@<IP_DA_VPS>
```

Se a chave não funcionar, use `ssh -i ~/.ssh/id_ed25519 root@<IP_DA_VPS>`.

---

## 3. Deploy key e clone do repositório (uma vez)

**Na VPS**, crie uma chave exclusiva deste projeto (não reutilize a do ICM nem a
do control-school):

```bash
ssh-keygen -t ed25519 -C "hospital-blog-deploy" -f ~/.ssh/hospital_blog_deploy -N ''

cat >> ~/.ssh/config <<'EOF'
Host github.com-hospital
  HostName github.com
  User git
  IdentityFile ~/.ssh/hospital_blog_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config

cat ~/.ssh/hospital_blog_deploy.pub   # copie esta chave pública
```

No GitHub: **repo hospital-blog → Settings → Deploy keys → Add deploy key**.

- Title: `vps-hospital-blog`
- Key: a chave pública copiada
- **Marque "Allow read access"** (read-only; não precisa de write).

Teste na VPS:

```bash
ssh -T git@github.com-hospital
# Hi LucasCastro100/hospital-blog! You've successfully authenticated...
```

Clone somente este projeto:

```bash
mkdir -p /opt/projects/node
git clone git@github.com-hospital:LucasCastro100/hospital-blog.git \
  /opt/projects/node/hospital-blog
cd /opt/projects/node/hospital-blog
git checkout main
```

---

## 4. Banco de dados (crie se não existir)

O Postgres é o serviço compartilhado `postgres_postgres`. **Não recrie o serviço
nem altere outros bancos.** Só crie o banco e o usuário deste projeto.

Descubra o container e veja se já existem:

```bash
CID=$(docker ps -qf name=postgres_postgres | head -1)
docker exec -it "$CID" psql -U postgres
```

Dentro do `psql`:

```sql
SELECT datname FROM pg_database WHERE datname = 'hospital_blog';
SELECT rolname FROM pg_roles WHERE rolname = 'hospital_blog';
```

Se **não** retornarem linhas, crie (troque a senha por uma forte, só alfanumérica
para não precisar escapar na URL):

```sql
CREATE USER hospital_blog WITH PASSWORD 'senhaForteAqui123';
CREATE DATABASE hospital_blog OWNER hospital_blog;
GRANT ALL PRIVILEGES ON DATABASE hospital_blog TO hospital_blog;
\q
```

> Se já existirem, **não execute o CREATE** — apenas reutilize ajustando os
> secrets do passo 5.

---

## 5. Secrets do Swarm (uma vez)

A senha do banco e o JWT **nunca** vão para o repositório, para o compose ou para
o histórico de comandos. Eles entram como secrets e o entrypoint da API os
transforma em variáveis de ambiente.

**Na VPS**, gere uma senha/URL e um JWT_SECRET:

```bash
SENHA_DB="senhaForteAqui123"
URL_DB="postgresql://hospital_blog:${SENHA_DB}@postgres:5432/hospital_blog?schema=public"
JWT_SECRET="$(openssl rand -hex 32)"

printf '%s' "$URL_DB"   | docker secret create hospital_database_url -
printf '%s' "$JWT_SECRET" | docker secret create hospital_jwt_secret -

unset SENHA_DB URL_DB JWT_SECRET
```

Confira (só os nomes, nunca os valores):

```bash
docker secret ls --format '{{.Name}}' | grep hospital
```

> Se precisar trocar depois: `docker secret rm <nome>` e crie de novo; em seguida
> faça `docker service update --force hospital_blog_api`.

---

## 6. Secrets do GitHub Actions

O workflow de deploy conecta por SSH. Configure no repositório
(**Settings → Secrets and variables → Actions**):

| Nome | Valor |
|---|---|
| `VPS_HOST` | `<IP_DA_VPS>` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | chave **privada** local que acessa a VPS (`~/.ssh/id_ed25519`) |

Pelo `gh`, do seu computador:

```bash
gh secret set VPS_HOST -R LucasCastro100/hospital-blog --body '<IP_DA_VPS>'
gh secret set VPS_USER -R LucasCastro100/hospital-blog --body 'root'
gh secret set VPS_SSH_KEY -R LucasCastro100/hospital-blog < ~/.ssh/id_ed25519
```

> Essa chave é a de **acesso SSH à VPS**, não a deploy key do passo 3.

---

## 7. Primeiro deploy (manual, na VPS)

```bash
cd /opt/projects/node/hospital-blog

docker build -t hospital-api:latest -f backend/deploy/Dockerfile.api backend
docker build -t hospital-web:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://projeto-hospital.ideiasdev.tech/api \
  frontend

docker stack deploy -c backend/deploy/docker-compose.swarm.yml hospital_blog
```

O entrypoint da API aplica `prisma migrate deploy` automaticamente no boot (com a
`DATABASE_URL` vinda do secret), antes de iniciar o NestJS. Não é preciso executar
migração na mão — e não use `docker exec` para isso: variáveis exportadas pelo
entrypoint não aparecem em processos iniciados com `docker exec`.

> O seed (`pnpm prisma:seed`) cria usuários de **desenvolvimento** com senhas
> fracas. **Não rode em produção.** Crie o primeiro usuário ADMIN com senha forte.

---

## 8. Verificação

```bash
docker service ls | grep hospital_blog
docker service ps hospital_blog_api
docker service ps hospital_blog_web
docker service logs --tail 100 hospital_blog_api
```

Confira os labels dos dois routers (o `/api` precisa ir para a API, não para o Next):

```bash
for svc in hospital_blog_web hospital_blog_api; do
  docker service inspect "$svc" \
    --format '{{range .Spec.Labels}}{{println .}}{{end}}' \
    | grep 'traefik.http.routers'
done
```

Do seu computador:

```bash
curl -fsS https://projeto-hospital.ideiasdev.tech/
curl -fsS https://projeto-hospital.ideiasdev.tech/api/settings
```

Checklist:

- [ ] `hospital_blog_api` e `hospital_blog_web` com 1/1 réplica e sem reinícios
- [ ] Routers `hospital-blog` e `hospital-blog-api` presentes no Traefik
- [ ] HTTPS com certificado válido no domínio
- [ ] Home abre com o nome do hospital vindo de Configurações
- [ ] Login no painel funciona com um ADMIN criado com senha forte
- [ ] CORS: a API só responde a `projeto-hospital.ideiasdev.tech`

---

## 9. Deploys seguintes (por tag)

O workflow `.github/workflows/deploy.yml` dispara ao enviar uma tag `v*.*.*`:

```bash
# No seu computador, dentro do repo:
git tag v0.0.2
git push origin v0.0.2
```

Ele faz, na VPS: `fetch/reset` na tag → build das duas imagens → `stack deploy`
→ `service update --force` → prune de imagens antigas. As migrações rodam no boot
da API pelo entrypoint.

> **Enviar a tag publica em produção.** Antes: rode `pnpm exec tsc --noEmit`,
> `pnpm lint` e `pnpm build` no frontend, e `pnpm exec tsc --noEmit` e `pnpm build`
> no backend. Confira também se a migração é compatível com os dados atuais.

Também existe o workflow manual **Controle de versão (tags)**, que incrementa
`VERSION`, cria a tag e a Release no GitHub — e por isso **também dispara o deploy**.

---

## 10. Rollback

Volte para a tag anterior e reforce o deploy:

```bash
cd /opt/projects/node/hospital-blog
git fetch --all --tags
git reset --hard v0.0.1
docker build -t hospital-api:latest -f backend/deploy/Dockerfile.api backend
docker build -t hospital-web:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://projeto-hospital.ideiasdev.tech/api \
  frontend
docker service update --force --image hospital-api:latest hospital_blog_api
docker service update --force --image hospital-web:latest hospital_blog_web
```

> Rollback de **código** não desfaz migrações de banco. Se a migração anterior
> alterou dados, restaure o volume `postgres_data` com backup antes.

---

## 11. Problemas comuns

| Sintoma | Causa provável | Ação |
|---|---|---|
| `network_public not manually attachable` | uso de `docker compose up` em rede Swarm | use `docker stack deploy` (como neste guia) |
| Domínio sem HTTPS | DNS ainda não aponta para a VPS ou está proxied | conferir `dig +short` e deixar DNS only até o cert sair |
| `permission denied (publickey)` no git | deploy key não adicionada ou alias errado | `ssh -T git@github.com-hospital` e conferir `~/.ssh/config` |
| API não sobe | secret ausente ou URL do banco errada | `docker service logs hospital_blog_api`; conferir `docker secret ls` |
| `P1001 / can't reach database` | host do banco errado | use `postgres:5432` (alias na `network_public`), não `localhost` |
| CORS bloqueando o site | origem diferente da configurada | `CORS_ORIGINS` no compose deve ser `https://projeto-hospital.ideiasdev.tech` |
| `/api/settings` devolve HTML/404 | router do `/api` caiu no Next | confira os labels `hospital-blog-api` e a prioridade 100 no compose |
| Tag `:latest` não atualizou | Swarm não recria task com a mesma tag | use `docker service update --force` (o workflow já faz) |

---

## 12. O que **não** fazer

- Não editar/reimplantar os stacks `icm_*`, `control-school-*`, `n8n_*`,
  `traefik_*`, `postgres_*`, `redis_*`, `portainer_*`.
- Não recriar `network_public`, `postgres_data` ou `vol_certificates`.
- Não rodar `prisma db push` em produção — use `prisma migrate deploy`.
- Não versionar `.env`, senhas, tokens ou chaves privadas.
- Não usar `origin: true` no CORS da API.
