// Rückgabe der Server Actions, die mit useActionState arbeiten
// (Fehlermeldung direkt im Formular statt einer Fehlerseite).
export type FormState = {
  error?: string;
  ok?: boolean;
} | null;
