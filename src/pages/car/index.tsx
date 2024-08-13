import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../components/container';
import { db } from '../../services/firebaseConnection';
import { getDoc, doc } from 'firebase/firestore';
import { FaWhatsapp } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';

type CarProps = {
    id: string;
    name: string
    model: string;
    year: string;
    uid: string;
    km: string;
    description: string;
    created: string;
    price: string | number;
    owner: string;
    city: string;
    images: CarImageProps[];
    whatsapp: string;
}

type CarImageProps = {
    name: string;
    uid: string;
    url: string;
}

export function CarDetail() {

    const { id } = useParams();
    const [car, setCar] = useState<CarProps>();
    const [sliderPreview, setSliderPreview] = useState<number>(2);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadCar() {
            if(!id) return;

            const carRef = doc(db, "cars", id);
            getDoc(carRef)
            .then((snapshot) => {

                if(!snapshot.data()) {
                    navigate("/");
                }

                setCar({
                    id: snapshot.id,
                    name: snapshot.data()?.name,
                    model: snapshot.data()?.model,
                    year: snapshot.data()?.year,
                    uid: snapshot.data()?.uid,
                    km: snapshot.data()?.km,
                    description: snapshot.data()?.description,
                    created: snapshot.data()?.created,
                    price: snapshot.data()?.price,
                    owner: snapshot.data()?.owner,
                    city: snapshot.data()?.city,
                    whatsapp: snapshot.data()?.whatsapp,
                    images: snapshot.data()?.images
                });
            })
            .catch((error) => {
                console.log(error);
                console.log("ERRO AO BUSCAR O CARRO");
            })
        }

        loadCar();
    }, [id, navigate]);

    useEffect(() => {
        function handleResize() {
            if(window.innerWidth < 720) {
                setSliderPreview(1);
            }
            else {
                setSliderPreview(2);
            }
        }

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, []);

    return (
        <Container>
            {car && (
                <Swiper
                    slidesPerView={sliderPreview}
                    pagination={{ clickable: true }}
                    navigation
                >
                    {car?.images.map((image) => (
                        <SwiperSlide key={image.name}>
                            <img
                                className="w-full h-70 object-cover"
                                src={image.url}
                                alt={image.name}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            { car && (
                <main className="w-full bg-white rounded-lg p-6 my-4">
                    <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
                        <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
                        <h1 className="font-bold text-3xl text-black">R$ {car?.price}</h1>
                    </div>

                    <p className="">{car?.model}</p>

                    <div className="flex w-full gap-6 my-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p>Cidade:</p>
                                <strong>{car?.city}</strong>
                            </div>
                            <div>
                                <p>Ano:</p>
                                <strong>{car?.year}</strong>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <p>Km:</p>
                                <strong>{car?.km}</strong>
                            </div>
                        </div>
                    </div>

                    <strong>Descrição:</strong>
                    <p className="mb-4">{car?.description}</p>

                    <strong>Vendedor:</strong>
                    <p className="mb-4">{car?.owner}</p>

                    <strong>Telefone / WhatsApp</strong>
                    <p>{car?.whatsapp}</p>

                    <a
                        href={`https://api.whatsapp.com/send?phone=+55${car?.whatsapp}&text=Olá, encontrei o carro ${car?.name} na plataforma WebCarros e fiquei interessado!`}
                        target="_blank"
                        className="cursor-pointer bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl font-medium rounded-lg"
                    >
                        Conversar com o vendedor
                        <FaWhatsapp size={26} color="#FFF"/>
                    </a>
                </main>
            )}
        </Container>
    );
}