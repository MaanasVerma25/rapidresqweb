import { supabase } from "@/lib/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Star, Trash2, Plus, Phone } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContacts } from "@/hooks/use-persistent";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Trusted contacts · RapidResQ" },
      { name: "description", content: "Manage the people RapidResQ alerts in an emergency." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const { contacts, upsert, remove, setPrimary } = useContacts();
  const [form, setForm] = useState({ name: "", phone: "", relationship: "" });

  async function add() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    const newC = {
      id: `c_${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship.trim() || "Contact",
      primary: contacts.length === 0,
    };
    upsert(newC);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("contacts").insert({
        user_id: session.user.id,
        name: newC.name,
        phone: newC.phone,
        relationship: newC.relationship,
        is_primary: newC.primary,
      });
    }

    setForm({ name: "", phone: "", relationship: "" });
    toast.success("Contact added");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Trusted contacts</h1>
          <p className="mt-1 text-muted-foreground">
            They'll be notified the moment RapidResQ detects an emergency.
          </p>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="n">Name</Label>
              <Input
                id="n"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mom"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p">Phone</Label>
              <Input
                id="p"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 0100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r">Relationship</Label>
              <Input
                id="r"
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                placeholder="Family / Friend"
              />
            </div>
            <Button onClick={add} className="self-end">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {contacts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No contacts yet.
              </CardContent>
            </Card>
          )}
          {contacts.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-hero font-display text-lg font-semibold text-primary-foreground">
                  {c.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.primary && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {c.phone} · {c.relationship}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setPrimary(c.id)}
                    aria-label="Mark as primary"
                  >
                    <Star className={cn("h-4 w-4", c.primary && "fill-accent text-accent")} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      remove(c.id);
                      const {
                        data: { session },
                      } = await supabase.auth.getSession();
                      if (session) {
                        await supabase
                          .from("contacts")
                          .delete()
                          .eq("name", c.name)
                          .eq("user_id", session.user.id);
                      }
                      toast("Contact removed");
                    }}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
