import Header from "@/components/ui/Header";

export default function Home() {
  return (
    <main className="bg-[#875CF5]">
      <Header />
      
      <div className="">
        <div className="flex flex-col items-center justify-center h-[100vh]">
          <h1 className="text-[75px] text-white font-bold">Nome da Fandom</h1>
          <div className="flex w-[50%] items-center justify-center">  
            <p className="text-[25px] text-[#E3DBFC] mt-[10px]">Breve Descrição</p>
          </div>
          <div className="flex gap-[20px] mt-[30px]">
            <button className="bg-red-500 p-[10px] rounded-[10px] text-white">Explorar Conteúdo</button>
            <button className="bg-red-500 p-[10px] rounded-[10px] text-white">Entrar na Comunidade</button>
          </div>
        </div>
      </div>

      <div className="pl-[250px] pr-[250px]">

        <div>
          <h2 className="text-[40px] font-bold">Nome da Sessão</h2>
          <p className="text-[20px] mt-[10px]">Descrição da Sessão lorem</p>
          
          {/* Botões */}
          <div className="bg-blue-500 p-[5px] rounded-[10px] mt-[15px] overflow-hidden w-fit max-w-full">
            <div className="flex text-[15px] overflow-x-auto gap-[10px]">
              <button className="bg-red-500 pt-[10px] pb-[10px] pl-[20px] pr-[20px] rounded-[10px] whitespace-nowrap">Botão 1</button>
              <button className="pt-[10px] pb-[10px] pl-[20px] pr-[20px] rounded-[10px] hover:bg-red-500 transition-all duration-250 whitespace-nowrap">Botão 2</button>
              <button className="pt-[10px] pb-[10px] pl-[20px] pr-[20px] rounded-[10px] hover:bg-red-500 transition-all duration-250 whitespace-nowrap">Botão 3</button>





            </div>
          </div>
        </div>
        <div>
          <h2>Regiões</h2>
        </div>

        
      </div>


      
      {/* <div className="flex flex-col items-center mt-[20px]">
        <h1 className="text-[50px] text-white font-bold">Escolha sua Fandom</h1>
        <p className="text-[20px] text-[#E3DBFC] mt-[10px]">Explore comunidades dedicadas aos seus universos favoritos. Conecte-se com outros fãs, compartilhe teorias e celebre suas paixões.</p>
      </div>
      <div className="flex flex-col items-center pl-[150px] pr-[150px] mt-[20px]">
        <p>search bar</p>
        <div className="flex flex-wrap gap-[20px]">
          <FamdomCard />
        </div>
      </div> */}
    </main>
  );
}
