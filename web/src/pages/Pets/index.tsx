import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import FormMessage from "../../components/FormMessage";
import PetCard from "../../components/PetCard";
import NewPetCard from "../../components/NewPetCard";
import TagModal from "../../components/TagModal";
import Modal from "../../components/Modal";
import ModalHeader from "../../components/ModalHeader";
import ModalBody from "../../components/ModalBody";
import ModalFooter from "../../components/ModalFooter";
import { PlusIcon } from "../../components/icons";
import { ListPet } from "../../types/api";
import { apiFetch } from "../../api/client";
import TrooperRunning from "../../assets/trooper-running.png";

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

function SkeletonCard() {
  return (
    <div className="flex h-full min-h-72 animate-pulse flex-col overflow-hidden rounded-2xl border border-line bg-cream-50">
      <div className="aspect-16/10 bg-trooper-tan/25" />
      <div className="flex flex-col gap-2 p-5">
        <div className="h-6 w-1/2 rounded-full bg-trooper-black/10" />
        <div className="h-4 w-1/3 rounded-full bg-trooper-black/5" />
      </div>
    </div>
  );
}

export default function PetIndex() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<ListPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionError, setActionError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<ListPet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tagPet, setTagPet] = useState<ListPet | null>(null);

  useEffect(() => {
    const req = apiFetch("/pets");
    req
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ListPet[] | null) => setPets(data ?? []))
      .catch((err) => {
        if ((err as DOMException).name !== "AbortError") setLoadError(true);
      })
      .finally(() => setLoading(false));
    return () => req.abort();
  }, [reloadKey]);

  function retry() {
    setLoading(true);
    setLoadError(false);
    setReloadKey((k) => k + 1);
  }

  async function handleActive(petId: number, active: boolean) {
    setActionError("");
    // Update right away, then roll back if the server disagrees.
    setPets((prev) => prev.map((p) => (p.id === petId ? { ...p, active } : p)));
    try {
      const res = await apiFetch(`/pets/${petId}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setPets((prev) =>
        prev.map((p) => (p.id === petId ? { ...p, active: !active } : p)),
      );
      setActionError("We couldn't update that tag. Please try again.");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setActionError("");
    setDeleting(true);
    try {
      const res = await apiFetch(`/pets/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPets((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setActionError(`We couldn't delete ${pendingDelete.name}. Please try again.`);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const activeCount = pets.filter((p) => p.active).length;
  const subtitle =
    loading || loadError || pets.length === 0
      ? "Manage your pets and their QR tags."
      : `${pets.length} ${pets.length === 1 ? "pet" : "pets"} · ${activeCount} ${activeCount === 1 ? "tag" : "tags"} active`;

  let content;
  if (loading) {
    content = (
      <div className={GRID}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  } else if (loadError) {
    content = (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <p className="text-charcoal/70">We couldn't load your pets.</p>
        <Button variant="outline" onClick={retry} className="text-trooper-black">
          Try again
        </Button>
      </Card>
    );
  } else if (pets.length === 0) {
    content = (
      <Card className="flex flex-col items-center gap-5 px-6 py-12 text-center">
        <img src={TrooperRunning} alt="" className="h-28 w-auto" />
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl text-trooper-black">No pets yet</h2>
          <p className="max-w-sm text-charcoal/70">
            Add your first pet to create their profile and get a QR tag ready
            to print.
          </p>
        </div>
        <Button to="/pets/new" size="lg" icon={<PlusIcon />} iconPosition="left">
          Add your first pet
        </Button>
      </Card>
    );
  } else {
    content = (
      <div className={GRID}>
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            name={pet.name}
            imageUrl={pet.image_url ?? undefined}
            type={pet.type}
            age={pet.age}
            description={pet.description}
            active={pet.active}
            onEdit={() => navigate(`/pets/${pet.id}/edit`)}
            onTag={() => setTagPet(pet)}
            onActiveChange={(active) => handleActive(pet.id, active)}
            onDelete={() => setPendingDelete(pet)}
          />
        ))}
        <NewPetCard />
      </div>
    );
  }

  return (
    <PageShell
      title="Your pets"
      subtitle={subtitle}
      width="xl"
      actions={
        pets.length > 0 && (
          <Button to="/pets/new" icon={<PlusIcon />} iconPosition="left">
            Add a pet
          </Button>
        )
      }
    >
      {actionError && <FormMessage>{actionError}</FormMessage>}
      {content}

      {tagPet && (
        <TagModal petId={tagPet.id} petName={tagPet.name} onClose={() => setTagPet(null)} />
      )}

      {pendingDelete && (
        <Modal onClose={() => setPendingDelete(null)} labelledBy="delete-pet-title">
          <ModalHeader id="delete-pet-title" onClose={() => setPendingDelete(null)}>
            Delete {pendingDelete.name}?
          </ModalHeader>
          <ModalBody>
            <p className="text-charcoal/80">
              This permanently removes {pendingDelete.name}'s profile, and their
              tag will stop working. This can't be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => setPendingDelete(null)}
              className="text-trooper-black"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete pet"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </PageShell>
  );
}
