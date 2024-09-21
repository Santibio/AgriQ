import LoginForm from "./components/login-form";

export default function LoginPage() {
  return (
    <section className="h-[90dvh] flex flex-col justify-between px-4">
      <div className="flex flex-col w-full gap-6 mt-40">
        <div className="font-bold">
          <h2 className="text-5xl">Bienvenido a</h2>
          <span className="text-primary text-6xl font-extrabold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
            AgriQ
          </span>
        </div>
        <p className="text-lg text-default-500">
          Por favor ingrese sus datos para continuar
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
