export default function FamdomCard() {
  return (
    <div className="w-[300px]">
        {/* Imagem do Famdom */}
        <div className="flex justify-center items-center bg-red-500 rounded-t-[15px] w-[300px] h-[150px]">
            <img src="" alt="Famdom" />
        </div>
        {/* Nome, descrição e membros */}
        <div className="flex flex-col items-center pt-[20px] pl-[15px] pr-[15px] bg-[#8D6FF5] rounded-b-[15px]">
            <p className="text-[20px] font-bold text-white">Nome do Famdom</p>
            <p className="text-[15px] text-[#DBD1FC] mt-[10px] text-center">Descrição do Famdom Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum culpa quisquam veritatis temporibus sed fugit voluptatibus! Ut, odio exercitationem maiores, laudantium id, nisi tempore dicta culpa officiis a quo ipsam?</p>
            <div className="flex mt-[10px] gap-[20px] text-[#DBD1FC]">
                <div className="flex gap-[5px]">
                    <p>Membros</p>
                    <p>100</p>
                </div>
                <div className="flex gap-[5px]">
                    <p>Discussões</p>
                    <p>50</p>
                </div>
            </div>
            <div className="w-[100%] mt-[10px] mb-[30px]">
                <button className="bg-[#A28BF7] hover:bg-[#AE9AF8] rounded-[5px] p-[8px] w-[100%] transition-all duration-200"><p>Explorar</p></button>
            </div>
        </div>

    </div>
  )
}
