# Recuperação da Conta de Administrador {/* #admin-account-recovery */}

Recupere o acesso de administrador ao **duplistatus** quando você perder sua senha ou for bloqueado da sua conta. Este guia aborda o uso do script de recuperação de administrador em ambientes Docker.

Se o navegador mostrar **Acesso negado** (HTTP 403) antes do formulário de login, a [lista de permissões de IP do administrador](settings/ip-allowlist-settings.md) está bloqueando a solicitação. Use [Bloqueado pela Lista de Permissões de IP](troubleshooting.md#locked-out-by-ip-allowlist) em vez deste script.

## Usando o Script no Docker {/* #using-the-script-in-docker */}

O Dockerfile inclui o diretório `scripts` e um wrapper shell conveniente.

```bash
# Execute inside the running container using the wrapper
docker exec -it duplistatus /app/admin-recovery <username> <new-password>
```

**Exemplo:**

```bash
docker exec -it duplistatus /app/admin-recovery admin NewPassword123
```

## Solução de problemas {/* #troubleshooting */}

Se encontrar problemas com o script de recuperação:

1. **Verifique se o Container Está Executando**: Verifique que o container está rodando com `docker ps`
2. **Verifique a Disponibilidade do Script**: Verifique se o script existe no container com `docker exec -it duplistatus ls -la /app/admin-recovery`
3. **Revise os Logs do Container**: Verifique por erros com `docker logs duplistatus`
4. **Verifique o Nome de Usuário**: Assegure-se de que o nome de usuário existe na base de dados
5. **Verifique o Formato da Senha**: Assegure-se de que a nova senha atende todos os requisitos

Se os problemas persistirem, consulte o guia de [Solução de Problemas](troubleshooting.md) para obter mais ajuda.
