import { useEffect, useState, useContext } from 'react';
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/panelheader";
import { FiTrash2 } from 'react-icons/fi'
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage'; 
import { db, storage } from '../../services/firebaseConnection';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export type CarProps = {
    id: string;
    name: string
    year: string;
    uid: string;
    km: string;
    price: string | number;
    city: string;
    images: CarImageProps[];
}

type CarImageProps = {
    name: string;
    uid: string;
    url: string;
}

export function Dashboard() {

    const { user } = useContext(AuthContext);
    const [cars, setCars] = useState<CarProps[]>([]);
    const [loadImages, setLoadImages] = useState<string[]>([])

    useEffect(() => {
        function loadCars() {
            if(!user?.uid) {
                return;
            }

            const carsRef = collection(db, "cars");
            const queryRef = query(carsRef, where("uid", "==", user.uid));

            getDocs(queryRef)
            .then((snapshot) => {
                const listCars = [] as CarProps[];

                snapshot.forEach( doc => {
                    listCars.push({
                        id: doc.id,
                        name: doc.data().name,
                        year: doc.data().year,
                        km: doc.data().km,
                        city: doc.data().city,
                        price: doc.data().price,
                        images: doc.data().images,
                        uid: doc.data().uid
                    })
                })

                setCars(listCars); 
            })
        }

        loadCars();
    }, [user]);

    async function handleDeleteCar(car: CarProps) {
        const docRef = doc(db, "cars", car.id);
        await deleteDoc(docRef);

        car.images.map( async (image) => {
            const imagePath = `images/${image.uid}/${image.name}`;

            const imageRef = ref(storage, imagePath);

            try {
                await deleteObject(imageRef);
                toast.success("Carro deletado com sucesso!");
                const filteredCars = cars.filter( currentCar => currentCar.id !== car.id);
                setCars(filteredCars);
            }
            catch(error) {
                console.log("ERRO AO EXCLUIR ESSA IMAGEM");
            }
        })

        
    }

    function handleImageLoad(id: string) {
        setLoadImages((prevImageLoads => [...prevImageLoads, id]));
    }

    return (
        <Container>
            <DashboardHeader />

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cars.map((car) => (
                    <section className="w-full bg-white rounded-lg relative select-none" key={car.id}>
                        <button 
                            className="absolute bg-white w-14 h-14 rounded-full flex justify-center items-center top-2 right-2 drop-shadow"   
                            onClick={ () => {handleDeleteCar(car)} }
                            style={{display: loadImages.includes(car.id) ? undefined : "none"}}
                        >
                            <FiTrash2 size={26} color="#000"/>
                        </button>
                        
                        <div
                            className="w-full rounded-lg mb-2 h-72 max-h-72 bg-slate-200"
                            style={ {display: loadImages.includes(car.id) ? "none" : "block"} }
                        >
                        </div>

                        <img 
                            className="w-full rounded-lg mb-2 max-h-72" 
                            src={car.images[0].url} 
                            alt={car.images[0].name}
                            onLoad={ () => handleImageLoad(car.id)}
                            style={{display: loadImages.includes(car.id) ? "block" : "none"}}
                        />
                        
                        <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>

                        <div className="flex flex-col px-2">
                            <span className="text-zinc-700">
                                Ano {car.year} | {car.km} km
                            </span>
                            <strong className="text-black font-bold mt-4">
                                R$ {car.price}
                            </strong>
                        </div>

                        <div className="w-full h-px bg-slate-200 my-2"></div>

                        <div className="px-2 pb-2">
                            <span className="text-black">
                                {car.city}
                            </span>
                        </div>
                    </section>
                ))}
            </main>
        </Container>
    );
}