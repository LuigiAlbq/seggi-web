export const environment = {
  /**
   * Prefixo das chamadas à API do seggi-app.
   * Vazio: em dev o proxy do Angular CLI (proxy.conf.json) encaminha /api para localhost:8080;
   * em produção o front deve ser servido no mesmo domínio da API (reverse proxy).
   */
  apiBaseUrl: '',
  /**
   * Chave da PrimeUI License (gratuita na Community License: https://primeui.dev/licenses).
   * Vazia, o PrimeNG mostra o aviso "Invalid PrimeUI License" no canto da tela.
   * A chave vai embutida no bundle do navegador; avalie antes de commitá-la num repositório público.
   */
  primeuiLicense: '',
};
