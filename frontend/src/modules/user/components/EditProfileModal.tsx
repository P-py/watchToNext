"use client";

import { FormEvent, useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { ApiHttpError } from "@/services/api-error";
import { userService } from "@/services/user.service";
import { UpdateProfileInput, UserProfile } from "@/types/user";
import { resolveApiError } from "@/utils/error-messages";
import { toFieldErrors } from "@/utils/error-fields";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdated: (updated: UserProfile) => void;
}

const DISPLAY_NAME_MIN = 1;
const DISPLAY_NAME_MAX = 255;

function validateDisplayName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < DISPLAY_NAME_MIN) return "Informe um nome de exibição.";
  if (trimmed.length > DISPLAY_NAME_MAX) {
    return `O nome de exibição não pode ter mais de ${DISPLAY_NAME_MAX} caracteres.`;
  }
  return null;
}

export function EditProfileModal({ open, onClose, profile, onUpdated }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName);
      setFieldError(null);
      setFormError(null);
      setLoading(false);
    }
  }, [open, profile.displayName]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const localError = validateDisplayName(displayName);
    if (localError) {
      setFieldError(localError);
      return;
    }

    setFieldError(null);
    setFormError(null);
    setLoading(true);
    try {
      const input: UpdateProfileInput = { displayName: displayName.trim() };
      const updated = await userService.updateProfile(input);
      onUpdated(updated);
      onClose();
    } catch (err) {
      if (err instanceof ApiHttpError) {
        const fields = toFieldErrors(err);
        if (fields.displayName) {
          setFieldError(fields.displayName);
        } else {
          setFormError(resolveApiError(err).message);
        }
      } else {
        setFormError("Não foi possível salvar agora. Tente novamente em instantes.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title="Editar perfil"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="edit-profile-form"
            loading={loading}
          >
            Salvar
          </Button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={submit} className="space-y-4">
        <Input
          id="displayName"
          label="Nome de exibição"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={DISPLAY_NAME_MAX}
          autoComplete="off"
          autoFocus
        />
        {fieldError && (
          <p role="alert" className="text-sm text-red-400">
            {fieldError}
          </p>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-n-800 bg-n-800/60 p-3 text-xs text-n-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-n-500" />
          <p>
            As alterações podem demorar um pouco para refletir em outras áreas (como a barra
            superior). Faça login novamente para atualizar de imediato.
          </p>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-red-400">
            {formError}
          </p>
        )}
      </form>
    </Modal>
  );
}
