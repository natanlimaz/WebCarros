import { ReactNode, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

type PrivateProps = {
    children: ReactNode;
}

export function Private( {children}: PrivateProps): any {
    const { signed, loadingAuth } = useContext(AuthContext);

    if(loadingAuth) {
        return <div></div> // pode carregar uma telinha de loading
    }
    if(!signed) {
        return <Navigate to="/login" />; // se n estiver logado vai para tela de login
    }

    return children;
}