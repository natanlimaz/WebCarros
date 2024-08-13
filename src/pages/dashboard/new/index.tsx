import { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";
import { AuthContext } from "../../../contexts/AuthContext";

import { FiTrash, FiUpload } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidV4 } from 'uuid';

import { storage, db } from '../../../services/firebaseConnection';
import { ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';

import toast from "react-hot-toast";

const schema = z.object({
    name: z.string().min(1, "O campo nome é obrigatório"),
    model: z.string().min(1, "O modelo é obrigatório"),
    year: z.string().min(1, "O ano do carro é obrigatório"),
    km: z.string().min(1, "O km do carro é obrigatório"),
    price: z.string().min(1, "O preço é obrigatório"),
    city: z.string().min(1, "A cidade é obrigatória"),
    whatsapp: z.string().min(1, "O telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
        message: "Número de telefone inválido."
    }),
    description: z.string().min(1, "A descrição é obrigatória")
});

type FormData = z.infer<typeof schema>;

type ImageItemProps = {
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
}

export function New() {

    const { user } = useContext(AuthContext);
    const { register, handleSubmit, formState: {errors}, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });
    
    const [carImages, setCarImages] = useState<ImageItemProps[]>([])

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files && e.target.files[0]) {
            const image = e.target.files[0];
            
            if(image.type === "image/jpeg" || image.type === "image/png") {
                // Enviar para o banco a imagem
                await handleUpload(image);
            }
            else {
                alert("Envie uma imagem jpeg ou png")
                return;
            }
        }
    }

    async function handleUpload(image: File) {
        if(!user?.uid) {
            return;
        }

        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

        uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                const imageItem = {
                    uid: currentUid,
                    name: uidImage,
                    previewUrl: URL.createObjectURL(image),
                    url: downloadURL
                }

                setCarImages((images) => [...images, imageItem]);
                toast.success("Imagem enviada com sucesso!");
            })
        })
    }

    async function onSubmit(data: FormData) {
        if(carImages.length === 0) {
            toast.error("Envie pelo menos 1 imagem");
            return;
        }

        const carListImages = carImages.map((car) => {
            return {
                uid: car.uid,
                name: car.name,
                url: car.url
            }
        })

        addDoc(collection(db, "cars"), {
            name: data.name.toUpperCase(),
            model: data.model,
            year: data.year,
            km: data.km, 
            price: data.price, 
            city: data.city, 
            whatsapp: data.whatsapp,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            images: carListImages
        })
        .then(() => {
            reset();
            setCarImages([]);
            toast.success("Carro cadastrado com sucesso!");
        })
        .catch((error) => {
            console.log(error);
            toast.error("Erro ao cadastrar carro!");
        });

    }

    async function handleDelete(image: ImageItemProps) {
        const imagePath = `images/${image.uid}/${image.name}`;
        const imageRef = ref(storage, imagePath);

        try {
            await deleteObject(imageRef);
            setCarImages(carImages.filter((car) => car.url !== image.url))
        }
        catch(err) {
            console.log("ERRO AO DELETAR IMAGEM");
        }
    }

    return (
        <Container>
            <DashboardHeader />

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
                <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
                    <div className="absolute cursor-pointer">
                        <FiUpload size={24} color="#000"/>
                    </div>
                    <div className="cursor-pointer">
                        <input
                            type="file" 
                            accept="image/*" 
                            className="opacity-0 cursor-pointer"
                            onChange={handleFile}
                        />
                    </div>
                </button>

                {carImages.map( (image) => {
                    return (
                        <div key={image.name} className="w-full h-32 flex items-center justify-center relative">
                            <button className="absolute" onClick={() => handleDelete(image)}>
                                <FiTrash size={28} color="#FFF"/>
                            </button>
                            <img
                                className="rounded-lg w-full h-32 object-cover"
                                src={image.previewUrl}
                                alt="Foto do carro"
                            />
                        </div>
                    );
                })}
            </div>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                <form 
                    className="w-full"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do carro:</p>
                        <Input 
                            type="text"
                            placeholder="Ex: Onix 1.0..."
                            name="name"
                            error= {errors.name?.message}
                            register={register}
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do carro:</p>
                        <Input 
                            type="text"
                            placeholder="Ex: 1.0 Flex PLUS MANUAL"
                            name="model"
                            error= {errors.model?.message}
                            register={register}
                        />
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Ano:</p>
                            <Input 
                                type="text"
                                placeholder="Ex: 2018/2018"
                                name="year"
                                error= {errors.year?.message}
                                register={register}
                            />
                        </div>

                        <div className="w-full">
                            <p className="mb-2 font-medium">Km rodados:</p>
                            <Input 
                                type="text"
                                placeholder="Ex: 23.900..."
                                name="km"
                                error= {errors.km?.message}
                                register={register}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Preço:</p>
                        <Input 
                            type="text"
                            placeholder="Ex: 69.000..."
                            name="price"
                            error= {errors.price?.message}
                            register={register}
                        />
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">
                        <div className="w-full">
                            <p className="mb-2 font-medium">Cidade:</p>
                            <Input 
                                type="text"
                                placeholder="Ex: Fortaleza - CE"
                                name="city"
                                error= {errors.city?.message}
                                register={register}
                            />
                        </div>
                        
                        <div className="w-full">
                            <p className="mb-2 font-medium">Telefone / WhatsApp:</p>
                            <Input 
                                type="text"
                                placeholder="Ex: 85912345678"
                                name="whatsapp"
                                error= {errors.whatsapp?.message}
                                register={register}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Descrição:</p>
                        <textarea
                            className="border-2 w-full rounded-md h-24 px-2"
                            {...register("description")}
                            name="description"
                            id="description"
                            placeholder="Digite a descrição completa sobre o carro..."
                        />
                        {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
                    </div>

                    <button
                        className=" w-full rounded-md bg-zinc-900 text-white font-medium h-10"
                        type="submit"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </Container>
    );
}