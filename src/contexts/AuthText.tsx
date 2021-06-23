import { createContext, ReactNode, useEffect, useState } from "react";

import { auth, firebase } from "../services/firebase";

// Informar qual é o formato do usuário
type User = {
  id: string;
  name: string;
  avatar: string;
};

// Colocar quais informações vou ter no meu contexto
type AuthContextType = {
  // No primeiro momento não existe user logado, então ele é undefined
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
};

// Tipagem do Componente
type AuthContextProviderProps = {
  children: ReactNode,
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    /* Verificar se um usuário já tinha se logado anteriormente,
    ele vai retornar esse usuário, caso ele de um F5 ou fecha o navegador
    para os dados dele não se perderem */
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const { displayName, photoURL, uid } = user;
  
        if (!displayName || !photoURL) {
          throw new Error('Missing information from Google Accont.');
        };
    
        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
      };
    });

    // Deligar o eventListing, para a aplicação não dar erro
    // Sempre que tiver um eventListing dentro do useEffect, tenho que desligar ele!
    return () => {
      unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    // Contexto de Autenticação com google
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      const { displayName, photoURL, uid } = result.user;

      if (!displayName || !photoURL) {
        throw new Error('Missing information from Google Accont.');
      };

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL,
      });
    };
  };

  return (
    /* Todas as páginas vão ter o usuário logado. contexto */
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {props.children}
    </AuthContext.Provider>
  );
};
