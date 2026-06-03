import Card from "./Card";
import DefaultPet from "../assets/default-pet.svg";
import PlusIcon from "../assets/circle-plus.svg";

export default function PetCard({ onClick }: { onClick?: () => void }) {
  return (
    <Card
      className="bg-trooper-tan w-107.5 h-82.5 border-trooper-black border-2 flex flex-col overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 rounded-t-2xl overflow-hidden bg-trooper-tan flex items-center justify-center">
        <img
          src={PlusIcon}
          alt="Default pet"
          className="w-20 h-20 opacity-60"
        />
      </div>
    </Card>
  );
}
