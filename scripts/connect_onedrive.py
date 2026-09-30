"""Executar localmente uma vez. Tokens ficam apenas na memória e nos Secrets."""
import getpass, time, base64, requests
from nacl.public import PublicKey, SealedBox

REPO='luanaSaudePE/sistemademetricas'
def check(response):
    if not response.ok:
        raise RuntimeError('Falha HTTP '+str(response.status_code)+'. Confira as permissões e a configuração.')
    return response.json() if response.content else {}
def main():
    client=input('Application (client) ID da Microsoft: ').strip()
    github=getpass.getpass('Token GitHub (Contents e Secrets: leitura e escrita): ').strip()
    headers={'Authorization':'Bearer '+github,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}
    endpoint='https://api.github.com/repos/'+REPO
    public=check(requests.get(endpoint+'/actions/secrets/public-key',headers=headers,timeout=60))
    device=check(requests.post('https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode',data={'client_id':client,'scope':'https://graph.microsoft.com/Files.Read offline_access'},timeout=60))
    print('Abra https://microsoft.com/devicelogin e informe o código:',device['user_code'])
    deadline=time.monotonic()+device['expires_in'];interval=device.get('interval',5)
    while time.monotonic()<deadline:
        time.sleep(interval)
        response=requests.post('https://login.microsoftonline.com/consumers/oauth2/v2.0/token',data={'client_id':client,'grant_type':'urn:ietf:params:oauth:grant-type:device_code','device_code':device['device_code']},timeout=60)
        token=response.json()
        if response.ok: break
        if token.get('error')=='authorization_pending':continue
        if token.get('error')=='slow_down':interval+=5;continue
        raise RuntimeError('Microsoft recusou o acesso: '+token.get('error','erro'))
    else: raise RuntimeError('Código expirou. Execute novamente.')
    if not token.get('refresh_token'):raise RuntimeError('Microsoft não forneceu permissão offline.')
    for name,value in {'ONEDRIVE_CLIENT_ID':client,'ONEDRIVE_REFRESH_TOKEN':token['refresh_token'],'AUTOMATION_GITHUB_TOKEN':github}.items():
        encrypted=base64.b64encode(SealedBox(PublicKey(base64.b64decode(public['key']))).encrypt(value.encode())).decode()
        check(requests.put(endpoint+'/actions/secrets/'+name,headers=headers,json={'encrypted_value':encrypted,'key_id':public['key_id']},timeout=60))
    user=check(requests.get('https://api.github.com/user',headers=headers,timeout=60))
    email=str(user['id'])+'+'+user['login']+'@users.noreply.github.com'
    variables=endpoint+'/actions/variables'
    current=requests.get(variables+'/AUTOMATION_AUTHOR_EMAIL',headers=headers,timeout=60)
    method=requests.patch if current.ok else requests.post
    check(method(variables+'/AUTOMATION_AUTHOR_EMAIL' if current.ok else variables,headers=headers,json={'name':'AUTOMATION_AUTHOR_EMAIL','value':email},timeout=60))
    print('Conexão salva com segurança nos Secrets do GitHub. Execute o workflow manualmente para testar.')

if __name__=='__main__':
    try:main()
    except Exception as error:print(str(error));raise SystemExit(1)
