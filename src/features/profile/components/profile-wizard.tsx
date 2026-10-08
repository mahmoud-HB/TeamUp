"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/features/storage/components/image-upload";
import {
  createAthleteProfileSchema,
  SPORT_LEVELS,
  AVAILABILITY_STATUSES,
  VISIBILITY_OPTIONS,
  type AthleteProfileInput,
} from "@/lib/validations/athlete-profile";
import { isMinor } from "@/lib/validations/auth";
import { saveAthleteProfileAction } from "@/features/profile/actions";
import type { SportOption } from "@/features/profile/queries";

const STEPS = ["identity", "sports", "availability", "visibility"] as const;
type Step = (typeof STEPS)[number];

const STEP_FIELDS: Record<Step, (keyof AthleteProfileInput)[]> = {
  identity: ["username", "avatarUrl", "bio", "country", "birthDate"],
  sports: ["sports"],
  availability: ["status", "mobility"],
  visibility: ["visibility"],
};

export function ProfileWizard({
  sports,
  defaultValues,
}: {
  sports: SportOption[];
  defaultValues?: Partial<AthleteProfileInput>;
}) {
  const t = useTranslations("Profile");
  const tValidation = useTranslations("Validation");
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () => createAthleteProfileSchema(tValidation),
    [tValidation],
  );

  const form = useForm<AthleteProfileInput>({
    resolver: zodResolver(schema) as Resolver<AthleteProfileInput>,
    mode: "onBlur",
    defaultValues: {
      username: "",
      avatarUrl: "",
      bio: "",
      country: "",
      birthDate: "",
      sports: [{ sportId: "", positionId: "", level: "amateur" }],
      status: "free",
      mobility: false,
      visibility: "private",
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sports",
  });

  const birthDate = form.watch("birthDate");
  const minor = birthDate ? isMinor(birthDate) : false;
  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  async function goNext() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  }

  function goPrevious() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function onSubmit(data: AthleteProfileInput) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await saveAthleteProfileAction(data);
      if (result.status === "error") {
        setSubmitError(result.message);
        return;
      }
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>{t("wizard.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("wizard.step", { current: stepIndex + 1, total: STEPS.length })}
        </p>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void goNext();
          }}
          className="flex flex-col gap-5"
          noValidate
        >
          {step === "identity" && (
            <div className="flex flex-col gap-4">
              <Field label={t("identity.username")} error={form.formState.errors.username?.message}>
                <Input {...form.register("username")} autoComplete="nickname" />
              </Field>
              <div>
                <Label>{t("identity.avatar")}</Label>
                <div className="mt-2">
                  <ImageUpload
                    onUpload={(url) => {
                      form.setValue("avatarUrl", url, { shouldValidate: true });
                    }}
                    currentImageUrl={form.watch("avatarUrl")}
                    label={t("identity.avatar")}
                  />
                </div>
              </div>
              <Field label={t("identity.bio")} error={form.formState.errors.bio?.message}>
                <Textarea {...form.register("bio")} rows={4} />
              </Field>
              <Field label={t("identity.country")} error={form.formState.errors.country?.message}>
                <Input {...form.register("country")} autoComplete="country-name" />
              </Field>
              <Field label={t("identity.birthDate")} error={form.formState.errors.birthDate?.message}>
                <Input
                  type="date"
                  {...form.register("birthDate")}
                  max={new Date().toISOString().split("T")[0]}
                />
              </Field>
              {minor && (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground" role="note">
                  {t("minorNotice")}
                </p>
              )}
            </div>
          )}

          {step === "sports" && (
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => {
                const selectedSportId = form.watch(`sports.${index}.sportId`);
                const positions =
                  sports.find((s) => s.id === selectedSportId)?.positions ?? [];
                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 rounded-md border border-border p-3"
                  >
                    <Field label={t("sports.sport")} error={form.formState.errors.sports?.[index]?.sportId?.message}>
                      <Select
                        value={form.watch(`sports.${index}.sportId`)}
                        onValueChange={(value) =>
                          form.setValue(`sports.${index}.sportId`, value, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sports.map((sport) => (
                            <SelectItem key={sport.id} value={sport.id}>
                              {sport.nameFr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label={t("sports.position")}>
                      <Select
                        value={form.watch(`sports.${index}.positionId`) || undefined}
                        onValueChange={(value) =>
                          form.setValue(`sports.${index}.positionId`, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.nameFr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label={t("sports.level")} error={form.formState.errors.sports?.[index]?.level?.message}>
                      <Select
                        value={form.watch(`sports.${index}.level`)}
                        onValueChange={(value) =>
                          form.setValue(
                            `sports.${index}.level`,
                            value as AthleteProfileInput["sports"][number]["level"],
                            { shouldValidate: true },
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORT_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {t(`sports.levels.${level}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        {t("sports.remove")}
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({ sportId: "", positionId: "", level: "amateur" })
                }
              >
                {t("sports.addSport")}
              </Button>
            </div>
          )}

          {step === "availability" && (
            <div className="flex flex-col gap-4">
              <Field label={t("availability.status")}>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) =>
                    form.setValue(
                      "status",
                      value as AthleteProfileInput["status"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`availability.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center gap-2">
                <input
                  id="mobility"
                  type="checkbox"
                  className="size-4 rounded border-input"
                  {...form.register("mobility")}
                />
                <Label htmlFor="mobility" className="font-normal">
                  {t("availability.mobility")}
                </Label>
              </div>
            </div>
          )}

          {step === "visibility" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">{t("visibility.title")}</p>
              {VISIBILITY_OPTIONS.filter(
                (option) => !minor || option !== "public",
              ).map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 has-[:checked]:border-primary"
                >
                  <input
                    type="radio"
                    value={option}
                    className="mt-1"
                    {...form.register("visibility")}
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      {t(`visibility.${option}`)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t(`visibility.${option === "public" ? "publicHint" : option === "verified_only" ? "verifiedOnlyHint" : "privateHint"}`)}
                    </span>
                  </span>
                </label>
              ))}
              {form.formState.errors.visibility && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.visibility.message}
                </p>
              )}
            </div>
          )}

          {submitError && (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrevious}
              disabled={stepIndex === 0}
            >
              {t("wizard.previous")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "…"
                : stepIndex === STEPS.length - 1
                  ? t("wizard.finish")
                  : t("wizard.next")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
