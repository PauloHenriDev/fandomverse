export default function CharacterCard() {
  return (
    <div className="w-[300px]">
      <div className="flex w-[300px] h-[300px] bg-red-500 rounded-t-[10px] justify-center items-center">
        <p>Imagem do Personagem</p>
      </div>
      <div className="flex flex-col bg-orange-500 items-center text-center justify-center pt-[10px] pb-[10px] pl-[10px] pr-[10px]">
        <p className="text-[20px] font-bold">Nome do Personagem</p>
        <p className="text-[15px] mt-[10px]">Descrição do Personagem</p>
        <button className="bg-red-500 p-[10px] rounded-[10px] text-white mt-[30px] w-full">Ver mais</button>
      </div>
    </div>
  )
}