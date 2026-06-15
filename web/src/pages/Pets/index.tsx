import { useNavigate } from "react-router-dom";
import PetCard from "../../components/PetCard";
import NewPetCard from "../../components/NewPetCard";
import { ListPet } from "../../types/api";
import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";

export default function PetIndex() {
  const [pets, setPets] = useState<ListPet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadPets = async () => {
      try {
        const res = await apiFetch("/pets", {
          method: "GET",
          signal: controller.signal,
        });
        const data: ListPet[] = await res.json();
        // console.log(data);
        setPets(data ?? []);
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          setError(err as Error);
          // console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    loadPets();

    return () => controller.abort();
  }, []);
  // console.log(pets);
  return (
    <div className="flex flex-col h-[calc(100vh-72px)] items-center">
      <h1 className="text-[40px] font-bold text-trooper-black text-center mt-12.5">
        Pet Managment
      </h1>
      <p className="text-[16px] text-trooper-black">
        Please Provide additional details
      </p>

      <div className="grid grid-cols-3 gap-6 mt-4">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            name={pet.name}
            onEdit={() => navigate(`/pets/${pet.id}/edit`)}
          />
        ))}
        <NewPetCard onClick={() => navigate("/pets/new")} />
      </div>
    </div>
  );
}
