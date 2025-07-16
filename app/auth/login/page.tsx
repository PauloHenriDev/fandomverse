import LoginForm from "../../../components/ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-[#875CF5] flex justify-center items-center h-screen">
      <div className="bg-red-500 w-[500px] h-[500px] rounded-[20px] border-[3px] border-black">
        <h1 className="font-bold pt-[30px] text-[40px] text-center">Entrar</h1>
        <LoginForm />
      </div>
    </div>
  );
}
