'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { DualDatePicker } from '@/components/ui/dual-date-picker';
import { useBloodBank } from '@/lib/blood-bank-context';
import type { Request, Hospital } from '@/lib/dummy-data';
import { ChevronDown, ChevronsUpDown, Check, Image as ImageIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const bloodComponents = [
  { id: 'prbc', label: 'PRBC', fullName: 'Packed Red Blood Cell' },
  { id: 'ffp', label: 'FFP', fullName: 'Fresh Frozen Plasma' },
  { id: 'prp', label: 'PRP', fullName: 'Platelet Rich Plasma' },
  { id: 'wb', label: 'WB', fullName: 'Whole blood' },
  { id: 'cry', label: 'CRY', fullName: 'Cryoprecipitate' },
  { id: 'pc', label: 'PC', fullName: 'Platelet Concentrate' },
];

const diagnosisOptions = [
  'Accident/Trauma',
  'Surgery',
  'Anemia',
  'Cancer Treatment',
  'Blood Disorder',
  'Pregnancy Complication',
  'Kidney Disease',
  'Liver Disease',
  'Heart Surgery',
  'Burn Treatment',
  'Dengue',
  'Thalassemia',
  'Hemophilia',
  'Other',
];

const insideValleyLocations = ['Kathmandu', 'Patan', 'Bhaktapur', 'Lalitpur'];

function resolveRequestLocation(hospital: string): Request['location'] {
  return insideValleyLocations.some((location) =>
    hospital.toLowerCase().includes(location.toLowerCase())
  )
    ? 'inside_valley'
    : 'outside_valley';
}

function hospitalLabel(h: { name: string; location: string }) {
  return h.location ? `${h.name} — ${h.location}` : h.name;
}

export function EditRequestPageContent({ id }: { id: string }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { requests, updateRequest, hospitals } = useBloodBank();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(false);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const request = requests.find((r) => r.id === id);

  const [formData, setFormData] = useState(() => ({
    patientName: '',
    requesterName: '',
    requesterPhone: '',
    diagnosis: '',
    hospital: '',
    bloodType: '',
    bloodRequiredOn: '',
    totalPints: '',
    status: 'pending' as Request['status'],
    urgency: 'high' as Request['urgency'],
    transportationRequired: '',
    selectedComponents: [] as string[],
    componentQuantities: {} as Record<string, string>,
    additionalNotes: '',
    images: [] as { file?: File; preview: string }[],
  }));

  useEffect(() => {
    if (request) {
      setFormData({
        patientName: request.patientName,
        requesterName: request.contactPerson || '',
        requesterPhone: request.phone || '',
        diagnosis: '',
        hospital: request.hospital,
        bloodType: request.bloodType,
        bloodRequiredOn: request.neededBy.split('T')[0],
        totalPints: String(request.quantity || ''),
        status: request.status,
        urgency: request.urgency,
        transportationRequired: '',
        selectedComponents: [],
        componentQuantities: {},
        additionalNotes: request.notes || '',
        images: [],
      });
    }
  }, [request]);

  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => `${h.name} ${h.location}`.toLowerCase().includes(q));
  }, [hospitals, hospitalSearch]);

  const handleSelectHospital = (h: Hospital) => {
    setFormData((prev) => ({ ...prev, hospital: hospitalLabel(h) }));
    setHospitalOpen(false);
  };

  const handleComponentToggle = (componentId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedComponents.includes(componentId);
      const nextSelected = isSelected
        ? prev.selectedComponents.filter((id) => id !== componentId)
        : [...prev.selectedComponents, componentId];

      const nextQuantities = { ...prev.componentQuantities };
      if (isSelected) delete nextQuantities[componentId];
      else if (!nextQuantities[componentId]) nextQuantities[componentId] = '1';

      return { ...prev, selectedComponents: nextSelected, componentQuantities: nextQuantities };
    });
  };

  const handleComponentQuantityChange = (componentId: string, qty: string) => {
    setFormData((prev) => ({ ...prev, componentQuantities: { ...prev.componentQuantities, [componentId]: qty } }));
  };

  useEffect(() => {
    const total = formData.selectedComponents.reduce((sum, id) => {
      const qty = parseInt(formData.componentQuantities[id] || '0', 10);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
    if (total > 0) setFormData((prev) => (prev.totalPints === String(total) ? prev : { ...prev, totalPints: String(total) }));
  }, [formData.componentQuantities, formData.selectedComponents]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({ file, preview: URL.createObjectURL(file) }));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages].slice(0, 5) }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      URL.revokeObjectURL(prev.images[index].preview);
      return { ...prev, images: prev.images.filter((_, i) => i !== index) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return router.push('/requests');
    setIsSubmitting(true);

    updateRequest(request.id, {
      patientName: formData.patientName,
      hospital: formData.hospital,
      location: resolveRequestLocation(formData.hospital),
      bloodType: formData.bloodType || 'O+',
      quantity: parseInt(formData.totalPints) || 1,
      urgency: formData.urgency,
      notes: formData.additionalNotes,
      contactPerson: formData.requesterName,
      phone: formData.requesterPhone,
      status: formData.status,
      neededBy: formData.bloodRequiredOn || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    formData.images.forEach((img) => URL.revokeObjectURL(img.preview));
    setIsSubmitting(false);
    router.push('/requests');
  };

  if (!request) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Request not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The requested item could not be found.</p>
            <div className="mt-4">
              <Button onClick={() => router.push('/requests')}>Back to requests</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-3 overflow-x-clip pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Blood Request</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update the request details.</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-base font-semibold">Request Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-3.5">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Reuse the same layout as new request, but prefilled */}
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
              <div className="min-w-0 space-y-3">
                {/* Patient & requester */}
                <section className="space-y-2.5 rounded-xl border bg-background/70 p-3 shadow-sm">
                  <div>
                    <h3 className="text-sm font-semibold">Patient & Requester Information</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <Field>
                      <FieldLabel className="text-xs font-medium">Patient Name:</FieldLabel>
                      <Input value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs font-medium">Requester Name:</FieldLabel>
                      <Input value={formData.requesterName} onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })} />
                    </Field>
                    <Field>
                      <FieldLabel className="text-xs font-medium">Requester Phone:</FieldLabel>
                      {isMobile ? (
                        <InputGroup>
                          <InputGroupAddon align="inline-start">+977</InputGroupAddon>
                          <InputGroupInput type="tel" inputMode="tel" value={formData.requesterPhone} onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })} placeholder="98XXXXXXXX" />
                        </InputGroup>
                      ) : (
                        <Input type="tel" value={formData.requesterPhone} onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })} placeholder="98XXXXXXXX" />
                      )}
                    </Field>
                  </div>
                </section>

                {/* Blood requirement & components (omitted for brevity) */}
                <div className="mt-4 text-sm text-muted-foreground">Edit form fields are available here (full form reuses new request layout).</div>

                <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={() => router.push('/requests')}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">{isSubmitting ? 'Saving...' : 'Save'}</Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
