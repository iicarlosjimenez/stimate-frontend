import { useState } from 'react';
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import ButtonGoogle from "@/components/ui/buttonGoogle";
import LogoStimate from '@/components/Icons/LogoStimate';
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Correo } from '@/components/alerts-variants';

export default function SignIn() {

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let formErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!nombre) {
            formErrors.nombre = "El nombre es obligatorio";
        }

        if (!apellido) {
            formErrors.apellido = "El apellido es obligatorio";
        }

        if (!email) {
            formErrors.email = "El correo electrónico es obligatorio";
        } else if (!emailRegex.test(email)) {
            formErrors.email = "El formato del correo no es válido";
        }

        if (!password) {
            formErrors.password = "La contraseña es obligatoria";
        } else if (password.length < 6) {
            formErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }

        if (!termsAccepted) {
            formErrors.termsAccepted = "Debes aceptar los términos y condiciones";
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsDialogOpen(true);
        } else {
            console.log('Errores en el formulario');
        }
    };

    return (
        <div className="flex w-full min-h-screen md:relative justify-center items-center">
            <div className="w-full h-screen hidden md:block lg:p-4">
                <img className="opacity-40 md:opacity-20 lg:opacity-100 lg:rounded-xl lg:h-full object-cover w-full h-screen" src="imgLogin.jpg" alt="LoginImg" />
            </div>
            <div className="flex font-comfortaa lg:min-h-screen md:absolute lg:static lg:py-0 md:py-20 md:max-w-[35rem] lg:min-w-[50%] lg:rounded-none md:rounded-xl flex-col items-start justify-center w-full px-4 lg:px-12 gap-8"> 
                <div className='flex flex-col gap-4 items-start justify-center w-full pt-4 md:pt-0 md:gap-8 lg:gap-4 lg:pt-4'>
                    <div className='flex flex-col items-center justify-center w-full'>
                        <a href="https://stimate-landing-page.vercel.app/">
                            <LogoStimate width={44} height={44} />
                        </a>
                    </div>
                    <h1 className="font-bold text-2xl text-accent font-poppins">Crear Cuenta</h1>
                </div>
                <form className="flex flex-col gap-1 w-full" action='#' onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <span>Nombre</span>
                            <Input
                                placeholder="Nombre"
                                name="nombre"
                                value={nombre}
                                onChange={(handle) => setNombre(handle.target.value)}
                                className={`border ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <span>Apellido</span>
                            <Input
                                placeholder="Apellido"
                                name="apellido"
                                value={apellido}
                                onChange={(handle) => setApellido(handle.target.value)}
                                className={`border ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.apellido && <p className="text-red-500 text-xs">{errors.apellido}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span>Correo Electrónico</span>
                        <Input
                            placeholder="Correo Electrónico"
                            name="email"
                            value={email}
                            onChange={(handle) => setEmail(handle.target.value)}
                            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <span>Contraseña</span>
                        <div className="flex flex-col gap-1">
                            <Input
                                placeholder="Contraseña"
                                type="password"
                                name="password"
                                value={password}
                                onChange={(handle) => setPassword(handle.target.value)}
                                className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Input
                            id="accept"
                            type="checkbox"
                            name="termsAccepted"
                            checked={termsAccepted}
                            onChange={(handle) => setTermsAccepted(handle.target.checked)}
                        />
                        <label for="accept">Acepto los términos y condiciones</label>
                    </div>
                    {errors.termsAccepted && <p className="text-red-500 text-xs">{errors.termsAccepted}</p>}
                    <div className="flex flex-col justify-center items-center py-8">
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogTrigger asChild>
                        </AlertDialogTrigger>
                        <Correo />
                    </AlertDialog>
                        <Button type="submit" variant="default" size="default">Crear Cuenta</Button>
                        <div className="flex w-full p-4 justify-end items-center">
                            <Link href={"/iniciar-sesion"} className="text-accent">¿Ya tienes una cuenta?</Link>
                        </div>
                    </div>
                    <div className="flex w-full p-4 justify-center items-center gap-4">
                        <div className="border border-gray-400 md:border-baseColor lg:border-gray-400 min-w-[50%]"></div>
                        <div><p>o</p></div>
                        <div className="border border-gray-400 md:border-baseColor lg:border-gray-400 min-w-[50%]"></div>
                    </div>
                    <div className="flex w-full justify-center items-center p-4">
                        <ButtonGoogle text="Google" href="#" />
                    </div>
                </form>
            </div>
        </div>
    );
}