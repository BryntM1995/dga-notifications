export type MockUser = {
  id: number;
  name: string;
  username: string;
  department?: string;
  role?: string;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const makeToken = () =>
  btoa(`${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/=+/g, '');

export async function mockLogin(username: string, _password: string) {
  await wait(700); // simula latencia
  if (username.toLowerCase() !== 'admin') {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  const token = makeToken();
  const userInfo: MockUser = {
    id: 1,
    name: 'Admin',
    username: 'admin',
    department: 'Tecnología',
    role: 'Administrador',
  };
  // 3 horas desde ahora
  const expireAt = Math.floor(Date.now() / 1000) + 3 * 60 * 60;

  return { token, userInfo, expireAt, authMethod: 'mock' };
}

export async function mockRefresh() {
  await wait(400);
  const access_token = makeToken();
  // 1 hora más
  const expires_in = 60 * 60;
  return { access_token, token_type: 'bearer', expires_in };
}

export async function mockAuthInfo() {
  await wait(200);
  return { method: 'Mock', driver: 'mock', ldap_enabled: false, environment: 'local' };
}
