# FailLens em português

O FailLens encontra a primeira falha relevante em logs barulhentos de integração contínua. O processamento é local: não exige cadastro, chave de API nem envia logs para a internet.

## Executar o projeto

Use Node.js 20 ou superior:

```powershell
npm test
node .\bin\faillens.js .\examples\github-actions-failure.log
node .\bin\faillens.js .\examples\typescript-failure.log --format json
```

Para analisar a saída de outro comando no PowerShell:

```powershell
npm test 2>&1 | node .\bin\faillens.js -
```

## Como interpretar

- **Categoria:** tipo provável da falha, como teste, compilador ou dependência.
- **Confiança:** força do padrão encontrado; não representa certeza absoluta.
- **Fingerprint:** identificador estável para agrupar falhas semelhantes.
- **Contexto:** linhas próximas que ajudam a investigar.

O FailLens aponta onde começar. A correção ainda deve ser confirmada executando o teste ou comando que falhou.
