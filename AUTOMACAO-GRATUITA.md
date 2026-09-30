# Automação gratuita: OneDrive → GitHub → Vercel

O workflow **Atualizar métricas do OneDrive** solicita uma execução diária às 07:30 em Brasília (10:30 UTC). O GitHub pode atrasar execuções agendadas. Em repositório público com runner padrão, o GitHub Actions é gratuito. A atualização da Vercel ocorre depois do commit e da compilação, não exatamente às 07:30.

Enquanto os Secrets não estiverem configurados, o workflow somente informa que aguarda a conexão e não modifica os dados.

## 1. Registrar acesso à Microsoft

No Microsoft Entra, abra **App registrations → New registration**. Nome: **Métricas SES-PE**. Habilite contas pessoais Microsoft (ou contas organizacionais e pessoais). Não use somente um tenant empresarial, pois o OneDrive informado é pessoal.

Em **Authentication → Advanced settings**, habilite **Allow public client flows**. Em **API permissions**, adicione Microsoft Graph, **Delegated permissions → Files.Read**. A autorização pedirá também acesso offline. Copie **Application (client) ID**. Não é necessário criar client secret para o fluxo de dispositivo.

O registro exige acesso a um diretório Microsoft Entra. Se sua conta não permitir criar aplicativos, será necessário um administrador ou um diretório disponível; não torne a planilha pública para contornar isso.

## 2. Criar o token GitHub

Em Settings da conta GitHub → Developer settings → Personal access tokens → Fine-grained tokens, crie um token limitado a **sistemademetricas**. Permissões do repositório: **Contents**, **Secrets** e **Variables**, todas **Read and write**. Escolha uma validade e renove antes do vencimento. Não envie o token no chat nem coloque em arquivos do repositório.

## 3. Conectar uma vez

Com Python instalado, execute localmente:

```text
python -m pip install requests==2.32.5 PyNaCl==1.6.0
python scripts/connect_onedrive.py
```

O assistente solicita o ID público do aplicativo, recebe o token GitHub com entrada oculta e mostra um código temporário para entrar em **https://microsoft.com/devicelogin**. Autorize a conta Microsoft dona da planilha. Ele grava automaticamente três Secrets criptografados: ONEDRIVE_CLIENT_ID, ONEDRIVE_REFRESH_TOKEN e AUTOMATION_GITHUB_TOKEN, além do e-mail de autoria associado à conta GitHub.

Esses Secrets não são variáveis da Vercel. O token Microsoft é renovado a cada execução e a renovação é salva criptografada no GitHub. Se a autorização for revogada, execute o assistente novamente.

## 4. Primeiro teste

No repositório, abra **Actions → Atualizar métricas do OneDrive → Run workflow → main**. Verifique a conclusão e a publicação correspondente na Vercel. O script valida todas as abas, rejeita importação vazia e preserva a base quando ocorre erro.

O caminho padrão no OneDrive é **Documents/SES-PE/Metricas/base_metricas.xlsx**. Se o Graph mostrar a pasta como **Documentos**, ajuste a variável de repositório **ONEDRIVE_FILE_PATH** para o caminho real dentro do drive. O endereço fornecido é de navegação e exige login; não serve como download público.

Somente **data/snapshot.json.gz** é publicado. A planilha completa e credenciais não são commitadas. Se existir um snapshot.json antigo, ele é removido na migração porque teria precedência no build. A publicação da base no repositório público já foi autorizada.

Se o arquivo não mudou, não há novo commit. Em repositórios públicos, o GitHub pode desativar agendamentos após 60 dias sem atividade; reative o workflow se isso ocorrer. Erros de autenticação, token vencido e falhas de leitura aparecem no histórico de Actions.

Documentação: https://docs.github.com/en/billing/concepts/product-billing/github-actions e https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-device-code
