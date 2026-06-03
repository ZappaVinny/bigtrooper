import { useNavigate } from "react-router-dom";
import PetCard from "../../components/PetCard";
import NewPetCard from "../../components/NewPetCard";

export default function PetIndex() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center">
      <h1 className="text-[40px] font-bold text-trooper-black text-center mt-12.5">
        Pet Managment
      </h1>
      <p className="text-[16px] text-trooper-black">
        Please Provide additional details
      </p>

      <div className="grid grid-cols-3 gap-6 mt-4">
        {[1, 2, 3, 4, 5].map((id) => (
          <PetCard key={id} onEdit={() => navigate(`/pets/${id}/edit`)} />
        ))}
        <NewPetCard onClick={() => navigate("/pets/new")} />
      </div>
    </div>
  );
}
