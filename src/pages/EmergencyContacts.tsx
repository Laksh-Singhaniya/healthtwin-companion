import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Phone, Plus, Trash2, Star } from "lucide-react";
import { NavLink } from "@/components/NavLink";

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  relationship: string | null;
  is_primary: boolean;
};

export default function EmergencyContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    is_primary: false,
  });

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching contacts", description: error.message, variant: "destructive" });
    } else {
      setContacts(data || []);
    }
  };

  const handleAddContact = async () => {
    if (!contactForm.name || !contactForm.phone) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("emergency_contacts").insert({
      user_id: user!.id,
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email || null,
      relationship: contactForm.relationship || null,
      is_primary: contactForm.is_primary,
    });

    if (error) {
      toast({ title: "Error adding contact", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contact added successfully" });
      setContactForm({ name: "", phone: "", email: "", relationship: "", is_primary: false });
      setShowForm(false);
      fetchContacts();
    }
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting contact", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contact deleted" });
      fetchContacts();
    }
  };

  const togglePrimary = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("emergency_contacts")
      .update({ is_primary: !currentValue })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating contact", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contact updated" });
      fetchContacts();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Emergency Contacts</h1>
            <div className="flex gap-4">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/health-monitoring">Vitals</NavLink>
              <NavLink to="/womens-health">Women's Health</NavLink>
              <NavLink to="/medications-allergies">Medications</NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>Manage your emergency contact information</CardDescription>
              </div>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showForm && (
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Full name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Spouse, Parent"
                      value={contactForm.relationship}
                      onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="primary"
                    checked={contactForm.is_primary}
                    onCheckedChange={(checked) => setContactForm({ ...contactForm, is_primary: checked as boolean })}
                  />
                  <Label htmlFor="primary" className="cursor-pointer">Set as primary contact</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddContact}>Save Contact</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{contact.name}</p>
                        {contact.is_primary && (
                          <Star className="w-4 h-4 fill-primary text-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </p>
                        {contact.email && (
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        )}
                        {contact.relationship && (
                          <p className="text-sm text-muted-foreground">
                            Relationship: {contact.relationship}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePrimary(contact.id, contact.is_primary)}
                        title="Toggle primary contact"
                      >
                        <Star className={`w-4 h-4 ${contact.is_primary ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && !showForm && (
                <p className="text-center text-muted-foreground py-8">No emergency contacts added</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
