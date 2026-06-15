import { useParams } from "react-router-dom";
import PetForm from "./PetForm";
import TrooperSitting from "../../assets/trooper-sitting.png";
import { useEffect, useState} from "react";
import { apiFetch } from "../../api/client";
import { Pet } from "../../types/api";


export default function EditPet() {
  const [pet,setPet] = useState<Pet | null>(null)
  const [loading,setLoading] = useState<boolean>()
  const [error, setError] = useState<Error | null>()
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
  
    const loadPet = async () => {
      try {
        const res = await apiFetch("/pets/" + id, {
          method: "GET",
        });
        const data: Pet = await res.json();
        // console.log(data);
        setPet(data ?? null);
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          setError(err as Error);
          console.log(err);
        }
      } finally {
        setLoading(false);
      }
    };
  
    setLoading(true);
    setError(null);
    loadPet();
  }, []);
  
  if(!pet){
    return <span> Bad </span>

  }
  else{

    return <PetForm mode="edit" initialData={pet!} />;
  }

}
