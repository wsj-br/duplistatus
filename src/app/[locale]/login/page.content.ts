import { t, type Dictionary } from 'intlayer';

export default {
  key: 'login-page',
  content: {
    title: t({ 
      en: 'Login', 
      de: 'Anmelden', 
      fr: 'Connexion', 
      es: 'Iniciar sesión', 
      'pt-BR': 'Login' 
    }),
    subtitle: t({ 
      en: 'Sign in to your account', 
      de: 'Melden Sie sich bei Ihrem Konto an', 
      fr: 'Connectez-vous à votre compte', 
      es: 'Inicie sesión en su cuenta', 
      'pt-BR': 'Entre na sua conta' 
    }),
    username: t({ 
      en: 'Username', 
      de: 'Benutzername', 
      fr: 'Nom d\'utilisateur', 
      es: 'Nombre de usuario', 
      'pt-BR': 'Nome de usuário' 
    }),
    usernamePlaceholder: t({ 
      en: 'Enter your username', 
      de: 'Geben Sie Ihren Benutzernamen ein', 
      fr: 'Entrez votre nom d\'utilisateur', 
      es: 'Ingrese su nombre de usuario', 
      'pt-BR': 'Digite seu nome de usuário' 
    }),
    password: t({ 
      en: 'Password', 
      de: 'Passwort', 
      fr: 'Mot de passe', 
      es: 'Contraseña', 
      'pt-BR': 'Senha' 
    }),
    passwordPlaceholder: t({ 
      en: 'Enter your password', 
      de: 'Geben Sie Ihr Passwort ein', 
      fr: 'Entrez votre mot de passe', 
      es: 'Ingrese su contraseña', 
      'pt-BR': 'Digite sua senha' 
    }),
    rememberMe: t({ 
      en: 'Remember me', 
      de: 'Angemeldet bleiben', 
      fr: 'Se souvenir de moi', 
      es: 'Recordarme', 
      'pt-BR': 'Lembrar de mim' 
    }),
    forgotPassword: t({ 
      en: 'Forgot password?', 
      de: 'Passwort vergessen?', 
      fr: 'Mot de passe oublié?', 
      es: '¿Olvidó su contraseña?', 
      'pt-BR': 'Esqueceu a senha?' 
    }),
    loginButton: t({ 
      en: 'Login', 
      de: 'Anmelden', 
      fr: 'Connexion', 
      es: 'Iniciar sesión', 
      'pt-BR': 'Login' 
    }),
    loginInProgress: t({ 
      en: 'Logging in...', 
      de: 'Anmeldung läuft...', 
      fr: 'Connexion en cours...', 
      es: 'Iniciando sesión...', 
      'pt-BR': 'Fazendo login...' 
    }),
    loginSuccess: t({ 
      en: 'Login successful', 
      de: 'Anmeldung erfolgreich', 
      fr: 'Connexion réussie', 
      es: 'Inicio de sesión exitoso', 
      'pt-BR': 'Login bem-sucedido' 
    }),
    loginFailed: t({ 
      en: 'Login failed', 
      de: 'Anmeldung fehlgeschlagen', 
      fr: 'Connexion échouée', 
      es: 'Inicio de sesión fallido', 
      'pt-BR': 'Login falhou' 
    }),
    invalidCredentials: t({ 
      en: 'Invalid username or password', 
      de: 'Ungültiger Benutzername oder Passwort', 
      fr: 'Nom d\'utilisateur ou mot de passe invalide', 
      es: 'Nombre de usuario o contraseña inválidos', 
      'pt-BR': 'Nome de usuário ou senha inválidos' 
    }),
    accountLocked: t({ 
      en: 'Account locked. Please try again later.', 
      de: 'Konto gesperrt. Bitte versuchen Sie es später erneut.', 
      fr: 'Compte verrouillé. Veuillez réessayer plus tard.', 
      es: 'Cuenta bloqueada. Por favor inténtelo más tarde.', 
      'pt-BR': 'Conta bloqueada. Por favor, tente novamente mais tarde.' 
    }),
    sessionExpired: t({ 
      en: 'Session expired. Please login again.', 
      de: 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.', 
      fr: 'Session expirée. Veuillez vous reconnecter.', 
      es: 'Sesión expirada. Por favor inicie sesión nuevamente.', 
      'pt-BR': 'Sessão expirada. Por favor, faça login novamente.' 
    }),
    networkError: t({ 
      en: 'Network error. Please check your connection.', 
      de: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.', 
      fr: 'Erreur réseau. Veuillez vérifier votre connexion.', 
      es: 'Error de red. Por favor verifique su conexión.', 
      'pt-BR': 'Erro de rede. Por favor, verifique sua conexão.' 
    }),
    logIn: t({ 
      en: 'Log in', 
      de: 'Anmelden', 
      fr: 'Se connecter', 
      es: 'Iniciar sesión', 
      'pt-BR': 'Entrar' 
    }),
    enterYourCredentials: t({ 
      en: 'Enter your credentials to access your account', 
      de: 'Geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen', 
      fr: 'Entrez vos identifiants pour accéder à votre compte', 
      es: 'Ingrese sus credenciales para acceder a su cuenta', 
      'pt-BR': 'Digite suas credenciais para acessar sua conta' 
    }),
    note: t({ 
      en: 'Note:', 
      de: 'Hinweis:', 
      fr: 'Note:', 
      es: 'Nota:', 
      'pt-BR': 'Nota:' 
    }),
    defaultLoginCredentialsAre: t({ 
      en: 'Default login credentials are', 
      de: 'Standard-Anmeldedaten sind', 
      fr: 'Les identifiants de connexion par défaut sont', 
      es: 'Las credenciales de inicio de sesión predeterminadas son', 
      'pt-BR': 'As credenciais de login padrão são' 
    }),
    loading: t({ 
      en: 'Loading...', 
      de: 'Laden...', 
      fr: 'Chargement...', 
      es: 'Cargando...', 
      'pt-BR': 'Carregando...' 
    }),
    unexpectedError: t({ 
      en: 'An unexpected error occurred', 
      de: 'Ein unerwarteter Fehler ist aufgetreten', 
      fr: 'Une erreur inattendue s\'est produite', 
      es: 'Ocurrió un error inesperado', 
      'pt-BR': 'Ocorreu um erro inesperado' 
    }),
  },
} satisfies Dictionary;
