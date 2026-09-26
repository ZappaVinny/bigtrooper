import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PetForm from "./PetForm";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { apiFetch } from "../../api/client";
import { Pet } from "../../types/api";

export default function EditPet() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const req = apiFetch(`/pets/${id}`);
    req
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Pet) => setPet(data))
      .catch((err) => {
        if ((err as DOMException).name !== "AbortError") setFailed(true);
      });
    return () => req.abort();
  }, [id]);

  if (pet) return <PetForm key={pet.id} mode="edit" initialData={pet} />;

  if (failed) {
    return (
      <PageShell title="Pet not found" width="sm" center>
        <Card className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-charcoal/70">
            We couldn't find that pet. It may have been deleted.
          </p>
          <Button to="/pets">Back to your pets</Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell width="md">
      <div className="flex animate-pulse flex-col gap-8">
        <div className="h-12 w-2/3 rounded-full bg-trooper-black/10" />
        <div className="h-96 rounded-2xl border border-line bg-cream-50" />
      </div>
    </PageShell>
  );
}
