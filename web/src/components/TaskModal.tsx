import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, Mic, MicOff } from "lucide-react";
import { createTask } from "../lib/api";
import { useSpeechCapture } from "../hooks/useSpeechCapture";

interface Props {
  onCreated: () => void;
}

interface FormValues {
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  estimatedDays: number;
  notes?: string;
}

export function TaskModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const { transcript, listening, supported, start } = useSpeechCapture();
  const [parsed, setParsed] = useState<Partial<FormValues>>({});
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: { priority: "Medium", category: "General", estimatedDays: 1, title: "" }
  });

  useEffect(() => {
    if (transcript) {
      const lower = transcript.toLowerCase();
      const matchPriority = lower.includes("high")
        ? "High"
        : lower.includes("low")
        ? "Low"
        : "Medium";
      const matchCategory =
        lower.includes("personal")
          ? "Personal"
          : lower.includes("finance")
          ? "Finance"
          : lower.includes("operations")
          ? "Operations"
          : lower.includes("procurement")
          ? "Procurement"
          : "General";
      const daysMatch = lower.match(/(\d+)\s*day/);
      const estimatedDays = daysMatch ? parseInt(daysMatch[1]) : undefined;
      setParsed({
        title: transcript,
        priority: matchPriority as FormValues["priority"],
        category: matchCategory,
        estimatedDays
      });
      setValue("title", transcript);
      if (estimatedDays) setValue("estimatedDays", estimatedDays);
      setValue("category", matchCategory);
      setValue("priority", matchPriority as any);
    }
  }, [transcript, setValue]);

  const onSubmit = async (values: FormValues) => {
    await createTask({ ...values, startAt: new Date().toISOString() });
    onCreated();
    reset();
    setOpen(false);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 btn-primary flex items-center gap-2 shadow-xl"
        onClick={() => setOpen(true)}
        aria-label="Add task"
      >
        <PlusCircle className="w-4 h-4" /> + Task 🎤
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quick Capture</h2>
              <button onClick={() => setOpen(false)} className="text-sm text-slate-400">Close</button>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <button
                className="btn-primary flex items-center gap-2"
                onClick={start}
                type="button"
                aria-label="Start recording"
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} Capture
              </button>
              <p className="text-xs text-slate-400">
                {supported
                  ? listening
                    ? "Listening..."
                    : transcript
                    ? `Heard: ${transcript}`
                    : "Press mic or type manually"
                  : "Speech API unsupported, type instead"}
              </p>
            </div>

            {parsed.estimatedDays === undefined && transcript && (
              <p className="text-amber-400 text-sm mb-2">Add estimated days before saving.</p>
            )}

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-sm">Title</label>
                <input {...register("title", { required: true })} placeholder="Task title" />
                {errors.title && <p className="text-red-400 text-xs">Title required</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Category</label>
                  <input {...register("category", { required: true })} />
                </div>
                <div>
                  <label className="text-sm">Priority</label>
                  <select {...register("priority", { required: true })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Estimated Days</label>
                  <input type="number" min={0} {...register("estimatedDays", { required: true, valueAsNumber: true })} />
                  {errors.estimatedDays && <p className="text-red-400 text-xs">Required</p>}
                </div>
                <div>
                  <label className="text-sm">Start Date</label>
                  <input value={new Date().toLocaleString()} readOnly />
                </div>
              </div>
              <div>
                <label className="text-sm">Notes</label>
                <textarea rows={3} {...register("notes")}></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={parsed.estimatedDays === undefined && !!transcript}>
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
