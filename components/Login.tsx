import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;
    if (!auth) {
      setError("Firebase não configurado. Preencha o arquivo services/firebaseConfig.ts");
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update Profile with Name
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Auth state change is handled in App.tsx via onAuthStateChanged
    } catch (err: any) {
      console.error(err);
      let msg = "Ocorreu um erro ao conectar.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = "Email ou senha incorretos.";
      if (err.code === 'auth/email-already-in-use') msg = "Este email já está cadastrado.";
      if (err.code === 'auth/weak-password') msg = "A senha deve ter pelo menos 6 caracteres.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              LifeSync
            </h1>
            <h2 className="text-2xl font-bold text-slate-800">
              {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-500 mt-2">
              {isSignUp ? 'Comece a organizar sua vida na nuvem.' : 'Entre para sincronizar seus dados.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nome</label>
                <div className="relative">
                  <UserIcon size={20} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-indigo-600 font-bold hover:underline"
              >
                {isSignUp ? 'Entrar' : 'Cadastre-se'}
              </button>
            </p>
          </div>
        </div>

        {/* Right Side - Visuals */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden p-12 text-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-6 mt-20">
              <h2 className="text-4xl font-bold leading-tight">
                Sincronize sua vida,<br />
                em qualquer lugar.
              </h2>
              <p className="text-indigo-100 text-lg leading-relaxed max-w-sm">
                Seus hábitos, tarefas e leituras salvos na nuvem com segurança. Acesse do computador ou celular.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
                  <span className="text-xl">☁️</span>
                </div>
                <div>
                  <p className="font-semibold">Sincronização Ativa</p>
                  <p className="text-xs text-indigo-100">Seus dados estão seguros</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-400 w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;