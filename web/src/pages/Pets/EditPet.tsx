import { useParams } from "react-router-dom";
import PetForm from "./PetForm";
import TrooperSitting from "../../assets/trooper-sitting.png";

const STUB_PETS: Record<string, { name: string; age: string; type: string; description: string; imageUrl: string }> = {
  "1": { name: "Trooper", age: "3", type: "dog", description: "A loyal and energetic golden retriever who loves fetch.", imageUrl: TrooperSitting },
  "2": { name: "Mittens", age: "5", type: "cat", description: "A calm indoor cat who loves sunbathing.", imageUrl: "" },
};

export default function EditPet() {
  const { id } = useParams<{ id: string }>();
  const pet = id ? STUB_PETS[id] : undefined;

  return <PetForm mode="edit" initialData={pet} />;
}
