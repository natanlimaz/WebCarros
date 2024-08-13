import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebaseConnection';
import toast from 'react-hot-toast';

export function DashboardHeader() {

    async function handleLogout() {
        await signOut(auth);
        toast.success("Logout efetuado com sucesso!");
    }

    return(
        <div className="p-6 w-full flex items-center h-10 bg-red-500 rounded-lg text-white font-medium gap-4 px-4 mb-4">
            <Link 
                to="/dashboard"
            >
                Meus Carros
            </Link>

            <Link to="/dashboard/new">
                Cadastrar Carro
            </Link>

            <button 
                className="ml-auto"
                onClick={handleLogout}
            >
                Sair da conta
            </button>
        </div>
    );
}