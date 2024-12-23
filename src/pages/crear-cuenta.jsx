import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Input from "@/components/input";
import { Button } from "@/components/ui/button";
import ButtonGoogle from "@/components/ui/buttonGoogle";
import LogoStimate from '@/components/Icons/LogoStimate';
import Link from 'next/link';
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Correo } from '@/components/alerts-variants';
import { registerUser } from '@/utils/auth';

export default function SignIn() {
  const router = useRouter()
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    let formErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre) {
      formErrors.nombre = "El nombre es obligatorio";
    }

    if (!formData.apellido) {
      formErrors.apellido = "El apellido es obligatorio";
    }

    if (!formData.email) {
      formErrors.email = "El correo electrónico es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      formErrors.email = "El formato del correo no es válido";
    }

    if (!formData.password) {
      formErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      formErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!termsAccepted) {
      formErrors.termsAccepted = "Debes aceptar los términos y condiciones";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        name: `${formData.nombre.trim()} ${formData.apellido.trim()}`.trim(),
        email: formData.email,
        password: formData.password,
        provider: 'credentials'
      };

      const user = await registerUser(userData);

      if (!user) {
        throw new Error('Error al registrar usuario');
      }

      setIsDialogOpen(true);
      setTimeout(() => {
        router.push('/iniciar-sesion');
      }, 6000);
    } catch (error) {
      setIsLoading(false);
      setErrors({
        validator: error.message
      })
      console.error('Error en el registro:', error.message);
    }
  };


  const handleGoogleSignIn = () => {
    signIn('google', { redirect: false });
  };

  return (
    <div className="flex w-full min-h-screen md:relative justify-center items-center">
      <div className="w-full h-screen hidden md:block lg:p-4">
        <img className="opacity-40 md:opacity-20 lg:opacity-100 lg:rounded-xl lg:h-full object-cover w-full h-screen" src="imgLogin.jpg" alt="LoginImg" />
      </div>
      <div className="flex font-comfortaa lg:min-h-screen md:absolute lg:static lg:py-0 md:py-20 md:max-w-[35rem] lg:min-w-[50%] lg:rounded-none md:rounded-xl flex-col items-start justify-center w-full px-4 lg:px-12 gap-8">
        <div className='flex flex-col gap-4 items-start justify-center w-full pt-4 md:pt-0 md:gap-8 lg:gap-4 lg:pt-4'>
          <div className='flex flex-col items-center justify-center w-full'>
            <a href="https://www.stimate.co/">
              <LogoStimate width={44} height={44} />
            </a>
          </div>
          <h1 className="font-bold text-2xl text-accent font-poppins">Crear Cuenta</h1>
        </div>
        <form className="flex flex-col gap-1 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex flex-col gap-2 w-full">
              <span>Nombre</span>
              <Input
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`border ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <span>Apellido</span>
              <Input
                placeholder="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              id="terms"
              type="checkbox"
              name="termsAccepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">Acepto los términos y condiciones</label>
          </div>
          {errors.termsAccepted && <p className="text-red-500 text-xs">{errors.termsAccepted}</p>}
          {errors.validator && <p className="text-red-500 text-xs">{errors.validator}</p>}
          <div className="flex flex-col justify-center items-center py-8">
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
              </AlertDialogTrigger>
              <Correo />
            </AlertDialog>
            <Button type="submit" disabled={isLoading} variant="default" size="default">{isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}</Button>
            <div className="flex w-full p-4 justify-end items-center">
              <Link href={"/iniciar-sesion"} className="text-accent">¿Ya tienes una cuenta?</Link>
            </div>
          </div>
          <div className="flex w-full p-4 justify-center items-center gap-4">
            <div className="border border-gray-400 md:border-baseColor lg:border-gray-400 min-w-[50%]"></div>
            <div><p>o</p></div>
            <div className="border border-gray-400 md:border-baseColor lg:border-gray-400 min-w-[50%]"></div>
          </div>
        </form>
        <div className="flex w-full justify-center items-center p-4">
          <ButtonGoogle text="Google" onClick={handleGoogleSignIn} />
        </div>
      </div>
    </div>
  );
}
