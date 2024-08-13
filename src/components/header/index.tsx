import { useContext } from 'react';
import logoImg from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import { FiUser, FiLogIn} from 'react-icons/fi';
import { AuthContext } from '../../contexts/AuthContext';

export function Header() {

    const { user, signed, loadingAuth } = useContext(AuthContext);

    return (
        <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
            <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
                <Link to="/">
                    <img 
                        src={logoImg} 
                        alt="Logo do site" 
                    />
                </Link>

                {!loadingAuth && signed && (
                    <Link to="/dashboard" className="flex items-center gap-1 justify-center border-2 p-1 rounded-lg border-gray-900">
                        <div className="border-2 rounded-full border-gray-900">
                            <FiUser size={22} color="#000"/>
                        </div>
                        {user?.name && (<p className="font-medium">{user.name.split(' ')[0]}</p>)}
                    </Link>
                )}
                {!loadingAuth && !signed && (
                    <Link to="/login" className="border-2 p-1 rounded-lg border-gray-900 flex flex-row justify-center items-center gap-1">
                        <div className="border-2 rounded-full p-1 border-gray-900">
                            <FiLogIn size={22} color="#000"/>
                        </div>
                        <p className="font-medium">Entrar</p>
                    </Link>
                )}
                
            </header>
        </div>
    );
}